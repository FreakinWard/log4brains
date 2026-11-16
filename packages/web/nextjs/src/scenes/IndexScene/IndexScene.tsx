import React from "react";
import Head from "next/head";
import { Alert, Typography } from "@mui/material";
import { Log4brainsMode, Log4brainsModeContext } from "../../contexts";
import { Markdown, TwoColContent } from "../../components";
import { styled } from "@mui/material/styles";
// eslint-disable-next-line import/no-cycle
import { ConnectedAdrBrowserLayout } from "../../layouts";

export type IndexSceneProps = {
  projectName: string;
  markdown: string;
};

/**
 * Props given to the page: the scene's props plus the ones only used by its layout
 */
export type IndexScenePageProps = IndexSceneProps & {
  l4bVersion: string;
};

const PreviewAlert = styled(Alert)({
  width: "38ch",
  "& .MuiAlert-message": {
    paddingTop: "2px"
  }
});

export function IndexScene({ projectName, markdown }: IndexSceneProps) {
  const mode = React.useContext(Log4brainsModeContext);

  const previewAlert =
    mode === Log4brainsMode.preview ? (
      <PreviewAlert severity="warning">
        <Typography variant="h6">Preview mode</Typography>
        <Typography variant="body2">
          Hot Reload is enabled on all pages
        </Typography>
      </PreviewAlert>
    ) : null;

  return (
    <>
      <Head>
        <title>Architecture knowledge base of {projectName}</title>
        <meta
          name="description"
          content={`This architecture knowledge base contains all the Architecture Decision Records (ADR) of the ${projectName} project`}
        />
      </Head>
      <TwoColContent rightColContent={previewAlert}>
        <Markdown>{markdown}</Markdown>
      </TwoColContent>
    </>
  );
}

IndexScene.getLayout = (
  scene: JSX.Element,
  sceneProps: IndexScenePageProps
) => (
  <ConnectedAdrBrowserLayout {...sceneProps}>{scene}</ConnectedAdrBrowserLayout>
);
