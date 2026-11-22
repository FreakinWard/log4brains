// Storybook 10 framework-based config on @storybook/nextjs.
// The built-in Next.js framework provides next/image, next/font, transpilePackages
// and the webpack setup, so the former next/image DefinePlugin workaround is gone.
// Essentials (controls, actions, viewport, backgrounds, toolbars…) ship in Storybook
// core since v9, so there is no @storybook/addon-essentials to register anymore.

/** @type {import('@storybook/nextjs').StorybookConfig} */
module.exports = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  // Serve the Next.js public/ directory so stories resolve the same root-relative
  // assets as the app (favicon.ico, l4b-static/*). Without it the preview iframe's
  // automatic /favicon.ico request 404s and shows up as a console error.
  staticDirs: ["../public"],
  framework: {
    name: "@storybook/nextjs",
    options: {}
  }
};
