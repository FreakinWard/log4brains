import type { Meta, StoryObj } from "@storybook/nextjs";
import { AdrBrowserLayout } from "..";
import { adrMocks } from "../../../.storybook/mocks";
import { toAdrLight } from "../../lib-shared/types";

const meta: Meta<typeof AdrBrowserLayout> = {
  title: "Layouts/AdrBrowser",
  component: AdrBrowserLayout
};
export default meta;

type Story = StoryObj<typeof AdrBrowserLayout>;

export const Default: Story = { args: { adrs: adrMocks.map(toAdrLight) } };

export const LoadingMenu: Story = { args: {} };

export const ReloadingMenu: Story = {
  args: { adrs: adrMocks.map(toAdrLight), adrsReloading: true }
};

export const EmptyMenu: Story = { args: { adrs: [] } };

export const RoutingProgressBar: Story = {
  args: { adrs: adrMocks.map(toAdrLight), routing: true }
};
