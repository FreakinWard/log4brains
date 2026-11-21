import React from "react";
import { AdrDtoStatus } from "@log4brains/core";
import { Link as MuiLink } from "@mui/material";
import Link from "next/link";
import { styled } from "@mui/material/styles";

const struckStatuses: AdrDtoStatus[] = ["rejected", "deprecated", "superseded"];

/**
 * Link to an ADR, struck through when the ADR is no longer active.
 */
export const AdrStatusLink = styled(MuiLink, {
  shouldForwardProp: (prop) => prop !== "status"
})<{ status: AdrDtoStatus }>(({ status }) =>
  struckStatuses.includes(status) ? { textDecoration: "line-through" } : {}
);

type AdrLinkProps = {
  slug: string;
  status: AdrDtoStatus;
  // eslint-disable-next-line react/no-unused-prop-types
  package?: string;
  title?: string;
  customLabel?: string;
};

export function AdrLink({ slug, status, title, customLabel }: AdrLinkProps) {
  return (
    <Link href={`/adr/${slug}`} passHref>
      <AdrStatusLink status={status}>
        {customLabel || title || "Untitled"}
      </AdrStatusLink>
    </Link>
  );
}
