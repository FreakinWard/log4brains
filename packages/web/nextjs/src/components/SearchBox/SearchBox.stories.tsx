import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { AppBar, Toolbar } from "@mui/material";
import { SearchBox } from "./SearchBox";
import { adrMocks } from "../../../.storybook/mocks";

const meta: Meta<typeof SearchBox> = {
  title: "SearchBox",
  component: SearchBox,
  decorators: [
    (Story) => (
      <AppBar>
        <Toolbar style={{ justifyContent: "center" }}>
          <div style={{ width: 750 }}>
            <Story />
          </div>
        </Toolbar>
      </AppBar>
    )
  ]
};
export default meta;

type Story = StoryObj<typeof SearchBox>;

export const Closed: Story = { args: {} };

export const Open: Story = {
  args: {
    open: true
  }
};

export const OpenWithResults: Story = {
  args: {
    open: true,
    query: "Test",
    results: adrMocks.map((adr) => ({
      title: adr.title,
      href: `/adr/${adr.slug}`
    }))
  }
};

export const OpenLoading: Story = {
  args: {
    open: true,
    query: "test",
    results: [],
    loading: true
  }
};

export const OpenWithoutResults: Story = {
  args: {
    open: true,
    query: "cdlifsdilhfsd",
    results: []
  }
};
