// Storybook 10 framework-based config on @storybook/nextjs.
// The built-in Next.js framework provides next/image, next/font, transpilePackages
// and the webpack setup, so the former next/image DefinePlugin workaround is gone.
// Essentials (controls, actions, viewport, backgrounds, toolbars…) ship in Storybook
// core since v9, so there is no @storybook/addon-essentials to register anymore.

/** @type {import('@storybook/nextjs').StorybookConfig} */
module.exports = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  framework: {
    name: "@storybook/nextjs",
    options: {}
  }
};
