import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import styled, { useTheme } from "styled-components";
import { useStore } from "../../../../stores";
import { Box } from "../../../../components/box";
import { TextButton } from "../../../../components/button-text";
import { XAxis, YAxis } from "../../../../components/axis";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse/collapse";
import { Body3 } from "../../../../components/typography";
import { SceneTransition } from "../../../../components/transition/scene/scene";
import { ColorPalette } from "../../../../styles";
// import { useIntl } from "react-intl";
import { Toggle } from "../../../../components/toggle/toggle";
import {
  ArrowLeftIcon,
  CheckIcon,
  RightArrowIcon,
} from "../../../../components/icon";
import { IconProps } from "../../../../components/icon/types";

const MenuContainer = styled.div`
  position: relative;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-color: transparent;
`;

const MenuWrapper = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  z-index: 9999;
  min-width: 15.625rem;
  overflow: visible;
  box-shadow: ${(props) =>
    props.theme.mode === "light"
      ? "0px 1px 3px 0px rgba(43, 39, 55, 0.10), 0px 5px 30px 0px rgba(43, 39, 55, 0.05), 0px 10px 50px 0px rgba(43, 39, 55, 0.05)"
      : "none"};
`;

const ContextMenuContent = styled.div`
  border-radius: 0.5rem;
  background-color: ${(props) =>
    props.theme.mode === "light"
      ? ColorPalette.white
      : ColorPalette["gray-500"]};
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.15);
  overflow: hidden;
`;

const MenuBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  background-color: transparent;
`;

const MenuItem = styled.div`
  padding: 0.75rem 0.75rem 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background-color: ${(props) =>
    props.theme.mode === "light"
      ? ColorPalette.white
      : ColorPalette["gray-500"]};
  border-bottom: 1px solid
    ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-100"]
        : ColorPalette["gray-400"]};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-50"]
        : ColorPalette["gray-450"]};
  }
`;

const MenuItemXAxis = styled(XAxis)`
  height: 100%;
  display: flex;
  align-items: center;
`;

interface MainMenuSceneProps {
  hideLowBalance: boolean;
  showFiatValue: boolean;
  onToggleHideLowBalance: () => void;
  onToggleShowFiatValue: () => void;
  onAssetViewClick: () => void;
}

const MainMenuScene: React.FC<MainMenuSceneProps> = observer(
  ({ onToggleHideLowBalance, onToggleShowFiatValue, onAssetViewClick }) => {
    const { uiConfigStore } = useStore();
    const { hideLowBalance, showFiatValue } = uiConfigStore.options;
    const theme = useTheme();

    const handleToggleClick = (e: React.MouseEvent, toggleFn: () => void) => {
      if (!(e.target as HTMLElement).closest(".toggle-component")) {
        toggleFn();
      }
    };

    const textColorByCondition = (condition: boolean) => {
      return theme.mode === "light"
        ? condition
          ? ColorPalette["gray-700"]
          : ColorPalette["gray-300"]
        : condition
        ? ColorPalette["white"]
        : ColorPalette["gray-200"];
    };

    return (
      <YAxis>
        <MenuItem onClick={onAssetViewClick}>
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <MenuItemXAxis alignY="center" gap="0.5rem">
              <AssetViewIcon
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["white"]
                }
              />
              <Body3>Asset View</Body3>
            </MenuItemXAxis>
            <RightArrowIcon width="1rem" height="1rem" />
          </Box>
        </MenuItem>
        <MenuItem onClick={(e) => handleToggleClick(e, onToggleHideLowBalance)}>
          <MenuItemXAxis alignY="center" gap="0.5rem">
            <HideLowBalanceIcon
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["white"]
              }
            />
            <Body3 color={textColorByCondition(hideLowBalance)}>
              Hide Low Balances
            </Body3>
          </MenuItemXAxis>
          <div
            className="toggle-component"
            onClick={(e) => e.stopPropagation()}
          >
            <Toggle
              isOpen={hideLowBalance}
              setIsOpen={onToggleHideLowBalance}
              size="extra-small"
            />
          </div>
        </MenuItem>
        <MenuItem onClick={(e) => handleToggleClick(e, onToggleShowFiatValue)}>
          <MenuItemXAxis alignY="center" gap="0.5rem">
            <ShowFiatValueIcon
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["white"]
              }
            />
            <Body3 color={textColorByCondition(showFiatValue)}>
              Show Fiat Value Per Chain
            </Body3>
          </MenuItemXAxis>
          <div
            className="toggle-component"
            onClick={(e) => e.stopPropagation()}
          >
            <Toggle
              isOpen={showFiatValue}
              setIsOpen={onToggleShowFiatValue}
              size="extra-small"
            />
          </div>
        </MenuItem>
      </YAxis>
    );
  }
);

