import React from "react";
import {
  AppBar,
  // Divider,
  Drawer,
  List,
  // ListItem,
  // ListItemIcon,
  // ListItemText,
  Toolbar,
  Link as MuiLink,
  Typography,
  Backdrop,
  NoSsr,
  CircularProgress,
  Grow,
  Fade,
  Box,
  IconButton
} from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";

// import {
//   ChevronRight as ChevronRightIcon,
//   PlaylistAddCheck as PlaylistAddCheckIcon
// } from "@mui/icons-material";
import NextLink from "next/link";
import { useRouter } from "next/router";

import { RouterLink } from "../../components";
import { AdrMenu } from "./components/AdrMenu";
import { styled, Theme } from "@mui/material/styles";
import { ConnectedSearchBox } from "./components/ConnectedSearchBox/ConnectedSearchBox";
import { AdrLight } from "../../lib-shared/types";
import { AdrNav, AdrNavContext } from "../../contexts";
import { RoutingProgress } from "./components/RoutingProgress";

const searchTransitionDuration = 300;

const topSpace = (theme: Theme) => theme.spacing(6);

const Root = styled("div")({
  display: "flex"
});

const LayoutLeftCol = styled("div")(({ theme }) => ({
  flexGrow: 0.5,
  [theme.breakpoints.down("lg")]: {
    display: "none"
  }
}));

const LayoutCenterCol = styled("div")(({ theme }) => ({
  paddingLeft: `${theme.custom.layout.centerColPadding}px`,
  paddingRight: `${theme.custom.layout.centerColPadding}px`,
  flexGrow: 1,
  [theme.breakpoints.up("md")]: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: `${theme.custom.layout.centerColBasis}px`
  }
}));

const LayoutRightCol = styled("div")(({ theme }) => ({
  flexGrow: 1,
  flexBasis: `${theme.custom.layout.rightColBasis}px`,
  [theme.breakpoints.down("lg")]: {
    display: "none"
  }
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
  [theme.breakpoints.up("sm")]: {
    display: "none"
  }
}));

const AppBarTitle = styled("div")(({ theme }) => ({
  display: "none",
  [theme.breakpoints.up("sm")]: {
    display: "flex",
    alignItems: "center",
    width: `calc(${theme.custom.layout.drawerWidth}px - ${theme.spacing(3)})`,
    flexGrow: 0,
    flexShrink: 0,
    cursor: "pointer"
  }
}));

const AppBarTitleLink = styled(RouterLink)(({ theme }) => ({
  display: "block",
  color: "inherit",
  "&:hover": {
    color: "inherit"
  },
  marginLeft: theme.spacing(2)
}));

const SearchBackdrop = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.modal - 2
}));

const LayoutSearchBox = styled(ConnectedSearchBox, {
  shouldForwardProp: (prop) => prop !== "expanded"
})<{ expanded: boolean }>(({ theme, expanded }) => ({
  zIndex: theme.zIndex.modal - 1,
  width: "100%",
  [theme.breakpoints.up("md")]: {
    width: expanded ? "100%" : "70%"
  },
  transition: theme.transitions.create("width", {
    duration: searchTransitionDuration
  })
}));

const DrawerNav = styled("nav")(({ theme }) => ({
  [theme.breakpoints.up("sm")]: {
    width: `${theme.custom.layout.drawerWidth}px`,
    flexShrink: 0
  }
}));

const DrawerContainer = styled("div")(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.up("sm")]: {
    paddingTop: topSpace(theme)
  }
}));

const DrawerToolbar = styled(Toolbar)(({ theme }) => ({
  visibility: "visible",
  [theme.breakpoints.up("sm")]: {
    visibility: "hidden"
  },
  justifyContent: "space-between"
}));

const AdrMenuContainer = styled("div")(({ theme }) => ({
  transformOrigin: "center left", // for the <Grow> transition
  flexGrow: 1,
  flexShrink: 1,
  overflow: "auto",
  "&::-webkit-scrollbar": {
    width: "6px",
    backgroundColor: theme.palette.background.default
  },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: "10px",
    "-webkit-box-shadow": "inset 0 0 2px rgba(0,0,0,.3)",
    backgroundColor: theme.palette.grey[400]
  }
}));

