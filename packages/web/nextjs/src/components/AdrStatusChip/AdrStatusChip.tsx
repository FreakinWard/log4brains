import React from "react";
import { Chip } from "@mui/material";
import {
  grey,
  indigo,
  deepOrange,
  lightGreen,
  brown
} from "@mui/material/colors";
import type { AdrDtoStatus } from "@log4brains/core";
import { styled } from "@mui/material/styles";

const statusColors: Record<AdrDtoStatus, string> = {
  draft: grey[800],
  proposed: indigo[800],
  rejected: deepOrange[800],
  accepted: lightGreen[800],
  deprecated: brown[600],
  superseded: brown[600]
};

// Styles are inspired by the MUI "Badge" styles
const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "status"
})<{ status: AdrDtoStatus }>(({ theme, status }) => ({
  fontSize: "0.74rem",
  fontWeight: Number(theme.typography.fontWeightMedium),
  height: "18px",
  verticalAlign: "text-bottom",
  color: statusColors[status],
  "& .MuiChip-labelSmall": {
    padding: "0 6px"
  }
}));

export type AdrStatusChipProps = {
  className?: string;
  status: AdrDtoStatus;
};

export function AdrStatusChip({ className, status }: AdrStatusChipProps) {
  return (
    <StatusChip
      variant="outlined"
      size="small"
      label={status.toUpperCase()}
      className={className}
      status={status}
    />
  );
}
