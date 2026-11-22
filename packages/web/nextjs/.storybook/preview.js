import React from "react";
import { MuiDecorator } from "../src/mui";
import "highlight.js/styles/github.css";
import "../src/components/Markdown/hljs.css";

// The app's MUI theme (ThemeProvider + CssBaseline) is applied to every story.
// @storybook/nextjs renders next/image natively, so no next/image mock is needed.

/** @type {import('@storybook/nextjs').Preview} */
const preview = {
  parameters: {
    // Match production Next.js, where basePath is "" by default. The @storybook/nextjs
    // mock router otherwise defaults basePath to "/", turning `${basePath}/l4b-static/x`
    // into a protocol-relative `//l4b-static/x` that resolves to a bogus host.
    nextjs: {
      router: { basePath: "" }
    }
  },
  decorators: [
    (Story) => (
      <MuiDecorator>
        <Story />
      </MuiDecorator>
    )
  ]
};

export default preview;