const BottomMenuList = styled(List)({
  flexGrow: 0,
  flexShrink: 0
});

const AdlTitleAndSpinner = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  paddingLeft: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    paddingLeft: theme.spacing(3)
  },
  paddingBottom: theme.spacing(0.5),
  paddingRight: theme.spacing(3)
}));

const AdrMenuSpinner = styled(CircularProgress)({
  alignSelf: "center",
  marginTop: "30vh"
});

const Container = styled("div")(({ theme }) => ({
  flexGrow: 1,
  paddingTop: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    paddingTop: topSpace(theme)
  }
}));

const Content = styled("main")(({ theme }) => ({
  minHeight: `calc(100vh - 35px - ${theme.spacing(1 + 8)})`, // TODO: calc AppBar height more precisely
  [theme.breakpoints.up("sm")]: {
    minHeight: `calc(100vh - 35px - ${topSpace(theme)} - ${theme.spacing(8)})` // TODO: calc AppBar height more precisely
  }
}));

const Footer = styled("footer")(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.grey[500],
  height: "35px",
  display: "flex",
  marginTop: theme.spacing(6)
}));

const FooterContent = styled(LayoutCenterCol)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
});

const FooterText = styled(Typography)({
  fontSize: "0.77rem"
});

const FooterLink = styled(MuiLink)(({ theme }) => ({
  color: theme.palette.grey[600],
  fontSize: "0.8rem",
  "&:hover": {
    color: theme.palette.grey[800]
  }
}));

const FooterVersion = styled("span")({
  fontSize: "0.8em"
});

function buildAdrNav(currentAdr: AdrLight, adrs: AdrLight[]): AdrNav {
  const currentIndex = adrs
    .map((adr, index) => (adr.slug === currentAdr.slug ? index : undefined))
    .filter((adr) => adr !== undefined)
    .pop();
  const previousAdr =
    currentIndex !== undefined && currentIndex < adrs.length - 1
      ? adrs[currentIndex + 1]
      : undefined;
  const nextAdr =
    currentIndex !== undefined && currentIndex > 0
      ? adrs[currentIndex - 1]
      : undefined;
  return {
    previousAdr,
    nextAdr
  };
}

export type AdrBrowserLayoutProps = {
  projectName: string;
  adrs?: AdrLight[]; // undefined -> loading, empty -> empty
  adrsReloading?: boolean;
  currentAdr?: AdrLight;
  children: React.ReactNode;
  routing?: boolean;
  l4bVersion: string;
};

