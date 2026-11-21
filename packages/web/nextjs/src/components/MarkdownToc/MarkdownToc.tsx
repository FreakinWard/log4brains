import React from "react";
import { Link as MuiLink, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Toc as TocModel,
  TocBuilder as TocModelBuilder
} from "../../lib/toc-utils";
import { MarkdownHeading, MarkdownHeadingProps } from "../MarkdownHeading";

const Root = styled("div")({
  "& > ul": {
    padding: "0 !important"
  }
});

const Title = styled(Typography)(({ theme }) => ({
  paddingBottom: theme.spacing(1)
}));

const TocList = styled("ul")({
  listStyleType: "none",
  paddingLeft: "1rem"
});

function variantToLevel(variant: string): number {
  return parseInt(variant.replace("h", ""), 10);
}

function isMarkdownHeadingElement(
  element: React.JSX.Element
): element is React.ReactElement<MarkdownHeadingProps> {
  return typeof element.type === "function" && element.type === MarkdownHeading;
}

function buildTocModelFromContent(
  content: React.ReactElement,
  levelStart = 1
): TocModel {
  const builder = new TocModelBuilder();
  React.Children.forEach(content, (element) => {
    if (isMarkdownHeadingElement(element)) {
      builder.addSection(
        variantToLevel(element.props.variant) - levelStart + 1,
        element.props.children,
        element.props.id
      );
    }
  });

  return builder.getToc();
}

type TocSectionProps = {
  children: React.ReactNode;
  title: string;
  id: string;
};

function TocSection({ title, id, children }: TocSectionProps) {
  return (
    <li>
      <MuiLink href={`#${id}`}>{title}</MuiLink>
      {children ? <TocList>{children}</TocList> : null}
    </li>
  );
}

export type MarkdownTocProps = {
  className?: string;
  content?: React.ReactElement;
  levelStart?: number;
};

export function MarkdownToc({
  className,
  content,
  levelStart = 1
}: MarkdownTocProps) {
  if (!content) {
    return null;
  }

  const model = buildTocModelFromContent(content, levelStart);
  if (model.children.length === 0) {
    return null;
  }

  return (
    <Root className={className}>
      <Title variant="subtitle2">Table of contents</Title>
      <TocList>
        {model.render(
          (title: string, id: string, children: React.JSX.Element[]) => (
            <TocSection title={title} id={id} key={id}>
              {children}
            </TocSection>
          )
        )}
      </TocList>
    </Root>
  );
}
