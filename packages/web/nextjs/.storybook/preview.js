import React from "react";
import { MuiDecorator } from "../src/mui";
import "highlight.js/styles/github.css";
import "../src/components/Markdown/hljs.css";

// The app's MUI theme (ThemeProvider + CssBaseline) is applied to every story.
// @storybook/nextjs renders next/image natively, so no next/image mock is needed.

/** @type {import('@storybook/nextjs').Preview} */
const preview = {
  decorators: [
    (Story) => (
      <MuiDecorator>
        <Story />
      </MuiDecorator>
    )
  ]
};

export default preview;
