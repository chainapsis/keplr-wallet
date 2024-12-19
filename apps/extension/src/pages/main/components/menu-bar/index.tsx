import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { CloseIcon, LinkIcon } from "../../../../components/icon";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import { useNavigate } from "react-router";
import { Gutter } from "../../../../components/gutter";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import {
  Button2,
  Caption1,
  H3,
  H5,
  Subtitle4,
} from "../../../../components/typography";
import { XAxis } from "../../../../components/axis";
import { Bleed } from "../../../../components/bleed";
import { FormattedMessage } from "react-intl";
import { useLocation } from "react-router-dom";
import { isRunningInSidePanel, toggleSidePanelMode } from "../../../../utils";
import { dispatchGlobalEventExceptSelf } from "../../../../utils/global-events";
import { Column, Columns } from "../../../../components/column";
import {
  GetSidePanelEnabledMsg,
  GetSidePanelIsSupportedMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import Color from "color";

const Styles = {
  MenuItem: styled(H3)`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-700"]
        : ColorPalette["white"]};

    cursor: pointer;
  `,
  Flex1: styled.div`
    flex: 1;
  `,
};

export const MenuBar: FunctionComponent<{
  isOpen: boolean;
  close: () => void;

  showSidePanelRecommendationTooltip?: boolean;
}> = observer(({ isOpen, close, showSidePanelRecommendationTooltip }) => {
  const { analyticsStore, keyRingStore, uiConfigStore } = useStore();

  const location = useLocation();

  const theme = useTheme();
  const navigate = useNavigate();

  const [sidePanelSupported, setSidePanelSupported] = useState(false);
  const [sidePanelEnabled, setSidePanelEnabled] = useState(false);
  useEffect(() => {
    const msg = new GetSidePanelIsSupportedMsg();
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, msg)
      .then((res) => {
        setSidePanelSupported(res.supported);

        const msg = new GetSidePanelEnabledMsg();
        new InExtensionMessageRequester()
          .sendMessage(BACKGROUND_PORT, msg)
          .then((res) => {
            setSidePanelEnabled(res.enabled);
          });
      });
  }, []);

  const [
    animateSidePanelRecommendationTooltip,
    setAnimateSidePanelRecommendationTooltip,
  ] = useState(false);
  const prevIsOpen = useRef(isOpen);
  useEffect(() => {
    if (showSidePanelRecommendationTooltip) {
      // 좀 이상한데. Modal은 open될때 컴포넌트가 마운트되고 close되면 언마운트 되기 때문에
      // 여기서 true, true인 경우가 맞음...
      if (prevIsOpen.current && isOpen) {
        setTimeout(() => {
          setAnimateSidePanelRecommendationTooltip(true);
        }, 750);
      }
    }
    if (prevIsOpen.current !== isOpen) {
      prevIsOpen.current = isOpen;
    }
  }, [isOpen, showSidePanelRecommendationTooltip]);

  return (
    <Box
      height="100%"
      width="fit-content"
      alignX="left"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
      paddingTop="1.125rem"
      paddingX="1.75rem"
      paddingBottom="1.25rem"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Bleed horizontal="0.15rem">
        {/*
            좀 이상한 구조지만 clickable area를 조절하고
            아이콘이 약간 오른쪽으로 치우져보이는 느낌을 없애기 위해서
            어쩔 수 없이 약간 복잡해짐
           */}
        <Box alignX="left">
          <Box onClick={close} cursor="pointer">
            <CloseIcon
              width="1.5rem"
              height="1.5rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-50"]
              }
            />
          </Box>
        </Box>
      </Bleed>
      <Gutter size="1.25rem" />

      <Stack gutter="1.5rem">
        <Styles.MenuItem
          onClick={(e) => {
            e.preventDefault();

            if (keyRingStore.selectedKeyInfo) {
              analyticsStore.logEvent("click_menu_manageChainVisibility");
              browser.tabs
                .create({
                  url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}&skipWelcome=true`,
                })
                .then(() => {
                  if (!isRunningInSidePanel()) {
                    window.close();
                  } else {
                    close();
                  }
                });
            }
          }}
        >
          <FormattedMessage id="page.main.components.menu-bar.manage-chain-visibility-title" />
        </Styles.MenuItem>

        <Gutter size="1rem" />

        <Box
          width="6.5rem"
          style={{
            border: `1px solid ${
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-400"]
            }`,
          }}
        />

        <Gutter size="1rem" />

        <Styles.MenuItem onClick={() => navigate("/setting/contacts/list")}>
          <FormattedMessage id="page.main.components.menu-bar.my-contacts-title" />
        </Styles.MenuItem>

        <Styles.MenuItem onClick={() => navigate("/setting/token/list")}>
          <FormattedMessage id="page.main.components.menu-bar.add-token-title" />
        </Styles.MenuItem>

        {location.pathname !== "/setting" ? (
          <Styles.MenuItem
            onClick={() => {
              navigate("/setting");
            }}
          >
            <FormattedMessage id="page.main.components.menu-bar.setting-title" />
          </Styles.MenuItem>
        ) : null}
      </Stack>

      <Styles.Flex1 />

      <Box width="100%" minWidth="14rem">
        <Bleed horizontal="0.5rem">
          {sidePanelSupported ? (
            <Box
              backgroundColor={
                theme.mode === "light"
                  ? ColorPalette["gray-10"]
                  : ColorPalette["gray-500"]
              }
              borderRadius="0.75rem"
              padding="0.75rem"
            >
              <XAxis alignY="center">
                <H5
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-600"]
                      : ColorPalette["gray-50"]
                  }
                >
                  Display Setting
                </H5>
                <div style={{ flex: 1 }} />
                <svg
                  cursor="pointer"
                  onClick={(e) => {
                    e.preventDefault();

                    browser.tabs.create({
                      url: "https://help.keplr.app/articles/side-panel-mode",
                    });
                  }}
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  stroke="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.83594 5.51256C7.61699 4.82915 8.88332 4.82915 9.66436 5.51256C10.4454 6.19598 10.4454 7.30402 9.66436 7.98744C9.52842 8.10639 9.37778 8.20463 9.21755 8.28217C8.72043 8.52276 8.25015 8.94772 8.25015 9.5V10M14.25 8.5C14.25 11.8137 11.5637 14.5 8.25 14.5C4.93629 14.5 2.25 11.8137 2.25 8.5C2.25 5.18629 4.93629 2.5 8.25 2.5C11.5637 2.5 14.25 5.18629 14.25 8.5ZM8.25 12H8.255V12.005H8.25V12Z"
                    stroke={
                      theme.mode === "light"
                        ? ColorPalette["gray-200"]
                        : ColorPalette["gray-300"]
                    }
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </XAxis>
              <Gutter size="0.75rem" />
              <Columns sum={2}>
                <Column weight={1}>
                  <PanelModeItem
                    onClick={() => {
                      toggleSidePanelMode(!sidePanelEnabled, (res) => {
                        setSidePanelEnabled(res);

                        if (res) {
                          uiConfigStore.setShowNewSidePanelHeaderTop(false);
                        }
                      });
                    }}
                    animateSidePanelRecommendationTooltip={
                      animateSidePanelRecommendationTooltip
                    }
                    isSelected={sidePanelEnabled}
                    isSidePanel={true}
                    img={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M15 3V21M7.8 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    text={<Subtitle4>Side Panel</Subtitle4>}
                  />
                </Column>
                <Gutter size="0.5rem" />
                <Column weight={1}>
                  <PanelModeItem
                    onClick={() => {
                      toggleSidePanelMode(!sidePanelEnabled, (res) => {
                        setSidePanelEnabled(res);

                        if (res) {
                          uiConfigStore.setShowNewSidePanelHeaderTop(false);
                        }
                      });
                    }}
                    isSidePanel={false}
                    isSelected={!sidePanelEnabled}
                    img={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M4 14H10M10 14V20M10 14L3 21M20 10H14M14 10V4M14 10L21 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    text={<Subtitle4> Classic</Subtitle4>}
                  />
                </Column>
              </Columns>
            </Box>
          ) : null}

          <Gutter size="1rem" />

          <Styles.MenuItem
            onClick={async (e) => {
              e.preventDefault();

              await keyRingStore.lock();

              dispatchGlobalEventExceptSelf("keplr_keyring_locked");
            }}
          >
            <FormattedMessage id="page.main.components.menu-bar.lock-wallet-title" />
          </Styles.MenuItem>

          <Gutter size="1rem" />

          <Box
            width="6.5rem"
            style={{
              border: `1px solid ${
                theme.mode === "light"
                  ? ColorPalette["gray-100"]
                  : ColorPalette["gray-400"]
              }`,
            }}
          />

          <Gutter size="1rem" />

          <Box
            cursor="pointer"
            onClick={(e) => {
              e.preventDefault();

              browser.tabs.create({
                url: "https://chains.keplr.app/",
              });
            }}
          >
            <XAxis alignY="center">
              <Button2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
              >
                <FormattedMessage id="page.main.components.menu-bar.go-to-keplr-chain-registry" />
              </Button2>

              <Gutter size="0.25rem" />

              <LinkIcon
                width="1.125rem"
                height="1.125rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
              />
            </XAxis>
          </Box>
        </Bleed>
      </Box>
    </Box>
  );
});

const PanelModeItemStylesImageContainer = styled.div<{
  isSelected: boolean;
}>`
  transition: color 0.15s linear;

  color: ${(props) => {
    if (props.theme.mode === "light") {
      return props.isSelected
        ? ColorPalette["blue-400"]
        : ColorPalette["gray-300"];
    }

    return props.isSelected
      ? ColorPalette["gray-50"]
      : ColorPalette["gray-300"];
  }};
`;

const PanelModeItemStylesTextContainer = styled(Box)<{
  isSelected: boolean;
}>`
  transition: color 0.15s linear;

  color: ${(props) => {
    if (props.theme.mode === "light") {
      return props.isSelected
        ? ColorPalette["blue-400"]
        : ColorPalette["gray-300"];
    }

    return props.isSelected
      ? ColorPalette["gray-50"]
      : ColorPalette["gray-300"];
  }};
`;

const PanelModeItemStylesContainer = styled(Box)<{
  isSelected: boolean;
}>`
  transition: background-color 0.15s linear, box-shadow 0.15s linear;

  background-color: ${(props) => {
    if (props.theme.mode === "light") {
      return props.isSelected
        ? "rgba(86, 111, 236, 0.10)"
        : ColorPalette["white"];
    }

    return props.isSelected
      ? "rgba(86, 111, 236, 0.10)"
      : ColorPalette["gray-450"];
  }};

  box-shadow: ${(props) => {
    if (props.theme.mode === "light") {
      return props.isSelected
        ? `0 0 0 1px ${ColorPalette["blue-300"]} inset`
        : `0 0 0 1px ${ColorPalette["gray-50"]} inset`;
    }

    return props.isSelected
      ? `0 0 0 1px ${ColorPalette["blue-300"]} inset`
      : "0 0 0 1px rgba(66, 66, 71, 0.20) inset";
  }};

  &:hover {
    background-color: ${(props) => {
      if (props.isSelected) {
        return;
      }

      return Color(ColorPalette["blue-300"]).alpha(0.05).toString();
    }};

    box-shadow: ${(props) => {
      if (props.isSelected) {
        return;
      }

      return `0 0 0 1px ${Color(ColorPalette["blue-300"])
        .alpha(0.5)
        .toString()} inset`;
    }};

    ${PanelModeItemStylesImageContainer} {
      color: ${(props) => {
        if (props.theme.mode === "light") {
          return ColorPalette["blue-400"];
        }

        return ColorPalette["gray-50"];
      }};
    }

    ${PanelModeItemStylesTextContainer} {
      color: ${(props) => {
        if (props.theme.mode === "light") {
          return ColorPalette["blue-400"];
        }

        return ColorPalette["gray-50"];
      }};
    }
  }
`;

const PanelModeItemStylesTooltip = styled.div<{
  isMounted: boolean;
}>`
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

  transform: ${(props) => (props.isMounted ? "scale(1)" : "scale(0)")};
  transform-origin: 50% 95%;
`;

const PanelModeItem: FunctionComponent<{
  isSelected: boolean;
  onClick: () => void;

  isSidePanel: boolean;
  img: React.ReactElement;
  text: React.ReactElement;

  animateSidePanelRecommendationTooltip?: boolean;
}> = ({
  isSelected,
  onClick,
  text,
  img,
  animateSidePanelRecommendationTooltip,
}) => {
  return (
    <PanelModeItemStylesContainer
      position="relative"
      isSelected={isSelected}
      borderRadius="0.5rem"
      paddingTop="0.75rem"
      paddingBottom="0.5rem"
      cursor={isSelected ? undefined : "pointer"}
      onClick={(e) => {
        e.preventDefault();

        if (!isSelected) {
          onClick();
        }
      }}
    >
      {animateSidePanelRecommendationTooltip ? <AnimatedTooltip /> : null}
      <Box alignX="center">
        <PanelModeItemStylesImageContainer isSelected={isSelected}>
          {img}
        </PanelModeItemStylesImageContainer>
        <Gutter size="0.25rem" />
        <PanelModeItemStylesTextContainer isSelected={isSelected}>
          <XAxis alignY="center">{text}</XAxis>
        </PanelModeItemStylesTextContainer>
      </Box>
    </PanelModeItemStylesContainer>
  );
};

const AnimatedTooltip: FunctionComponent = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <PanelModeItemStylesTooltip
      isMounted={isMounted}
      style={{
        position: "absolute",
        zIndex: 2,
        bottom: "105%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        whiteSpace: "nowrap",
      }}
    >
      <Box
        position="relative"
        backgroundColor={ColorPalette["blue-300"]}
        borderRadius="0.5rem"
      >
        <Box paddingX="0.75rem" paddingY="0.5rem">
          <Caption1 color={ColorPalette["gray-50"]}>
            Try the new mode ✨
          </Caption1>
        </Box>
        <div
          style={{
            position: "absolute",
            top: "99%",
            left: "50%",
            transform: "translateX(-50%)",

            // 왜인지는 모르겠고 line height가 이 엘레먼트의 최소 하이트를 결정하더라...
            // svg가 line height 기본값보다 작기 때문에 강제로 0으로 설정해준다.
            lineHeight: 0,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="7"
            fill="none"
            stroke="none"
            viewBox="0 0 13 7"
          >
            <path
              fill={ColorPalette["blue-300"]}
              d="M4.9 5.867a2 2 0 003.2 0L12.5 0H.5l4.4 5.867z"
            />
          </svg>
        </div>
      </Box>
    </PanelModeItemStylesTooltip>
  );
};
