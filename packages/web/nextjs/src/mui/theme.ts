import {
  createTheme,
  darken,
  Theme,
  responsiveFontSizes
} from "@mui/material/styles";
import { red } from "@mui/material/colors";
import type {} from "@mui/lab/themeAugmentation"; // types for the MuiTimeline* overrides

type CustomThemeOptions = {
  layout: {
    drawerWidth: number;
    centerColBasis: number;
    centerColPadding: number;
    rightColBasis: number;
  };
};

declare module "@mui/material/styles" {
  interface Theme {
    custom: CustomThemeOptions;
  }
  interface ThemeOptions {
    custom?: CustomThemeOptions;
  }
}

export type CustomTheme = Theme;

const primary = "#2176AE";
const drawerWidth = 380;
const titleFontFamily = '"Roboto Slab", "Noto Serif", "Times New Roman", serif';

export const theme: CustomTheme = {
  ...responsiveFontSizes(
    createTheme({
      palette: {
        primary: {
          main: primary
        },
        secondary: {
          main: "#FF007B"
        },
        error: {
          main: red.A400
        },
        background: {
          default: "#fff"
        }
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontFamily: titleFontFamily
        },
        h2: {
          fontFamily: titleFontFamily
        },
        h3: {
          fontFamily: titleFontFamily,
          lineHeight: 1.1
        },
        h4: {
          fontFamily: titleFontFamily
        },
        h5: {
          fontFamily: titleFontFamily
        },
        h6: {
          fontFamily: titleFontFamily
        },
        subtitle2: {
          fontWeight: 700
        }
      },
      components: {
        MuiAppBar: {
          styleOverrides: {
            // Above the permanent drawer
            root: ({ theme: t }) => ({
              zIndex: t.zIndex.drawer + 1
            })
          }
        },
        MuiAutocomplete: {
          styleOverrides: {
            // Attached to the bottom of the input
            paper: ({ theme: t }) => ({
              borderRadius: `0 0 ${t.shape.borderRadius}px ${t.shape.borderRadius}px`,
              marginTop: 0
            })
          }
        },
        // MUI v9 sets the chip line height to 1.5 (before: inherited)
        MuiChip: {
          styleOverrides: {
            root: {
              lineHeight: "inherit"
            }
          }
        },
        MuiFab: {
          styleOverrides: {
            sizeSmall: {
              width: "35px",
              height: "35px"
            }
          }
        },
        // Icons placed inline in a text
        MuiSvgIcon: {
          styleOverrides: {
            fontSizeInherit: {
              verticalAlign: "middle"
            }
          }
        },
        MuiTimeline: {
          styleOverrides: {
            root: {
              padding: 0
            }
          }
        },
        MuiLink: {
          defaultProps: {
            underline: "none"
          },
          styleOverrides: {
            root: {
              "&:hover": {
                color: darken(primary, 0.3)
              }
            }
          }
        },
        // MUI v5 changed the default button color from "default" (text color) to "primary"
        MuiButton: {
          defaultProps: {
            color: "inherit"
          },
          styleOverrides: {
            colorInherit: ({ theme: t }) => ({
              color: t.palette.text.primary
            })
          },
          variants: [
            // v4 outlined border color (v5 uses the text color for "inherit")
            {
              props: { variant: "outlined", color: "inherit" },
              style: {
                borderColor: "rgba(0, 0, 0, 0.23)"
              }
            }
          ]
        },
        MuiButtonGroup: {
          defaultProps: {
            color: "inherit"
          },
          styleOverrides: {
            // MUI v5 darkens the divider of hovered outlined buttons (v4: unchanged)
            grouped: ({ ownerState }) =>
              ownerState.color === "inherit" &&
              ownerState.variant === "outlined"
                ? { "&:hover": { borderRightColor: "rgba(0, 0, 0, 0.23)" } }
                : {}
          }
        },
        // MUI v5 increased the tooltip font size from 10px to 11px
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              fontSize: "0.625rem",
              lineHeight: "1.4em"
            }
          }
        },
        // MUI v5 puts temporary drawers at zIndex.drawer (v4: zIndex.modal), i.e. below our AppBar (zIndex.drawer + 1)
        MuiDrawer: {
          styleOverrides: {
            modal: ({ theme: t }) => ({
              zIndex: t.zIndex.modal
            }),
            paper: {
              width: `${drawerWidth}px`
            }
          }
        },
        // MUI v5 reduced the icon button paddings (v4: 12px, small: 3px)
        MuiIconButton: {
          styleOverrides: {
            sizeMedium: {
              padding: 12
            },
            sizeSmall: {
              padding: 3
            }
          }
        },
        // MUI v5 increased the input line height and height from 1.1876em to 1.4375em
        MuiInputBase: {
          styleOverrides: {
            root: {
              lineHeight: "1.1876em"
            },
            input: {
              height: "1.1876em"
            }
          }
        },
        // MUI v5 sets the adornment color to action.active (v4: inherited)
        MuiInputAdornment: {
          styleOverrides: {
            root: {
              color: "inherit"
            }
          }
        },
        // MUI v5 renders the timeline contents as body1 Typography (v4: inherited body2)
        MuiTimelineContent: {
          styleOverrides: {
            root: {
              fontSize: "0.875rem",
              lineHeight: 1.43,
              letterSpacing: "0.01071em"
            }
          }
        },
        MuiTimelineOppositeContent: {
          styleOverrides: {
            root: {
              flex: "0 0 12ch",
              fontSize: "0.875rem",
              lineHeight: 1.43,
              letterSpacing: "0.01071em"
            }
          }
        },
        // MUI v5 increased the timeline dot margins from 8px to 11.5px
        MuiTimelineDot: {
          styleOverrides: {
            root: {
              marginTop: 8,
              marginBottom: 8
            }
          }
        },
        MuiCssBaseline: {
          styleOverrides: {
            html: {
              maxWidth: "100%"
            },
            body: {
              padding: "0 !important", // for storybook
              maxWidth: "100%",
              // Keep the MUI v4 body typography (v5 switched from body2 to body1)
              fontSize: "0.875rem",
              lineHeight: 1.43,
              letterSpacing: "0.01071em"
            },
            blockquote: {
              margin: 0,
              padding: "0 1em",
              borderLeft: "0.25em solid #F8F8F8",
              color: "#9e9e9e"
            }
          }
        }
      },
      breakpoints: {
        values: {
          xs: 0,
          sm: 900,
          md: 1060,
          lg: 1280,
          xl: 1920
        }
      }
    })
  ),
  custom: {
    layout: {
      drawerWidth,
      centerColBasis: 750 + 4 * 8,
      centerColPadding: 4 * 8,
      rightColBasis: 180
    }
  }
};
