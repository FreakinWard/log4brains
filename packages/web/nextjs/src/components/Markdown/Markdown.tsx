import React, { useEffect, useMemo } from "react";
import { compiler as mdCompiler } from "markdown-to-jsx/react";
import { useRouter } from "next/router";
import hljs from "highlight.js";
import { Typography, Link as MuiLink, TypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { AdrLink } from "./components";
import { MarkdownHeading } from "../MarkdownHeading";
import { slugify } from "../../lib/slugify";

// Typography's `paragraph` prop, removed in MUI v9
const Paragraph = styled(Typography)({
  marginBottom: "16px"
});

const Code = styled("code")(({ theme }) => ({
  backgroundColor: "#F8F8F8",
  borderRadius: `${theme.shape.borderRadius}px`,
  padding: "3px"
}));

function Li(props: TypographyProps) {
  return (
    <li>
      <Typography component="span" {...props} />
    </li>
  );
}

const options = {
  overrides: {
    h1: {
      component: Typography,
      props: { variant: "h3", component: "h1", gutterBottom: true }
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
    },
    p: { component: Paragraph },
    a: { component: MuiLink },
    li: { component: Li },
    AdrLink: { component: AdrLink },
    code: { component: Code }
  },
  slugify
};

type MarkdownProps = {
  children: string;
  onCompiled?: (content: React.ReactElement) => void;
};

function isReactElementWithChildren(
  obj: React.ReactNode
): obj is React.ReactElement<{ children: React.ReactElement }> {
  return (
    React.isValidElement<Record<string, unknown>>(obj) &&
    "children" in obj.props
  ); // TODO: improve tests here
}

export function Markdown({ children, onCompiled }: MarkdownProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const router = useRouter();

  const renderedMarkdown = useMemo(
    () =>
      mdCompiler(
        children.replace(
          // Fix for `index.md`'s adr-workflow.png image path
          // TODO: support local images (https://github.com/thomvaill/log4brains/issues/4)
          /\((\/l4b-static\/[^)]+)\)/g,
          `(${router?.basePath}$1)`
        ),
        options
      ),
    [children, router]
  );

  useEffect(() => {
    if (onCompiled && isReactElementWithChildren(renderedMarkdown)) {
      onCompiled(renderedMarkdown.props.children);
    }
  }, [children, renderedMarkdown, onCompiled]);

  useEffect(() => {
    if (isReactElementWithChildren(renderedMarkdown)) {
      rootRef.current
        ?.querySelectorAll<HTMLElement>("pre code")
        .forEach((block) => {
          // Hot Reload re-renders the same elements: highlight.js 11 skips the ones it already highlighted
          block.removeAttribute("data-highlighted");
          hljs.highlightElement(block);
        });
    }
  }, [children, renderedMarkdown]);

  return <div ref={rootRef}>{renderedMarkdown}</div>;
}
