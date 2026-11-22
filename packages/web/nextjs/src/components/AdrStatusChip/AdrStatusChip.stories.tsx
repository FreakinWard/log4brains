import type { Meta, StoryObj } from "@storybook/nextjs";
import { AdrStatusChip } from "./AdrStatusChip";

const meta: Meta<typeof AdrStatusChip> = {
  title: "AdrStatusChip",
  component: AdrStatusChip
};
export default meta;

type Story = StoryObj<typeof AdrStatusChip>;

export const Draft: Story = { args: { status: "draft" } };

export const Proposed: Story = { args: { status: "proposed" } };

export const Rejected: Story = { args: { status: "rejected" } };

export const Accepted: Story = { args: { status: "accepted" } };

export const Deprecated: Story = { args: { status: "deprecated" } };

export const Superseded: Story = { args: { status: "superseded" } };
