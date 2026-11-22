import React from "react";
import NextLink from "next/link";
import { Link as MuiLink, LinkProps as MuiLinkProps } from "@mui/material";

export type RouterLinkProps = MuiLinkProps<typeof NextLink>;

/**
 * MUI link that navigates with the Next.js router (client-side navigation and prefetching).
 */
export function RouterLink(props: RouterLinkProps) {
  return <MuiLink component={NextLink} {...props} />;
}
