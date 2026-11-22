import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { compiler as mdCompiler } from "markdown-to-jsx/react";
import { MarkdownHeading } from "../MarkdownHeading";
import { MarkdownToc } from "./MarkdownToc";

const markdown = `# Header 1
Lorem Ipsum

## Header 1.1

### Header 1.1.1

### Header 1.1.2

## Header 1.2

#### Subtitle without direct parent

test

# Header 2

hello`;

const options = {
  overrides: {
    h1: {
      component: MarkdownHeading,
      props: { variant: "h1" }
    },
    h2: {
      component: MarkdownHeading,
      props: { variant: "h2" }
    },
    h3: {
      component: MarkdownHeading,
      props: { variant: "h3" }
    },
    h4: {
      component: MarkdownHeading,
      props: { variant: "h4" }
    }
  }
};

const content = mdCompiler(markdown, options) as React.ReactElement<{
  children: React.ReactElement;
}>;

const meta: Meta<typeof MarkdownToc> = {
  title: "MarkdownToc",
  component: MarkdownToc
};
export default meta;

type Story = StoryObj<typeof MarkdownToc>;

export const Default: Story = {
  render: () => <MarkdownToc content={content.props.children} />
};