export function AdrBrowserLayout({
  projectName,
  adrs,
  adrsReloading = false,
  currentAdr,
  children,
  routing = false,
  l4bVersion
}: AdrBrowserLayoutProps) {
  const router = useRouter();

  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  React.useEffect(() => {
    const closeMobileDrawer = () => setMobileDrawerOpen(false);
    router?.events.on("routeChangeStart", closeMobileDrawer);
    return () => {
      router?.events.off("routeChangeStart", closeMobileDrawer);
    };
  }, [router]);

  const [searchOpen, setSearchOpenState] = React.useState(false);
  const [searchReallyOpen, setSearchReallyOpenState] = React.useState(false);

  const drawer = (
    <DrawerContainer>
      <DrawerToolbar>
        <div />
        <IconButton
          LinkComponent={NextLink}
          href="/"
          size="small"
          color="inherit"
          aria-label="go to homepage"
          title={`Architecture knowledge base of ${projectName}`}
        >
          <img
            src={`${router?.basePath}/l4b-static/Log4brains-logo.png`}
            alt="Log4brains logo"
            width={40}
            height={40}
          />
        </IconButton>
        <IconButton
          size="small"
          color="inherit"
          aria-label="close drawer"
          title="Close"
          onClick={handleMobileDrawerToggle}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DrawerToolbar>

      <AdlTitleAndSpinner>
        <Typography variant="subtitle2">Decision log</Typography>

        <Fade in={adrsReloading}>
          <CircularProgress size={13} />
        </Fade>
      </AdlTitleAndSpinner>

      {adrs !== undefined && (
        // MUI v5 transitions need a child that holds a ref to a DOM element
        <Grow in>
          <AdrMenuContainer>
            <AdrMenu adrs={adrs} currentAdrSlug={currentAdr?.slug} />
          </AdrMenuContainer>
        </Grow>
      )}

      {adrs === undefined && <AdrMenuSpinner size={30} />}

      <BottomMenuList>
        {/* <Divider />
      <ListItem button>
        <ListItemIcon>
          <ChevronRightIcon />
        </ListItemIcon>
        <ListItemText>
          <Badge badgeContent={0} color="primary">
            <Typography>Filters</Typography>
          </Badge>
        </ListItemText>
      </ListItem> */}
        {/* <Divider />
      <Link href="/decision-backlog" passHref>
        <ListItem button selected={backlog} component="a">
          <ListItemIcon>
            <PlaylistAddCheckIcon />
          </ListItemIcon>
          <ListItemText primary="Decision backlog" />
              </ListItem>
      </Link> */}
      </BottomMenuList>
    </DrawerContainer>
  );

  return (
    <Root>
      <AppBar position="fixed">
        {routing && <RoutingProgress />}
        <Toolbar>
          <MenuButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleMobileDrawerToggle}
          >
            <MenuIcon />
          </MenuButton>
          <AppBarTitle
            onClick={() => {
              void router.push("/");
            }}
          >
            <div>
              <img
                src={`${router?.basePath}/l4b-static/Log4brains-logo-dark.png`}
                alt="Log4brains logo"
                width={50}
                height={50}
              />
            </div>
            <div>
              <AppBarTitleLink href="/" variant="h6" noWrap>
                {projectName}
              </AppBarTitleLink>
              <AppBarTitleLink href="/" variant="body2" noWrap>
                Architecture knowledge base
              </AppBarTitleLink>
            </div>
          </AppBarTitle>
          <LayoutLeftCol />
          <LayoutCenterCol>
            <SearchBackdrop open={searchOpen} />
            <NoSsr>
              <LayoutSearchBox
                onOpen={() => {
                  setSearchOpenState(true);
                  // Delayed real opening because otherwise the dropdown width is bugged
                  setTimeout(
                    () => setSearchReallyOpenState(true),
                    searchTransitionDuration + 100
                  );
                }}
                onClose={() => {
                  setSearchOpenState(false);
                  setSearchReallyOpenState(false);
                }}
                open={searchReallyOpen}
                expanded={searchOpen}
              />
            </NoSsr>
          </LayoutCenterCol>
          <LayoutRightCol />
        </Toolbar>
      </AppBar>

      <DrawerNav aria-label="architecture decision records list">
        <Box sx={{ display: { sm: "none" } }}>
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileDrawerOpen}
            onClose={handleMobileDrawerToggle}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Box>
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <Drawer variant="permanent" open>
            {drawer}
          </Drawer>
        </Box>
      </DrawerNav>

      <Container>
        <Toolbar />
        <Content>
          <AdrNavContext.Provider
            value={currentAdr && adrs ? buildAdrNav(currentAdr, adrs) : {}}
          >
            {children}
          </AdrNavContext.Provider>
        </Content>
        <Footer>
          <LayoutLeftCol />
          <FooterContent>
            <FooterText>
              Powered by{" "}
              <FooterLink
                href="https://github.com/FreakinWard/log4brains"
                target="_blank"
                rel="noopener"
              >
                Log4brains
              </FooterLink>{" "}
              <FooterVersion>
                {l4bVersion ? `(v${l4bVersion})` : null}
              </FooterVersion>
            </FooterText>
          </FooterContent>
          <LayoutRightCol />
        </Footer>
      </Container>
    </Root>
  );
}
