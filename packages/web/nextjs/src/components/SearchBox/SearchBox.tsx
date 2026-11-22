import React from "react";
import {
  Autocomplete,
  AutocompleteCloseReason,
  AutocompleteInputChangeReason,
  AutocompleteProps,
  CircularProgress,
  SvgIcon,
  Typography
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useControlled } from "@mui/material/utils";

import { GrDocumentText as AdrIcon } from "react-icons/gr";
import { useRouter } from "next/router";
import { SearchBar } from "./components/SearchBar";
import { SearchResult } from "../../lib-shared/search";

const StyledSearchBar = styled(SearchBar)({
  zIndex: "inherit"
});

const ResultTitle = styled(Typography)({
  marginLeft: "0.5ch"
});

const Loading = styled("div")({
  textAlign: "center"
});

export type SearchBoxProps = Omit<
  AutocompleteProps<SearchResult, false, false, false>,
  "results" | "renderInput" | "options"
> & {
  /**
   * Callback fired when the search box requests to be opened.
   * Used in controlled mode (see open).
   *
   * @param event The event source of the callback.
   */
  onOpen?: (event: React.ChangeEvent<unknown>) => void;

  /**
   * Callback fired when the popup requests to be closed.
   * Used in controlled mode (see open).
   *
   * @param event The event source of the callback.
   * @param reason Can be: `"toggleInput"`, `"escape"`, `"select-option"`, `"blur"`.
   */
  onClose?: (
    event: React.ChangeEvent<unknown>,
    reason: AutocompleteCloseReason
  ) => void;

  /**
   * Control the popup open state.
   * Set -> controlled mode, unset -> uncontrolled mode.
   */
  open?: boolean;

  /**
   * Callback fired when the search query changes.
   * Controlled mode only.
   *
   * @param event The event source of the callback.
   * @param query The new value of the search query.
   * @param reason Can be: `"input"` (user input), `"reset"` (programmatic change), `"clear"`.
   */
  onQueryChange?: (
    event: React.ChangeEvent<unknown>,
    query: string,
    reason: AutocompleteInputChangeReason
  ) => void;

  /**
   * The search query.
   * Controlled mode only.
   */
  query?: string;

  /**
   * The search results.
   * Controlled mode only.
   */
  results?: SearchResult[];

  /**
   * To display a spinner.
   */
  loading?: boolean;
};

export function SearchBox(props: SearchBoxProps) {
  const {
    onOpen,
    onClose,
    open: openProp,
    onQueryChange,
    query,
    results,
    loading = false,
    ...otherProps
  } = props;

  const [open, setOpenState] = useControlled({
    controlled: openProp,
    default: false,
    name: "SearchBox",
    state: "open"
  });

  const handleOpen = (event: React.ChangeEvent<unknown>) => {
    if (open) {
      return;
    }
    setOpenState(true);
    if (onOpen) {
      onOpen(event);
    }
  };

  const router = useRouter();

  const handleClose = (
    event: React.ChangeEvent<unknown>,
    reason: AutocompleteCloseReason
  ) => {
    if (!open) {
      return;
    }
    setOpenState(false);
    if (onClose) {
      onClose(event, reason);
    }
  };

  let noOptionsText: React.ReactNode = "Type to start searching";
  if (loading) {
    noOptionsText = (
      <Loading>
        <CircularProgress size={20} />
      </Loading>
    );
  } else if (query) {
    noOptionsText = "No matching documents";
  }

  return (
    <Autocomplete
      {...otherProps}
      options={results ?? []}
      getOptionLabel={(result) => result.title}
      renderInput={(params) => (
        <StyledSearchBar
          {...params}
          open={open}
          onClear={(event) =>
            onQueryChange && onQueryChange(event, "", "clear")
          }
        />
      )}
      inputValue={query}
      onInputChange={(event, value, reason) => {
        // We don't want to replace the inputValue by the selected value
        if (reason !== "reset" && onQueryChange) {
          onQueryChange(event, value, reason);
        }
      }}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      filterOptions={(r) => r} // We hijack Autocomplete's behavior to display search results as options
      renderOption={({ key, ...optionProps }, result) => (
        <li key={key} {...optionProps}>
          <SvgIcon fontSize="small">
            <AdrIcon />
          </SvgIcon>
          <ResultTitle>{result.title}</ResultTitle>
        </li>
      )}
      noOptionsText={noOptionsText}
      onChange={async (_, result) => {
        if (result) {
          await router.push(result.href);
        }
      }}
    />
  );
}
