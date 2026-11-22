import React from "react";
import moment from "moment";
import {
  Typography,
  Link as MuiLink,
  Fab,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator
} from "@mui/lab";

import {
  EmojiFlags as EmojiFlagsIcon,
  CropFree as CropFreeIcon,
  Add as AddIcon
} from "@mui/icons-material";

import { Log4brainsMode, Log4brainsModeContext } from "../../../../contexts";
import { AdrStatusChip } from "../../../../components";
import { AdrStatusLink } from "../../../../components/Markdown/components/AdrLink";
import { AdrLight } from "../../../../lib-shared/types";

// The dot and connector of an ADR item
const connectorSelector =
  "& .MuiTimelineDot-root, & .MuiTimelineConnector-root";

// TimelineItem detects its TimelineOppositeContent child by type: it must not be wrapped with styled()
const oppositeContentSelector = "& .MuiTimelineOppositeContent-root";

const NewAdrItem = styled(TimelineItem)({
  [oppositeContentSelector]: {
    flex: "0 0 calc(12ch - 11.5px)"
  }
});

const StartItem = styled(TimelineItem)({
  [oppositeContentSelector]: {
    flex: "0 0 calc(12ch - 12px)"
  }
});

const AdrItem = styled(TimelineItem, {
  shouldForwardProp: (prop) => prop !== "selected"
})<{ selected: boolean }>(({ theme, selected }) =>
  selected
    ? {
        "&:hover": {
          [connectorSelector]: {
            backgroundColor: theme.palette.secondary.main
          }
        },
        [connectorSelector]: {
          backgroundColor: theme.palette.secondary.main
        },
        "& .MuiLink-root": {
          color: theme.palette.secondary.main,
          "&:hover": {
            color: theme.palette.secondary.main
          }
        }
      }
    : {
        "&:hover": {
          [connectorSelector]: {
            backgroundColor: theme.palette.primary.main
          }
        }
      }
);

const DateText = styled(Typography)(({ theme }) => ({
  fontSize: "0.8rem",
  color: theme.palette.grey[500]
}));

const ItemContent = styled("div")(({ theme }) => ({
  paddingBottom: theme.spacing(2)
}));

const ItemLink = styled(AdrStatusLink)({
  display: "block"
});

const ItemTitle = styled("span")({
  marginRight: "0.5ch"
});

const ItemPackage = styled("span")(({ theme }) => ({
  fontSize: "0.8rem",
  verticalAlign: "text-top",
  whiteSpace: "pre",
  color: theme.palette.grey[700]
}));

const ItemStatusChip = styled(AdrStatusChip)({
  marginLeft: "-1ch"
});

const DialogNote = styled(Typography)({
  marginTop: "20px"
});

type Props = {
  adrs?: AdrLight[];
  currentAdrSlug?: string;
  className?: string;
};

export function AdrMenu({ adrs, currentAdrSlug, className, ...props }: Props) {
  const [newAdrOpen, setNewAdrOpen] = React.useState(false);
  const mode = React.useContext(Log4brainsModeContext);

  if (adrs === undefined) {
    return null; // Because inside a <Grow>
  }

  let lastDateString = "";

  return (
    <div className={className} {...props}>
      {mode === Log4brainsMode.preview && (
        <Dialog
          open={newAdrOpen}
          onClose={() => setNewAdrOpen(false)}
          aria-labelledby="newadr-dialog-title"
          aria-describedby="newadr-dialog-description"
        >
          <DialogTitle id="newadr-dialog-title">Create a new ADR</DialogTitle>
          <DialogContent>
            <DialogContentText id="newadr-dialog-description">
              <Typography>
                Run the following command in your terminal:
              </Typography>
              <pre>
                <code className="hljs bash">log4brains adr new</code>
              </pre>
              <Typography>
                This will create a new ADR from your template and will open it
                in your editor.
                <br />
                Just press <code>Ctrl+S</code> to watch your changes here,
                thanks to Hot Reload.
              </Typography>
              <DialogNote variant="body2">
                Would you have preferred to create a new ADR directly from here?
                <br />
                Leave a 👍 on{" "}
                <MuiLink
                  href="https://github.com/thomvaill/log4brains/issues/9"
                  target="_blank"
                  rel="noopener"
                >
                  this GitHub issue
                </MuiLink>{" "}
                then!
              </DialogNote>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setNewAdrOpen(false)}
              color="primary"
              autoFocus
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Timeline>
        {mode === Log4brainsMode.preview && (
          <NewAdrItem>
            <TimelineOppositeContent />
            <TimelineSeparator>
              <Tooltip title="Create a new ADR">
                <Fab
                  size="small"
                  color="primary"
                  aria-label="create a new ADR"
                  onClick={() => setNewAdrOpen(true)}
                >
                  <AddIcon />
                </Fab>
              </Tooltip>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent />
          </NewAdrItem>
        )}

        {adrs.map((adr) => {
          const currentDateString = moment(
            adr.publicationDate || adr.creationDate
          ).format("MMMM|YYYY");
          const dateString =
            currentDateString === lastDateString ? "" : currentDateString;
          lastDateString = currentDateString;
          const [month, year] = dateString.split("|");

          return (
            <AdrItem key={adr.slug} selected={currentAdrSlug === adr.slug}>
              <TimelineOppositeContent>
                <DateText variant="body2">{month}</DateText>
                <DateText variant="body2">{year}</DateText>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <ItemContent>
                  <ItemLink
                    href={`/adr/${adr.slug}`}
                    status={adr.status}
                    variant="body2"
                  >
                    <ItemTitle>{adr.title || "Untitled"}</ItemTitle>
                    {adr.package ? (
                      <ItemPackage>
                        <CropFreeIcon fontSize="inherit" /> {adr.package}
                      </ItemPackage>
                    ) : null}
                  </ItemLink>
                  <div>
                    <ItemStatusChip status={adr.status} />
                  </div>
                </ItemContent>
              </TimelineContent>
            </AdrItem>
          );
        })}

        <StartItem>
          <TimelineOppositeContent />
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot>
              <EmojiFlagsIcon />
            </TimelineDot>
          </TimelineSeparator>
          <TimelineContent />
        </StartItem>
      </Timeline>
    </div>
  );
}