interface AssetViewSceneProps {
  assetViewMode: string;
  onGroupByAssetsClick: () => void;
  onFlatViewClick: () => void;
  onBackClick: () => void;
}

const AssetViewScene: React.FC<AssetViewSceneProps> = observer(
  ({ assetViewMode, onGroupByAssetsClick, onFlatViewClick, onBackClick }) => {
    const theme = useTheme();
    const textColorByCondition = (condition: boolean) => {
      return theme.mode === "light"
        ? condition
          ? ColorPalette["gray-700"]
          : ColorPalette["gray-300"]
        : condition
        ? ColorPalette["white"]
        : ColorPalette["gray-200"];
    };
    return (
      <YAxis>
        <MenuItem onClick={onBackClick}>
          <MenuItemXAxis alignY="center" gap="0.5rem">
            <ArrowLeftIcon
              width="1rem"
              height="1rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-300"]
              }
            />
            <Body3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              Back
            </Body3>
          </MenuItemXAxis>
        </MenuItem>
        <MenuItem onClick={onGroupByAssetsClick}>
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <MenuItemXAxis alignY="center" gap="0.5rem">
              <GroupByAssetsIcon
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["white"]
                }
              />
              <Body3 color={textColorByCondition(assetViewMode === "grouped")}>
                Group by Assets
              </Body3>
            </MenuItemXAxis>
            {assetViewMode === "grouped" ? (
              <CheckIcon width="1rem" height="1rem" />
            ) : null}
          </Box>
        </MenuItem>
        <MenuItem onClick={onFlatViewClick}>
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <MenuItemXAxis alignY="center" gap="0.5rem">
              <FlatIcon
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["white"]
                }
              />
              <Body3 color={textColorByCondition(assetViewMode === "flat")}>
                Flat
              </Body3>
            </MenuItemXAxis>
            {assetViewMode === "flat" ? (
              <CheckIcon width="1rem" height="1rem" />
            ) : null}
          </Box>
        </MenuItem>
      </YAxis>
    );
  }
);

const CustomTextButton = styled(TextButton)`
  && button {
    padding: 0.25rem 0 !important;
  }
`;

