import React from "react";
import { AdrDtoStatus } from "@freakin-ward/log4brains-core";
import { styled } from "@mui/material/styles";
import { RouterLink } from "../../../RouterLink";

const struckStatuses: AdrDtoStatus[] = ["rejected", "deprecated", "superseded"];

/**
 * Link to an ADR, struck through when the ADR is no longer active.
 */
export const AdrStatusLink = styled(RouterLink, {
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
    <AdrStatusLink href={`/adr/${slug}`} status={status}>
      {customLabel || title || "Untitled"}
    </AdrStatusLink>
  );
}
