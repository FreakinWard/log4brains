import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { IndexScene } from "./IndexScene";
import { Log4brainsMode, Log4brainsModeContext } from "../../contexts";
import { adrMocks } from "../../../.storybook/mocks";
import { toAdrLight } from "../../lib-shared/types";
import { AdrBrowserLayout } from "../../layouts";

const markdown = `# Hello World

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vitae dapibus libero. Praesent at ipsum non tellus tempus porta. Quisque tempus aliquam mi. Morbi ullamcorper tortor dui, a congue diam efficitur elementum. Nullam vestibulum posuere ante in condimentum. Donec volutpat orci ut semper elementum. Phasellus finibus est orci, ac posuere arcu imperdiet et. Nam lobortis tellus nunc, vel hendrerit ligula vestibulum a. Nulla dolor tellus, placerat sit amet bibendum quis, ullamcorper sit amet neque. Maecenas ac lectus iaculis ipsum iaculis finibus a non diam.

Mauris nec diam felis. Proin rutrum luctus augue malesuada eleifend. Phasellus luctus interdum convallis. Praesent vel nisi nec nunc rhoncus finibus. Sed maximus, lacus ut viverra rhoncus, augue sem tincidunt mi, id cursus mi nibh in nisi. Maecenas egestas, lectus suscipit euismod mollis, nisi nisl lobortis tellus, sed ullamcorper nibh eros a nisi. Cras finibus ante id tincidunt mollis. In ac lobortis turpis, varius placerat nisi. Sed in tincidunt sem, eu volutpat dolor. Donec vitae mauris porttitor, pellentesque dui eget, convallis nibh. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam lobortis congue nisl, vel feugiat felis porttitor et. Phasellus commodo quis erat quis porttitor. Pellentesque mollis, risus ac ullamcorper eleifend, justo urna pharetra ex, vitae pellentesque neque nunc quis orci. Suspendisse potenti.
`;

const meta: Meta<typeof IndexScene> = {
  title: "Scenes/Index",
  component: IndexScene,
  render: (args) => (
    <AdrBrowserLayout adrs={adrMocks.map(toAdrLight)}>
      <IndexScene {...args} />
    </AdrBrowserLayout>
  )
};
export default meta;

type Story = StoryObj<typeof IndexScene>;

export const Default: Story = {
  args: { markdown }
};

export const PreviewMode: Story = {
  args: { markdown },
  decorators: [
    (Story) => (
      <Log4brainsModeContext.Provider value={Log4brainsMode.preview}>
        <Story />
      </Log4brainsModeContext.Provider>
    )
  ]
};