export const ViewOptionsContextMenu: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();
  // import { useIntl } from "react-intl";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneTransitionRef = useRef<any>(null);
  const [renderMenu, setRenderMenu] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useLayoutEffect(() => {
    if (!initialized) {
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    if (isOpen) {
      setRenderMenu(true);
    } else {
      const timer = setTimeout(() => {
        setRenderMenu(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && sceneTransitionRef.current) {
      sceneTransitionRef.current.replaceAll("main-menu");
    }
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAssetViewClick = () => {
    if (sceneTransitionRef.current) {
      sceneTransitionRef.current.push("asset-view-menu");
    }
  };

  const handleBackClick = () => {
    if (sceneTransitionRef.current) {
      sceneTransitionRef.current.pop();
    }
  };

  const handleToggleHideLowBalance = () => {
    uiConfigStore.toggleHideLowBalance();
  };

  const handleToggleShowFiatValue = () => {
    uiConfigStore.toggleShowFiatValue();
  };

  const handleGroupByAssetsClick = () => {
    uiConfigStore.setAssetViewMode("grouped");
    if (sceneTransitionRef.current) {
      sceneTransitionRef.current.pop();
    }
  };

  const handleFlatViewClick = () => {
    uiConfigStore.setAssetViewMode("flat");
    if (sceneTransitionRef.current) {
      sceneTransitionRef.current.pop();
    }
  };

  const menuContent = (
    <ContextMenuContent>
      <SceneTransition
        ref={sceneTransitionRef}
        scenes={[
          {
            name: "main-menu",
            element: () => (
              <MainMenuScene
                onAssetViewClick={handleAssetViewClick}
                hideLowBalance={uiConfigStore.options.hideLowBalance}
                showFiatValue={uiConfigStore.options.showFiatValue}
                onToggleHideLowBalance={handleToggleHideLowBalance}
                onToggleShowFiatValue={handleToggleShowFiatValue}
              />
            ),
          },
          {
            name: "asset-view-menu",
            element: () => (
              <AssetViewScene
                onBackClick={handleBackClick}
                onGroupByAssetsClick={handleGroupByAssetsClick}
                onFlatViewClick={handleFlatViewClick}
                assetViewMode={uiConfigStore.options.assetViewMode}
              />
            ),
          },
        ]}
        initialSceneProps={{
          name: "main-menu",
        }}
      />
    </ContextMenuContent>
  );

  return (
    <MenuContainer ref={containerRef}>
      {(isOpen || renderMenu) && <MenuBackdrop onClick={closeMenu} />}

      <CustomTextButton
        text={"View Options"}
        size="small"
        right={
          <MenuItemXAxis alignY="center">
            <ViewOptionsIcon
              width="1rem"
              height="1rem"
              color={ColorPalette["gray-200"]}
            />
          </MenuItemXAxis>
        }
        color="faint"
        onClick={toggleMenu}
      />

      <MenuWrapper>
        <VerticalCollapseTransition collapsed={!isOpen} width="100%">
          {menuContent}
        </VerticalCollapseTransition>
      </MenuWrapper>
    </MenuContainer>
  );
});

const ViewOptionsIcon: FunctionComponent<IconProps> = ({ color }) => {
  return (
    <div
      style={{
        width: "1rem",
        height: "1rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <mask
          id="mask0_17569_10438"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="16"
          height="16"
        >
          <rect width="16" height="16" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_17569_10438)">
          <path
            d="M3.99984 9.33334C3.63317 9.33334 3.31928 9.20278 3.05817 8.94167C2.79706 8.68056 2.6665 8.36667 2.6665 8.00001C2.6665 7.63334 2.79706 7.31945 3.05817 7.05834C3.31928 6.79723 3.63317 6.66667 3.99984 6.66667C4.3665 6.66667 4.68039 6.79723 4.9415 7.05834C5.20262 7.31945 5.33317 7.63334 5.33317 8.00001C5.33317 8.36667 5.20262 8.68056 4.9415 8.94167C4.68039 9.20278 4.3665 9.33334 3.99984 9.33334ZM7.99984 9.33334C7.63317 9.33334 7.31928 9.20278 7.05817 8.94167C6.79706 8.68056 6.6665 8.36667 6.6665 8.00001C6.6665 7.63334 6.79706 7.31945 7.05817 7.05834C7.31928 6.79723 7.63317 6.66667 7.99984 6.66667C8.3665 6.66667 8.68039 6.79723 8.9415 7.05834C9.20262 7.31945 9.33317 7.63334 9.33317 8.00001C9.33317 8.36667 9.20262 8.68056 8.9415 8.94167C8.68039 9.20278 8.3665 9.33334 7.99984 9.33334ZM11.9998 9.33334C11.6332 9.33334 11.3193 9.20278 11.0582 8.94167C10.7971 8.68056 10.6665 8.36667 10.6665 8.00001C10.6665 7.63334 10.7971 7.31945 11.0582 7.05834C11.3193 6.79723 11.6332 6.66667 11.9998 6.66667C12.3665 6.66667 12.6804 6.79723 12.9415 7.05834C13.2026 7.31945 13.3332 7.63334 13.3332 8.00001C13.3332 8.36667 13.2026 8.68056 12.9415 8.94167C12.6804 9.20278 12.3665 9.33334 11.9998 9.33334Z"
            fill={color}
          />
        </g>
      </svg>
    </div>
  );
};

const AssetViewIcon: FunctionComponent<IconProps> = ({ color }) => {
  return (
    <div
      style={{
        width: "1rem",
        height: "1rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="12"
        viewBox="0 0 16 12"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.0001 0.224915C6.81065 0.224915 4.2251 2.81047 4.2251 5.99991C4.2251 9.18936 6.81065 11.7749 10.0001 11.7749C13.1895 11.7749 15.7751 9.18936 15.7751 5.99991C15.7751 2.81047 13.1895 0.224915 10.0001 0.224915ZM5.7751 5.99991C5.7751 3.66651 7.66669 1.77491 10.0001 1.77491C12.3335 1.77491 14.2251 3.66651 14.2251 5.99991C14.2251 8.33332 12.3335 10.2249 10.0001 10.2249C7.66669 10.2249 5.7751 8.33332 5.7751 5.99991Z"
          fill={color}
        />
        <path
          d="M3.88816 2.33983C4.25866 2.12551 4.38526 1.65142 4.17094 1.28093C3.95662 0.910429 3.48253 0.783823 3.11203 0.998144C1.38791 1.9955 0.225098 3.86154 0.225098 6.00008C0.225098 8.13862 1.38791 10.0047 3.11203 11.002C3.48253 11.2163 3.95662 11.0897 4.17094 10.7192C4.38526 10.3487 4.25866 9.87464 3.88816 9.66032C2.62328 8.92863 1.7751 7.56295 1.7751 6.00008C1.7751 4.43721 2.62328 3.07153 3.88816 2.33983Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

const HideLowBalanceIcon: FunctionComponent<IconProps> = ({ color }) => {
  return (
    <div
      style={{
        width: "1rem",
        height: "1rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="12"
        viewBox="0 0 14 12"
        fill="none"
      >
        <path
          d="M8.03317 8.33333C7.7665 8.6 7.42206 8.73055 6.99984 8.725C6.57761 8.71944 6.2665 8.56666 6.0665 8.26666L3.24984 4.05C3.14984 3.89444 3.16373 3.75278 3.2915 3.625C3.41928 3.49722 3.56095 3.48333 3.7165 3.58333L7.93317 6.4C8.23317 6.6 8.3915 6.90555 8.40817 7.31666C8.42484 7.72778 8.29984 8.06666 8.03317 8.33333ZM6.99984 0.666664C6.59984 0.666664 6.20539 0.699997 5.8165 0.766664C5.42761 0.833331 5.04984 0.938886 4.68317 1.08333C4.50539 1.15 4.3165 1.275 4.1165 1.45833C3.9165 1.64166 3.86095 1.81666 3.94984 1.98333C4.03873 2.15 4.23873 2.26111 4.54984 2.31666C4.86095 2.37222 5.11095 2.36666 5.29984 2.3C5.57761 2.2 5.85817 2.125 6.1415 2.075C6.42484 2.025 6.71095 2 6.99984 2C8.47761 2 9.73595 2.51944 10.7748 3.55833C11.8137 4.59722 12.3332 5.85555 12.3332 7.33333C12.3332 7.8 12.2693 8.26111 12.1415 8.71666C12.0137 9.17222 11.8332 9.6 11.5998 10H2.39984C2.14428 9.57778 1.95817 9.13889 1.8415 8.68333C1.72484 8.22778 1.6665 7.75555 1.6665 7.26666C1.6665 6.97778 1.6915 6.69444 1.7415 6.41666C1.7915 6.13889 1.8665 5.86666 1.9665 5.6C2.03317 5.41111 2.04428 5.22778 1.99984 5.05C1.95539 4.87222 1.85539 4.72222 1.69984 4.6C1.55539 4.48889 1.39706 4.45555 1.22484 4.5C1.05261 4.54444 0.933169 4.64444 0.866503 4.8C0.699837 5.18889 0.57206 5.58611 0.483171 5.99166C0.394281 6.39722 0.344281 6.81111 0.33317 7.23333C0.322059 7.86666 0.39428 8.47222 0.549836 9.05C0.705392 9.62778 0.93317 10.1778 1.23317 10.7C1.35539 10.9 1.52206 11.0556 1.73317 11.1667C1.94428 11.2778 2.1665 11.3333 2.39984 11.3333H11.5998C11.8332 11.3333 12.0554 11.2778 12.2665 11.1667C12.4776 11.0556 12.6443 10.9 12.7665 10.7C13.0554 10.2 13.2776 9.66944 13.4332 9.10833C13.5887 8.54722 13.6665 7.95555 13.6665 7.33333C13.6665 6.41111 13.4915 5.54722 13.1415 4.74166C12.7915 3.93611 12.3137 3.23055 11.7082 2.625C11.1026 2.01944 10.3943 1.54166 9.58317 1.19166C8.77206 0.841664 7.91095 0.666664 6.99984 0.666664Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

const ShowFiatValueIcon: FunctionComponent<IconProps> = ({ color }) => {
  return (
    <div
      style={{
        width: "1rem",
        height: "1rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M6.66667 13.3333C5.74444 13.3333 4.87778 13.1583 4.06667 12.8083C3.25556 12.4583 2.55 11.9833 1.95 11.3833C1.35 10.7833 0.875 10.0778 0.525 9.26667C0.175 8.45555 0 7.58889 0 6.66667C0 5.74444 0.175 4.87778 0.525 4.06667C0.875 3.25556 1.35 2.55 1.95 1.95C2.55 1.35 3.25556 0.875 4.06667 0.525C4.87778 0.175 5.74444 0 6.66667 0C7.58889 0 8.45555 0.175 9.26667 0.525C10.0778 0.875 10.7833 1.35 11.3833 1.95C11.9833 2.55 12.4583 3.25556 12.8083 4.06667C13.1583 4.87778 13.3333 5.74444 13.3333 6.66667C13.3333 7.58889 13.1583 8.45555 12.8083 9.26667C12.4583 10.0778 11.9833 10.7833 11.3833 11.3833C10.7833 11.9833 10.0778 12.4583 9.26667 12.8083C8.45555 13.1583 7.58889 13.3333 6.66667 13.3333ZM6.66667 12C8.15555 12 9.41667 11.4833 10.45 10.45C11.4833 9.41667 12 8.15555 12 6.66667C12 5.17778 11.4833 3.91667 10.45 2.88333C9.41667 1.85 8.15555 1.33333 6.66667 1.33333C5.17778 1.33333 3.91667 1.85 2.88333 2.88333C1.85 3.91667 1.33333 5.17778 1.33333 6.66667C1.33333 8.15555 1.85 9.41667 2.88333 10.45C3.91667 11.4833 5.17778 12 6.66667 12ZM6.65 11.3333C6.80556 11.3333 6.94167 11.275 7.05833 11.1583C7.175 11.0417 7.23333 10.9056 7.23333 10.75V10.5C7.78889 10.4 8.26667 10.1833 8.66667 9.85C9.06667 9.51667 9.26667 9.02222 9.26667 8.36667C9.26667 7.9 9.13333 7.47222 8.86667 7.08333C8.6 6.69444 8.06667 6.35556 7.26667 6.06667C6.6 5.84444 6.13889 5.65 5.88333 5.48333C5.62778 5.31667 5.5 5.08889 5.5 4.8C5.5 4.51111 5.60278 4.28333 5.80833 4.11667C6.01389 3.95 6.31111 3.86667 6.7 3.86667C6.92222 3.86667 7.11667 3.90556 7.28333 3.98333C7.45 4.06111 7.58889 4.16667 7.7 4.3C7.81111 4.43333 7.93611 4.525 8.075 4.575C8.21389 4.625 8.34444 4.62222 8.46667 4.56667C8.63333 4.5 8.74722 4.38611 8.80833 4.225C8.86944 4.06389 8.85556 3.91667 8.76667 3.78333C8.58889 3.52778 8.36944 3.31111 8.10833 3.13333C7.84722 2.95556 7.56667 2.85556 7.26667 2.83333V2.58333C7.26667 2.42778 7.20833 2.29167 7.09167 2.175C6.975 2.05833 6.83889 2 6.68333 2C6.52778 2 6.39167 2.05833 6.275 2.175C6.15833 2.29167 6.1 2.42778 6.1 2.58333V2.83333C5.54444 2.95556 5.11111 3.2 4.8 3.56667C4.48889 3.93333 4.33333 4.34444 4.33333 4.8C4.33333 5.32222 4.48611 5.74444 4.79167 6.06667C5.09722 6.38889 5.57778 6.66667 6.23333 6.9C6.93333 7.15556 7.41944 7.38333 7.69167 7.58333C7.96389 7.78333 8.1 8.04444 8.1 8.36667C8.1 8.73333 7.96944 9.00278 7.70833 9.175C7.44722 9.34722 7.13333 9.43333 6.76667 9.43333C6.47778 9.43333 6.21667 9.36389 5.98333 9.225C5.75 9.08611 5.55556 8.87778 5.4 8.6C5.31111 8.44444 5.19444 8.33889 5.05 8.28333C4.90556 8.22778 4.76111 8.22778 4.61667 8.28333C4.46111 8.33889 4.34722 8.44444 4.275 8.6C4.20278 8.75556 4.2 8.90555 4.26667 9.05C4.44444 9.42778 4.68333 9.73611 4.98333 9.975C5.28333 10.2139 5.64444 10.3778 6.06667 10.4667V10.75C6.06667 10.9056 6.125 11.0417 6.24167 11.1583C6.35833 11.275 6.49444 11.3333 6.65 11.3333Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

const GroupByAssetsIcon: FunctionComponent<IconProps> = ({ color }) => {
  return (
    <div
      style={{
        width: "1rem",
        height: "1rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="12"
        viewBox="0 0 14 12"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.53333 10.375L4.46674 10.3744C4.2365 10.3744 4.01684 10.2838 3.85588 10.1244C3.69513 9.96523 3.60595 9.75064 3.60595 9.52818V9.11682L10.394 9.11737V9.52875C10.394 9.7512 10.3049 9.96579 10.1441 10.125C9.98317 10.2844 9.76355 10.375 9.53333 10.375ZM10.8127 7.81873C10.9814 7.75963 11.1263 7.65059 11.2283 7.5077C11.3303 7.36485 11.3846 7.19492 11.3845 7.02133V6.23028L2.61548 6.22973V7.02057C2.61542 7.19417 2.6697 7.36428 2.77167 7.50713C2.87367 7.65002 3.01862 7.75906 3.18729 7.81816C3.27703 7.84955 3.37372 7.86681 3.47619 7.86681L10.5238 7.86738C10.6262 7.86738 10.723 7.85007 10.8127 7.81873ZM1.36548 5.91024V7.02038C1.36538 7.45536 1.50152 7.87928 1.75429 8.23338C1.91645 8.46055 2.1214 8.65178 2.35595 8.79766V9.52818C2.35595 10.0861 2.57983 10.62 2.97633 11.0126C3.37261 11.405 3.90879 11.6244 4.4666 11.6244L9.53326 11.625C10.0911 11.625 10.6274 11.4056 11.0237 11.0132C11.4202 10.6205 11.644 10.0867 11.644 9.52875V8.79823C11.8786 8.65235 12.0835 8.46112 12.2457 8.23394C12.4985 7.87985 12.6346 7.45612 12.6345 7.02114V5.91114C12.8691 5.76526 13.074 5.57403 13.2362 5.34685C13.489 4.99275 13.6251 4.56903 13.625 4.13405V2.4718C13.625 1.91386 13.4011 1.38001 13.0046 0.987374C12.6083 0.594948 12.0721 0.375568 11.5143 0.375558L2.48575 0.374992C1.92792 0.374992 1.39168 0.594373 0.995382 0.986809C0.598879 1.37945 0.375 1.91329 0.375 2.47124V4.13348C0.375 4.88551 0.772552 5.54075 1.36548 5.91024ZM11.803 4.9317C11.7106 4.96394 11.6132 4.9804 11.515 4.98029L2.48575 4.97972C2.38328 4.97972 2.28655 4.96246 2.19681 4.93107C1.85947 4.81288 1.625 4.4972 1.625 4.13348V2.47124C1.625 2.24878 1.71418 2.03419 1.87493 1.87501C2.03588 1.71563 2.25545 1.625 2.48568 1.62499L11.5142 1.62556C11.7445 1.62556 11.9641 1.71619 12.1251 1.87557C12.2858 2.03476 12.375 2.24935 12.375 2.4718V4.13405C12.3751 4.30764 12.3208 4.47775 12.2188 4.62061C12.1168 4.76355 11.9717 4.87262 11.803 4.9317Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

const FlatIcon: FunctionComponent<IconProps> = ({ color }) => {
  return (
    <div
      style={{
        width: "1rem",
        height: "1rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0.325195 2.00013C0.325195 1.07506 1.07512 0.325134 2.0002 0.325134H10.0002C10.9253 0.325134 11.6752 1.07506 11.6752 2.00013V3.82494C11.6752 4.75002 10.9253 5.49994 10.0002 5.49994H2.0002C1.07512 5.49994 0.325195 4.75002 0.325195 3.82494V2.00013ZM2.0002 1.67513C1.8207 1.67513 1.6752 1.82064 1.6752 2.00013V3.82494C1.6752 4.00443 1.8207 4.14994 2.0002 4.14994H10.0002C10.1797 4.14994 10.3252 4.00443 10.3252 3.82494V2.00013C10.3252 1.82064 10.1797 1.67513 10.0002 1.67513H2.0002Z"
          fill={color}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0.325195 8.17494C0.325195 7.24986 1.07512 6.49994 2.0002 6.49994H10.0002C10.9253 6.49994 11.6752 7.24986 11.6752 8.17494V10.0001C11.6752 10.9252 10.9253 11.6751 10.0002 11.6751H2.0002C1.07512 11.6751 0.325195 10.9252 0.325195 10.0001V8.17494ZM2.0002 7.84994C1.8207 7.84994 1.6752 7.99545 1.6752 8.17494V10.0001C1.6752 10.1796 1.8207 10.3251 2.0002 10.3251H10.0002C10.1797 10.3251 10.3252 10.1796 10.3252 10.0001V8.17494C10.3252 7.99545 10.1797 7.84994 10.0002 7.84994H2.0002Z"
          fill={color}
        />
      </svg>
    </div>
  );
};
