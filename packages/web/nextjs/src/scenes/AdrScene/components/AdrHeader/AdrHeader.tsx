import React from "react";
import moment from "moment";
import copyTextToClipboard from "copy-text-to-clipboard";
import {
  Button,
  ButtonGroup,
  Snackbar,
  Tooltip,
  Typography,
  IconButton,
  SvgIcon
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CropFree as CropFreeIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Label as LabelIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import {
  AiFillGithub as GithubRIcon,
  AiFillGitlab as GitlabRIcon
} from "react-icons/ai";
import {
  DiBitbucket as BitbucketRIcon,
  DiGit as GitRIcon
} from "react-icons/di";
import { FiLink as LinkRIcon } from "react-icons/fi";

import { AdrStatusChip } from "../../../../components";
import { Adr } from "../../../../lib-shared/types";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getRepositoryIcon(provider: string): React.JSX.Element {
  switch (provider) {
    case "github":
      return (
        <SvgIcon>
          <GithubRIcon />
        </SvgIcon>
      );
      break;

    case "gitlab":
      return (
        <SvgIcon>
          <GitlabRIcon />
        </SvgIcon>
      );
      break;

    case "bitbucket":
      return (
        <SvgIcon>
          <BitbucketRIcon />
        </SvgIcon>
      );
      break;

    default:
      return (
        <SvgIcon>
          <GitRIcon />
        </SvgIcon>
      );
      break;
  }
}

const Root = styled("div")(({ theme }) => ({
  color: theme.palette.grey[700],
  display: "flex",
  justifyContent: "space-between"
}));

const InlineInfo = styled("div")(({ theme }) => ({
  display: "flex",
  columnGap: theme.spacing(1)
}));

const Tags = styled("span")(({ theme }) => ({
  color: theme.palette.grey[600]
}));

async function editLocally(slug: string): Promise<void> {
  await fetch(`/api/adr/${slug}/_open-in-editor`, { method: "post" });
}

export type AdrHeaderProps = {
  className?: string;
  adr: Adr;
  locallyEditable?: boolean;
};

export function AdrHeader({
  className,
  adr,
  locallyEditable = false
}: AdrHeaderProps) {
  const [linkCopiedSnackIsOpened, linkCopiedSnackSetOpened] =
    React.useState(false);
  const linkCopiedSnackClose = () => {
    linkCopiedSnackSetOpened(false);
  };

  const decidersIcon =
    adr.deciders.length > 1 ? (
      <PeopleIcon fontSize="inherit" />
    ) : (
      <PersonIcon fontSize="inherit" />
    );

  return (
    <>
      <Root className={className}>
        <div>
          <InlineInfo>
            {adr.package ? (
              <Typography variant="body2" title="Package">
                <CropFreeIcon fontSize="inherit" /> {adr.package}
              </Typography>
            ) : null}

            <Typography
              variant="body2"
              title={adr.publicationDate ? "Publication date" : "Creation date"}
            >
              <EventIcon fontSize="inherit" />{" "}
              {moment(adr.publicationDate || adr.creationDate).format("ll")}
            </Typography>

            <div title="Status">
              <AdrStatusChip status={adr.status} />
            </div>
          </InlineInfo>

          <Typography
            variant="body2"
            title={
              adr.deciders.length > 0
                ? `Decider${adr.deciders.length > 1 ? "s" : ""}`
                : "Author"
            }
          >
            {decidersIcon}{" "}
            {adr.deciders.length > 0
              ? adr.deciders.join(", ")
              : adr.lastEditAuthor}
          </Typography>

          {adr.tags.length > 0 ? (
            <Typography variant="body2" title="Tags">
              <LabelIcon fontSize="inherit" />{" "}
              <Tags>{adr.tags.map((tag) => `#${tag}`).join(" ")}</Tags>
            </Typography>
          ) : null}
        </div>
        <div>
          <div>
            <ButtonGroup size="medium">
              <Tooltip title="Copy link">
                <Button
                  onClick={() => {
                    copyTextToClipboard(
                      window.location.href.replace(window.location.hash, "")
                    );
                    linkCopiedSnackSetOpened(true);
                  }}
                >
                  <SvgIcon>
                    <LinkRIcon />
                  </SvgIcon>
                </Button>
              </Tooltip>

              {adr.repository ? (
                <Tooltip
                  title={`View/edit on ${
                    adr.repository.provider === "generic"
                      ? "Git"
                      : capitalize(adr.repository.provider)
                  }`}
                >
                  <Button
                    href={adr.repository.viewUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    {getRepositoryIcon(adr.repository.provider)}
                  </Button>
                </Tooltip>
              ) : null}

              {locallyEditable ? (
                <Tooltip title="Edit locally">
                  <Button
                    color="secondary"
                    onClick={() => editLocally(adr.slug)}
                  >
                    <EditIcon />
                  </Button>
                </Tooltip>
              ) : null}
            </ButtonGroup>
          </div>
        </div>
      </Root>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={linkCopiedSnackIsOpened}
        onClose={linkCopiedSnackClose}
        autoHideDuration={6000}
        message="Link copied to clipboard"
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={linkCopiedSnackClose}
            title="Close"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
}
