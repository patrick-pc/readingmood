import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <meta property="og:url" content="https://readingmood.xyz/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="readingmood" />
        <meta
          property="og:description"
          content="Create a spotify playlist that matches the vibe of your favorite book."
        />
        <meta property="og:site_name" content="readingmood" />
        <meta property="og:image" content="https://readingmood.xyz/img/og-image.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="readingmood" />
        <meta
          name="twitter:description"
          content="Create a spotify playlist that matches the vibe of your favorite book."
        />
        <meta name="twitter:image" content="https://readingmood.xyz/img/og-image.png" />

        <meta name="theme-color" content="#000000" />

        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
