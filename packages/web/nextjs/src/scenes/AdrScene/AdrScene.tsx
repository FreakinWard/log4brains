import React from "react";
import moment from "moment";

import {
  Typography,
  Button,
  Divider,
  Tooltip,
  Link as MuiLink,
  Box,
  Alert
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from "@mui/icons-material";
import Head from "next/head";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import { Markdown, MarkdownToc, TwoColContent } from "../../components";
// eslint-disable-next-line import/no-cycle
import { ConnectedAdrBrowserLayout } from "../../layouts";
import { AdrHeader } from "./components";
import {
  AdrNavContext,
  Log4brainsMode,
  Log4brainsModeContext
} from "../../contexts";
import { Adr } from "../../lib-shared/types";
import { buildAdrUrl } from "../../lib/adr-utils";

const Header = styled(AdrHeader)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(4)
}));

const StatusAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(3)
}));

const BottomNavDivider = styled(Divider)(({ theme }) => ({
  marginTop: theme.spacing(12)
}));

const BottomNav = styled("nav")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginTop: theme.spacing(1)
}));

const BottomInfoText = styled(Typography)(({ theme }) => ({
  fontSize: "0.77rem",
  textAlign: "center",
  color: theme.palette.grey[600]
}));

export type AdrSceneProps = {
  projectName: string;
  currentAdr: Adr;
};

/**
 * Props given to the page: the scene's props plus the ones only used by its layout
 */
export type AdrScenePageProps = AdrSceneProps & {
  l4bVersion: string;
};

export function AdrScene({ projectName, currentAdr }: AdrSceneProps) {
  const mode = React.useContext(Log4brainsModeContext);
  const adrNav = React.useContext(AdrNavContext);

  const [mdContent, setMdContent] = React.useState<
    React.ReactElement | undefined
  >(undefined);

  if (!currentAdr) {
    return null; // Happens during Next.js initial build
  }

  let alert;
  if (currentAdr.status === "superseded") {
    alert = (
      <StatusAlert severity="warning">
        This ADR is <strong>superseded</strong>
        {currentAdr.supersededBy ? (
          <>
            {" by "}
            <Link href={buildAdrUrl(currentAdr.supersededBy)} passHref>
              <MuiLink>{currentAdr.supersededBy.title || "Untitled"}</MuiLink>
            </Link>
          </>
        ) : null}
        .
      </StatusAlert>
    );
  } else if (currentAdr.status === "deprecated") {
    alert = (
      <StatusAlert severity="warning">
        This ADR is <strong>deprecated</strong>.
      </StatusAlert>
    );
  } else if (currentAdr.status === "rejected") {
    alert = (
      <StatusAlert severity="error">
        This ADR was <strong>rejected</strong>.
      </StatusAlert>
    );
  }

  return (
    <>
      <Head>
        <title>
          {currentAdr.title || "Untitled"} ADR - Architecture knowledge base of{" "}
          {projectName}
        </title>
      </Head>
      <TwoColContent
        rightColContent={<MarkdownToc content={mdContent} levelStart={2} />}
      >
        <Typography variant="h3" gutterBottom>
          {currentAdr.title || "Untitled"}
        </Typography>
        <Divider />
        <Header
          adr={currentAdr}
          locallyEditable={mode === Log4brainsMode.preview}
        />

        {alert}

        <Markdown onCompiled={setMdContent}>
          {currentAdr.body.enhancedMdx}
        </Markdown>

        <BottomNavDivider />

        <BottomNav>
          {adrNav.previousAdr ? (
            <Link href={buildAdrUrl(adrNav.previousAdr)} passHref>
              <Tooltip
                title={adrNav.previousAdr.title || ""}
                aria-label="previous"
              >
                <Button startIcon={<ArrowBackIcon />}>
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    Previous
                  </Box>
                </Button>
              </Tooltip>
            </Link>
          ) : (
            <div />
          )}

          <div>
            <BottomInfoText>
              Last edited by {currentAdr.lastEditAuthor}
            </BottomInfoText>
            <BottomInfoText>
              on {moment(currentAdr.lastEditDate).format("lll")}
            </BottomInfoText>
          </div>
          {adrNav.nextAdr ? (
            <Link href={buildAdrUrl(adrNav.nextAdr)} passHref>
              <Tooltip title={adrNav.nextAdr.title || ""} aria-label="next">
                <Button endIcon={<ArrowForwardIcon />}>
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>Next</Box>
                </Button>
              </Tooltip>
            </Link>
          ) : (
            <div />
          )}
        </BottomNav>
      </TwoColContent>
    </>
  );
}

AdrScene.getLayout = (scene: JSX.Element, sceneProps: AdrScenePageProps) => (
  <ConnectedAdrBrowserLayout {...sceneProps}>{scene}</ConnectedAdrBrowserLayout>
);
