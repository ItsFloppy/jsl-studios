import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'

/**
 * Newsletter sign-ups from the home page form (newsletterBind() in lib/behaviors/site.ts),
 * passed on to Mailchimp from the server: the visitor's browser only ever talks to this
 * site, and the site CSP stays first party.
 *
 * Double opt-in: a new address goes in as "pending" and Mailchimp emails it a confirmation
 * link, which is the record of consent. PUT on the member's hash rather than POST, so
 * signing up twice is not an error.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; website?: unknown } | null

  // Trap field, invisible to a person: a bot that fills it is told it worked rather than
  // that it was caught.
  if (!body || body.website) return NextResponse.json({ ok: true })

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (email.length > 254 || !EMAIL_RE.test(email)) return fail('This email address does not look valid.', 400)

  const key = process.env.MAILCHIMP_API_KEY ?? ''
  const audience = process.env.MAILCHIMP_AUDIENCE_ID ?? ''
  // The key ends with its data centre ("…-us21"), which is also the API's host name.
  const dc = key.split('-').pop() ?? ''
  if (!key || !audience || !/^[a-z]+\d+$/.test(dc)) {
    console.error('newsletter: MAILCHIMP_API_KEY or MAILCHIMP_AUDIENCE_ID is missing or malformed')
    return fail('Sign-up is unavailable right now. Please try again later.', 503)
  }

  const hash = createHash('md5').update(email.toLowerCase()).digest('hex')
  let res: Response
  try {
    res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${encodeURIComponent(audience)}/members/${hash}`, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${Buffer.from(`jsl:${key}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address: email, status_if_new: 'pending' }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
  } catch (err) {
    console.error('newsletter: Mailchimp unreachable', err)
    return fail('Sign-up is unavailable right now. Please try again later.', 502)
  }
  if (res.ok) return NextResponse.json({ ok: true })

  const detail = (await res.json().catch(() => null)) as { title?: string; detail?: string } | null
  console.error('newsletter: Mailchimp', res.status, detail?.title, detail?.detail)
  // 400: Mailchimp refuses this address (it looks fake, or its owner unsubscribed or had it
  // deleted, and only they can sign up again from Mailchimp's own form).
  if (res.status === 400) return fail('This address cannot be signed up. Please try another one.', 400)
  return fail('Sign-up is unavailable right now. Please try again later.', 502)
}
