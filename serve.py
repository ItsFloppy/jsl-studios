#!/usr/bin/env python3
"""Development server for the JSL Studios site.

Use this rather than `python -m http.server`. The stdlib server sends
`Last-Modified` but no `Cache-Control` and no `ETag`, which leaves the browser
free to apply *heuristic* freshness: it may reuse a cached copy of a page for a
while without revalidating. While the site is being edited that reads as "my
change did nothing" — the file on disk is new, the page on screen is old.

Sending `no-store` removes the guesswork, so a plain reload always shows what is
actually on disk.
"""

import argparse
import contextlib
import functools
import http.server
import os
import socket
import sys

# Serve the site's own folder, whatever directory the script is launched from.
ROOT = os.path.dirname(os.path.abspath(__file__))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    # An idle or half-open connection gives up after this many seconds instead of
    # holding its thread forever.
    timeout = 10
    # Python's MIME table (read from the OS registry on Windows) may not know these.
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".webp": "image/webp", ".woff2": "font/woff2", ".svg": "image/svg+xml"}

    def send_head(self):
        # Mirror the routing Netlify applies in production (see _redirects), so a clean
        # URL is not something that only works once deployed.
        raw = self.path.split("?", 1)[0].split("#", 1)[0]
        rest = self.path[len(raw):]

        # Netlify's edge strips a trailing slash before its rules run, so /about/ and
        # /about are the same page there. Do the same here rather than 404.
        if raw != "/" and raw.endswith("/"):
            return self._redirect(raw.rstrip("/") + rest)

        # /studios.html -> 301 -> /studios, and /index.html -> /.
        if raw.endswith(".html"):
            stem = raw[: -len(".html")]
            return self._redirect(("/" if stem == "/index" else stem) + rest)

        # /studios -> serve studios.html, with the address bar left alone.
        if raw != "/" and not os.path.splitext(raw)[1]:
            on_disk = os.path.join(ROOT, raw.lstrip("/").replace("/", os.sep) + ".html")
            if os.path.isfile(on_disk):
                self.path = raw + ".html" + rest

        return super().send_head()

    def _redirect(self, location):
        self.send_response(301)
        self.send_header("Location", location)
        self.send_header("Content-Length", "0")
        self.end_headers()
        return None          # nothing further to write, as for a directory redirect

    def list_directory(self, path):
        # No directory listings: a folder URL is a 404, as on the production hosts.
        self.send_error(404, "File not found")
        return None

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        # `no-store` only governs responses from here on; it does nothing about copies
        # the browser cached earlier. That matters when an asset is deleted or replaced:
        # the old copy can keep rendering, and the page looks unchanged or — worse —
        # shows a file that no longer exists on disk. Asking the browser to drop this
        # origin's cache when it loads a page makes the disk the only source of truth.
        if self._is_document():
            self.send_header("Clear-Site-Data", '"cache"')
        super().end_headers()

    def _is_document(self):
        # A request rejected while being parsed (bad request line, HTTP/2, a TLS hello)
        # reaches the error response before `path` has been set.
        path = getattr(self, "path", "").split("?", 1)[0].split("#", 1)[0]
        # A clean URL such as /studios carries no extension but is still a document.
        # Without that last test those pages would stop sending Clear-Site-Data, and the
        # stale-asset problem this whole file exists to prevent would come back.
        return (path.endswith("/") or path.endswith(".html")
                or not os.path.splitext(path)[1])

    def send_header(self, keyword, value):
        # Last-Modified is what triggers heuristic caching in the first place,
        # and dropping it also stops the browser sending If-Modified-Since and
        # getting a 304 back for a file that has since changed.
        if keyword == "Last-Modified":
            return
        super().send_header(keyword, value)


class Server(http.server.ThreadingHTTPServer):
    # One thread per request, so a page's parallel asset requests aren't served in series.
    # SO_REUSEADDR means different things per platform. On POSIX it only skips TIME_WAIT.
    # On Windows it lets a second process bind a port that is already in use: both then
    # listen, requests go to whichever won the race, and a stale server can answer in
    # place of this one -- at which point clean URLs 404 for no visible reason. Off on
    # Windows, so a busy port is a plain error that main() can explain.
    allow_reuse_address = os.name != "nt"
    address_family = socket.AF_INET


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("-p", "--port", type=int, default=8000)
    ap.add_argument("-b", "--bind", default="127.0.0.1")
    args = ap.parse_args()

    handler = functools.partial(NoCacheHandler, directory=ROOT)
    try:
        httpd = Server((args.bind, args.port), handler)
    except OSError as exc:
        print(f"Cannot serve on {args.bind}:{args.port} - {exc}", file=sys.stderr)
        print("Something is already using that port.", file=sys.stderr)
        print("If it is `python -m http.server`, stop it: that server cannot rewrite",
              file=sys.stderr)
        print("clean URLs, so /studios 404s while /studios.html still works.",
              file=sys.stderr)
        print("It may also be an older copy of this server still running from",
              file=sys.stderr)
        print("an earlier session. Find it with:  netstat -ano | findstr :%d" % args.port,
              file=sys.stderr)
        print("Or use -p to pick a different port.", file=sys.stderr)
        raise SystemExit(1)

    with contextlib.closing(httpd):
        print(f"JSL Studios — serving on http://{args.bind}:{args.port}/  (caching disabled)")
        print("Clean URLs on: /studios, /about, ... ; /studios.html redirects to /studios.")
        print("Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped")


if __name__ == "__main__":
    main()
