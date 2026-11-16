import React from "react";
import { Typography, TypographyClassKey, Link as MuiLink } from "@mui/material";
import { styled } from "@mui/material/styles";

// Only visible when the heading is hovered
const PermanentLink = styled(MuiLink)(({ theme }) => ({
  marginLeft: "0.3ch",
  color: "inherit",
  "&:hover": {
    color: theme.palette.primary.main
  },
  visibility: "hidden",
  "*:hover > &": {
    visibility: "visible"
  }
}));

export type MarkdownHeadingProps = {
  children: string;
  id: string;
  variant: "h1" | "h2" | "h3" | "h4";
  className?: string;
};

export function MarkdownHeading({
  id,
  children,
  variant,
  className
}: MarkdownHeadingProps) {
  let typographyVariant: TypographyClassKey;
  switch (variant) {
    case "h1":
      typographyVariant = "h3";
      break;
    case "h2":
      typographyVariant = "h4";
      break;
    case "h3":
      typographyVariant = "h5";
      break;
    case "h4":
      typographyVariant = "h6";
      break;
    default:
      typographyVariant = "h6";
      break;
  }
  return (
    <Typography
      gutterBottom
      variant={typographyVariant}
      component={variant}
      id={id}
      className={className}
    >
      {children}
      <PermanentLink href={`#${id}`} title="Permanent link">
        ¶
      </PermanentLink>
    </Typography>
  );
}
