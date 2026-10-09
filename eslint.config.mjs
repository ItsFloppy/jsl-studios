import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The pages keep the static site's plain <img> for its own /public images: they are
      // already sized and encoded, and sending them through the optimizer would only spend
      // Netlify credits. Sanity images do go through next/image.
      '@next/next/no-img-element': 'off',
      // The copy is English prose full of apostrophes and quotes; escaping every one of
      // them would make the text unreadable in source.
      'react/no-unescaped-entities': 'off',
      // Internal links stay plain <a>: every page is a full load, which the page scripts
      // rely on (see components/SiteHeader.tsx).
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
