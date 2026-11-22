import React from "react";
import {
  InputBase,
  InputAdornment,
  InputBaseProps,
  IconButton,
  Fade,
  AutocompleteRenderInputParams
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { Search as SearchIcon, Close as ClearIcon } from "@mui/icons-material";

export type SearchBarProps = Omit<InputBaseProps, "slotProps"> &
  AutocompleteRenderInputParams & {
    open: boolean;
    onClear: (event: React.ChangeEvent<unknown>) => void;
  };

// Inspired by https://material-ui.com/components/app-bar/#app-bar-with-search-field
const SearchInput = styled(InputBase, {
  shouldForwardProp: (prop) => prop !== "open"
})<{ open: boolean }>(({ theme, open }) => ({
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  borderRadius: open
    ? `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`
    : `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
  color: open
    ? theme.palette.getContrastText(theme.palette.common.white)
    : "inherit",
  backgroundColor: open
    ? theme.palette.common.white
    : alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: open
      ? theme.palette.common.white
      : alpha(theme.palette.common.white, 0.25)
  },
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0)
  }
}));

export function SearchBar(props: SearchBarProps) {
  const { slotProps, open, onClear, ...params } = props;
  return (
    <SearchInput
      placeholder="Search..."
      open={open}
      startAdornment={
        <InputAdornment position="start">
          <SearchIcon />
        </InputAdornment>
      }
      endAdornment={
        <Fade in={open && slotProps.htmlInput.value !== ""}>
          <InputAdornment position="end">
            <IconButton
              onClick={(event) => onClear(event)}
              size="small"
              title="Clear"
              color="inherit"
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        </Fade>
      }
      ref={slotProps.input.ref}
      inputProps={slotProps.htmlInput}
      {...params}
    />
  );
}
