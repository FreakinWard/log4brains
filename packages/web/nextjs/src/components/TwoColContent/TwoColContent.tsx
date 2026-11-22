import React from "react";
import { styled } from "@mui/material/styles";

const Root = styled("div")({
  display: "flex"
});

const LeftCol = styled("div")(({ theme }) => ({
  flexGrow: 0.5,
  [theme.breakpoints.down("lg")]: {
    display: "none"
  }
}));

const CenterCol = styled("div")(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  flexGrow: 1,
  overflowWrap: "anywhere",
  [theme.breakpoints.up("md")]: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: `${theme.custom.layout.centerColBasis}px`,
    paddingLeft: `${theme.custom.layout.centerColPadding}px`,
    paddingRight: `${theme.custom.layout.centerColPadding}px`
  },
  "& img": {
    maxWidth: "100%"
  }
}));

const RightCol = styled("div")(({ theme }) => ({
  flexGrow: 1,
  flexBasis: `${theme.custom.layout.rightColBasis}px`,
  [theme.breakpoints.down("lg")]: {
    display: "none"
  },
  position: "sticky",
  top: theme.spacing(14), // TODO: calculate it based on AdrBrowserLayout's topSpace var
  alignSelf: "flex-start",
  paddingLeft: theme.spacing(2),
  minWidth: "20ch"
}));

type TwoColContentProps = {
  className?: string;
  children: React.ReactNode;
  rightColContent?: React.ReactNode;
};

export function TwoColContent({
  className,
  children,
  rightColContent
}: TwoColContentProps) {
  return (
    <Root className={className}>
      <LeftCol />
      <CenterCol>{children}</CenterCol>
      <RightCol>{rightColContent}</RightCol>
    </Root>
  );
}
