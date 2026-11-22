import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { AdrScene } from "./AdrScene";
import { adrMocks, getMockedAdrBySlug } from "../../../.storybook/mocks";
import { Log4brainsMode, Log4brainsModeContext } from "../../contexts";
import { toAdrLight } from "../../lib-shared/types";
import { AdrBrowserLayout } from "../../layouts";

const meta: Meta<typeof AdrScene> = {
  title: "Scenes/ADR",
  component: AdrScene,
  render: (args) => (
    <AdrBrowserLayout adrs={adrMocks.map(toAdrLight)} {...args}>
      <AdrScene {...args} />
    </AdrBrowserLayout>
  )
};
export default meta;

type Story = StoryObj<typeof AdrScene>;

export const FirstAdrWithLongTitle: Story = {
  args: { currentAdr: adrMocks[0] }
};

export const LastAdr: Story = {
  args: { currentAdr: adrMocks[adrMocks.length - 1] }
};

export const PreviewMode: Story = {
  args: { currentAdr: adrMocks[adrMocks.length - 1] },
  decorators: [
    (Story) => (
      <Log4brainsModeContext.Provider value={Log4brainsMode.preview}>
        <Story />
      </Log4brainsModeContext.Provider>
    )
  ]
};

export const LotOfDeciders: Story = {
  args: { currentAdr: getMockedAdrBySlug("backend/20200405-lot-of-deciders") }
};

export const Superseded: Story = {
  args: { currentAdr: getMockedAdrBySlug("20200106-an-old-decision") }
};

export const Superseder: Story = {
  args: { currentAdr: getMockedAdrBySlug("20200404-a-new-decision") }
};
