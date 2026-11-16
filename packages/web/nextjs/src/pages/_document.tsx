import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { theme } from "../mui";

// MUI v5 styles (Emotion) are rendered inline during SSR: no style extraction needed here

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* PWA primary color */}
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
            rel="stylesheet"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@300;400;500;700&display=swap"
          />
        </Head>
        <body>
          <Main />

          {!process.env.NEXT_PUBLIC_LOG4BRAINS_STATIC && (
            <script src="/socket.io/socket.io.js" />
          )}

          <NextScript />
        </body>
      </Html>
    );
  }
}
