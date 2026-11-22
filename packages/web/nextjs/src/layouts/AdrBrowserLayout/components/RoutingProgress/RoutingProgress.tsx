import { LinearProgress } from "@mui/material";
import React from "react";
import { styled } from "@mui/material/styles";

const TopProgress = styled(LinearProgress)({
  top: 0,
  width: "100%",
  height: 2,
  position: "absolute"
});

export function RoutingProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress > 99.999) {
          clearInterval(timer);
          return 100;
        }
        return oldProgress + (100 - oldProgress) / 8;
      });
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <TopProgress
      color="secondary"
      variant={progress < 100 ? "determinate" : "indeterminate"}
      value={progress}
    />
  );
}
