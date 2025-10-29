import React, { useEffect, useState } from "react";
import { MenuTwoLineIcon } from "../../../../components/icon/menu-two-line";
import { Box } from "../../../../components/box";
import styled, { css } from "styled-components";
import { autoUpdate, offset, useFloating } from "@floating-ui/react-dom";
import { Modal } from "../../../../components/modal";
import { ColorPalette } from "../../../../styles";
import { FormattedMessage } from "react-intl";
import { useLocation, useNavigate } from "react-router";
import { Body2 } from "../../../../components/typography";
import { useStore } from "../../../../stores";
import { Toggle } from "../../../../components/toggle";
import { toggleSidePanelMode } from "../../../../utils";
import {
  GetSidePanelEnabledMsg,
  GetSidePanelIsSupportedMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { dispatchGlobalEventExceptSelf } from "../../../../utils/global-events";

const Styles = {
  MenuFloatingBarContainer: styled.div<{
    top: number;
    left: number;
    strategy: string;
  }>`
    position: ${({ strategy }) => strategy ?? "absolute"};
    top: ${({ top }) => top.toString()}px;
    left: ${({ left }) => left.toString()}px;
    max-width: 13.875rem;

    background-color: rgba(37, 37, 37, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);

    border-radius: 0.75rem;

    display: flex;
    flex-direction: column;
  `,

  MenuItem: styled.div<{ key: string; isTopOrBottom?: "top" | "bottom" }>`
    padding: 1rem;
    cursor: pointer;

    display: flex;
    align-items: center;

    &:hover {
      background-color: rgba(37, 37, 37, 0.7);
    }
    ${({ isTopOrBottom }) =>
      isTopOrBottom &&
      css`
        border-radius: ${isTopOrBottom === "top"
          ? "0.75rem 0.75rem 0 0"
          : "0 0 0.75rem 0.75rem"};
      `}
    gap: 0.75rem;
  `,
};

export const FloatingMenuBar = ({
  isOpen,
  openMenu,
  closeMenu,
}: {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}) => {
  const { keyRingStore, analyticsStore } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { x, y, strategy, refs } = useFloating({
    placement: "bottom-end",
    middleware: [
      offset({
        mainAxis: 10,
        crossAxis: -15,
      }),
    ],
    open: isOpen,
    whileElementsMounted: autoUpdate,
  });
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

  return (
    <React.Fragment>
      <Box
        onClick={openMenu}
        cursor="pointer"
        paddingRight="0.75rem"
        ref={refs.setReference}
      >
        <MenuTwoLineIcon
          width="1.5rem"
          height="1.5rem"
          color={ColorPalette["gray-300"]}
        />
      </Box>
      {isOpen && (
        <Modal isOpen={isOpen} align="left" close={closeMenu}>
          <Styles.MenuFloatingBarContainer
            top={y ?? 0}
            left={x ?? 0}
            strategy={strategy}
            ref={refs.setFloating}
          >
            <Styles.MenuItem
              key="manage-chain-visibility"
              isTopOrBottom={"top"}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.preventDefault();
                if (keyRingStore.selectedKeyInfo) {
                  analyticsStore.logEvent("click_menu_manageChainVisibility");
                  navigate(
                    `/manage-chains?vaultId=${keyRingStore.selectedKeyInfo.id}`
                  );
                }
              }}
            >
              <AddRemoveChainsIcon color={ColorPalette["gray-300"]} />
              <Body2 color={ColorPalette["white"]}>
                <FormattedMessage id="page.main.components.menu-bar.manage-chain-visibility-title" />
              </Body2>
            </Styles.MenuItem>

            <Styles.MenuItem
              key="manage-asset-list"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.preventDefault();
                navigate("/manage-view-asset-token-list");
              }}
            >
              <ManageAssetListIcon color={ColorPalette["gray-300"]} />
              <Body2 color={ColorPalette["white"]}>
                <FormattedMessage id="page.main.components.menu-bar.manage-asset-list-title" />
              </Body2>
            </Styles.MenuItem>

            <Styles.MenuItem
              key="my-contacts"
              onClick={() => {
                navigate("/setting/contacts/list");
              }}
            >
              <ContactsIcon color={ColorPalette["gray-300"]} />
              <Body2 color={ColorPalette["white"]}>
                <FormattedMessage id="page.main.components.menu-bar.my-contacts-title" />
              </Body2>
            </Styles.MenuItem>

            <Styles.MenuItem
              key="go-to-dashboard"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.preventDefault();
                analyticsStore.logEvent("click_keplrDashboard", {
                  tabName: "available",
                });
                browser.tabs.create({
                  url: "https://wallet.keplr.app/?utm_source=keplrextension&utm_medium=button&utm_campaign=permanent&utm_content=manage_portfolio",
                });
              }}
            >
              <GoToDashboardIcon color={ColorPalette["gray-300"]} />
              <Body2 color={ColorPalette["white"]}>
                <FormattedMessage id="page.main.components.menu-bar.go-to-dashboard" />
              </Body2>
            </Styles.MenuItem>

            {sidePanelSupported && (
              <Styles.MenuItem
                key="side-panel-mode"
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  toggleSidePanelMode(!sidePanelEnabled, (res) => {
                    setSidePanelEnabled(res);
                  });
                }}
              >
                <SidePanelModeIcon color={ColorPalette["gray-300"]} />
                <Body2 color={ColorPalette["white"]}>
                  <FormattedMessage id="page.main.components.menu-bar.side-panel-mode" />
                </Body2>
                <Toggle size="extra-small" isOpen={sidePanelEnabled} />
              </Styles.MenuItem>
            )}

            <Styles.MenuItem
              key="lock-wallet"
              onClick={async (e: React.MouseEvent<HTMLDivElement>) => {
                e.preventDefault();
                await keyRingStore.lock();

                dispatchGlobalEventExceptSelf("keplr_keyring_locked");
              }}
            >
              <LockWalletIcon color={ColorPalette["gray-300"]} />
              <Body2 color={ColorPalette["white"]}>
                <FormattedMessage id="page.main.components.menu-bar.lock-wallet-title" />
              </Body2>
            </Styles.MenuItem>

            {location.pathname !== "/setting" && (
              <Styles.MenuItem
                key="go-to-setting-page"
                isTopOrBottom={"bottom"}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  navigate("/setting");
                }}
              >
                <SettingsIcon color={ColorPalette["gray-300"]} />
                <Body2 color={ColorPalette["white"]}>
                  <FormattedMessage id="page.main.components.menu-bar.go-to-setting-page" />
                </Body2>
              </Styles.MenuItem>
            )}
          </Styles.MenuFloatingBarContainer>
        </Modal>
      )}
    </React.Fragment>
  );
};

// 현재 공통 icon이라도 viewBox가 달라서 일단 여기에 따로 아이콘 만들어서 사용
const SidePanelModeIcon = ({ color }: { color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M12.2222 3.33331V16.6666M6.8889 3.33331H13.1111C14.3557 3.33331 14.978 3.33331 15.4533 3.57552C15.8715 3.78857 16.2114 4.12853 16.4245 4.54667C16.6667 5.02203 16.6667 5.64431 16.6667 6.88887V13.1111C16.6667 14.3557 16.6667 14.9779 16.4245 15.4533C16.2114 15.8714 15.8715 16.2114 15.4533 16.4244C14.978 16.6666 14.3557 16.6666 13.1111 16.6666H6.8889C5.64434 16.6666 5.02206 16.6666 4.5467 16.4244C4.12856 16.2114 3.7886 15.8714 3.57555 15.4533C3.33334 14.9779 3.33334 14.3557 3.33334 13.1111V6.88887C3.33334 5.64431 3.33334 5.02203 3.57555 4.54667C3.7886 4.12853 4.12856 3.78857 4.5467 3.57552C5.02206 3.33331 5.64434 3.33331 6.8889 3.33331Z"
        stroke={color}
        strokeWidth="1.48148"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
const SettingsIcon = ({ color }: { color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
    >
      <path
        d="M10.2947 1.71576C9.84148 1.71576 9.39779 1.75439 8.96464 1.82848L8.69772 2.94502C8.2831 4.6803 6.51538 5.71168 4.82061 5.20552L3.89017 4.92676C3.33116 5.65441 2.88328 6.4816 2.57367 7.37615L3.26434 8.04638C4.52673 9.27394 4.52673 11.3154 3.26434 12.543L2.57367 13.2132C2.88328 14.1078 3.33039 14.9342 3.89017 15.6626L4.82061 15.3839C6.51538 14.8777 8.2831 15.9091 8.69772 17.6444L8.96464 18.7609C9.39779 18.835 9.84225 18.8736 10.2947 18.8736C10.7479 18.8736 11.1916 18.835 11.6248 18.7609L11.8917 17.6444C12.3063 15.9091 14.074 14.8777 15.7688 15.3839L16.6992 15.6626C17.2582 14.935 17.7061 14.1078 18.0157 13.2132L17.3251 12.543C16.0627 11.3162 16.0627 9.27316 17.3251 8.04638L18.0157 7.37615C17.7061 6.4816 17.259 5.65519 16.6992 4.92676L15.7688 5.20552C14.074 5.71168 12.3063 4.6803 11.8917 2.94502L11.6248 1.82848C11.1916 1.75439 10.7479 1.71576 10.2947 1.71576ZM10.2947 7.95498C11.5741 7.95498 12.611 9.00239 12.611 10.2947C12.611 11.587 11.5741 12.6344 10.2947 12.6344C9.01533 12.6344 7.97839 11.587 7.97839 10.2947C7.97839 9.00239 9.01533 7.95498 10.2947 7.95498Z"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
};

const AddRemoveChainsIcon = ({ color }: { color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M14.2586 8.5138C14.7281 8.5138 15.1089 8.89458 15.1089 9.36405V10.9368H16.595C17.0645 10.9368 17.4453 11.3175 17.4453 11.787C17.4453 12.2565 17.0645 12.6372 16.595 12.6372H15.1089V14.211C15.1086 14.6802 14.7279 15.0612 14.2586 15.0612C13.7893 15.0612 13.4087 14.6802 13.4084 14.211V12.6372H11.7481C11.2787 12.6372 10.8979 12.2565 10.8979 11.787C10.8979 11.3175 11.2787 10.9368 11.7481 10.9368H13.4084V9.36405C13.4084 8.89458 13.7892 8.5138 14.2586 8.5138Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.0458 5.00515C17.7967 5.05522 18.4784 5.47572 18.858 6.13311L21.4671 10.653L21.5385 10.7858C21.8486 11.4162 21.8485 12.1558 21.5385 12.7862L21.4671 12.92L18.858 17.4389C18.4784 18.0964 17.7968 18.5178 17.0458 18.5678L16.8949 18.5729H11.6767C10.9176 18.5729 10.2119 18.1928 9.79307 17.5677L9.71358 17.4389L7.10348 12.92C6.69861 12.2187 6.69872 11.3543 7.10348 10.653L9.71358 6.13311C10.1186 5.43203 10.867 5.00012 11.6767 5.00012H16.8949L17.0458 5.00515ZM11.6767 6.75193C11.4927 6.75193 11.322 6.85019 11.2299 7.00952L8.62084 11.5284C8.54034 11.6678 8.53033 11.8357 8.59065 11.9822L8.62084 12.0436L11.2299 16.5635C11.322 16.7228 11.4927 16.8211 11.6767 16.8211H16.8949C17.0787 16.821 17.2486 16.7226 17.3406 16.5635L19.9508 12.0436C20.0425 11.8843 20.0426 11.6876 19.9508 11.5284L17.3406 7.00952L17.3034 6.95217C17.2068 6.82659 17.0559 6.75201 16.8949 6.75193H11.6767Z"
        fill={color}
      />
      <path
        d="M5.567 6.18845C5.79466 5.76181 6.32458 5.60067 6.7513 5.82823C7.17798 6.05579 7.33989 6.58581 7.11253 7.01254L4.91497 11.132C4.72446 11.4898 4.70045 11.9107 4.84353 12.2841L4.91497 12.441L7.11253 16.5595C7.33994 16.9862 7.178 17.5172 6.7513 17.7448C6.32486 17.9718 5.79473 17.8106 5.567 17.3845L3.36944 13.2651L3.2829 13.09C2.87863 12.2035 2.90778 11.1742 3.36944 10.3079L5.567 6.18845Z"
        fill={color}
      />
    </svg>
  );
};

const ManageAssetListIcon = ({ color }: { color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M13.8665 8.68837C14.3568 8.68851 14.7548 9.08628 14.7548 9.57668V11.1062H16.2949C16.7852 11.1064 17.1832 11.5041 17.1832 11.9945C17.1832 12.4849 16.7852 12.8827 16.2949 12.8828H14.7548V14.4208C14.7548 14.9112 14.3568 15.309 13.8665 15.3091C13.376 15.3091 12.9782 14.9113 12.9782 14.4208V12.8828H11.4507C10.9602 12.8828 10.5624 12.485 10.5624 11.9945C10.5624 11.5041 10.9602 11.1062 11.4507 11.1062H12.9782V9.57668C12.9782 9.0862 13.376 8.68837 13.8665 8.68837Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.8717 4.62531C16.5061 4.62531 18.9408 6.03063 20.258 8.31203C21.575 10.5933 21.575 13.4042 20.258 15.6855C18.9408 17.9669 16.5061 19.3722 13.8717 19.3722C11.2374 19.3721 8.80256 17.9669 7.48541 15.6855C6.16855 13.4042 6.16855 10.5933 7.48541 8.31203C8.80256 6.03064 11.2374 4.62543 13.8717 4.62531ZM13.8717 6.45447C11.8913 6.4546 10.061 7.51155 9.07069 9.22661C8.08049 10.9418 8.08049 13.0557 9.07069 14.7709C10.061 16.4859 11.8913 17.5429 13.8717 17.543C15.8522 17.543 17.6824 16.486 18.6728 14.7709C19.6631 13.0556 19.6631 10.9419 18.6728 9.22661C17.6824 7.51154 15.8522 6.45447 13.8717 6.45447Z"
        fill={color}
      />
      <path
        d="M4.77319 6.37037C5.05752 5.95274 5.62747 5.84435 6.0452 6.12859C6.46254 6.41296 6.57104 6.98298 6.28698 7.4006C4.40611 10.1649 4.34705 13.5262 6.11038 16.3278L6.28698 16.5969L6.33534 16.6768C6.5561 17.0845 6.43661 17.6023 6.0452 17.8689C5.65368 18.1353 5.12832 18.0565 4.82996 17.7018L4.77319 17.6271L4.55874 17.2991C2.41126 13.8841 2.4827 9.73661 4.77319 6.37037Z"
        fill={color}
      />
    </svg>
  );
};

const ContactsIcon = ({ color }: { color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M14.2749 5.46307C14.5521 5.44734 14.8317 5.45935 15.1083 5.50095L15.3571 5.54702C15.9345 5.67122 16.4795 5.92026 16.9521 6.27798C17.4919 6.68681 17.9204 7.22507 18.199 7.84229C18.4776 8.45955 18.5976 9.13666 18.5471 9.812C18.4966 10.4874 18.2777 11.14 17.9103 11.709C17.6855 12.0571 17.4079 12.3658 17.0913 12.6284C19.3911 13.4898 21 15.1984 21 17.6177C20.9999 18.0035 20.6867 18.3159 20.3008 18.3159H17.4875C17.1018 18.3156 16.7884 18.0034 16.7883 17.6177C16.7883 17.2318 17.1017 16.9187 17.4875 16.9184H19.5319C19.1784 15.1233 17.5633 13.9004 15.2803 13.6122C14.9311 13.5679 14.6681 13.2701 14.6681 12.9181V12.7512L14.6783 12.6345C14.7234 12.3687 14.9199 12.1481 15.1871 12.0766C15.3905 12.0224 15.5884 11.9435 15.7747 11.8421L15.9181 11.7582C16.2457 11.5522 16.5254 11.2766 16.7361 10.9504C16.9767 10.5777 17.1196 10.15 17.1527 9.70758C17.1858 9.26532 17.1078 8.82188 16.9255 8.41764C16.7429 8.01324 16.4612 7.66071 16.1075 7.39286C15.798 7.15859 15.4414 6.9951 15.0632 6.91374L14.9005 6.88405C14.6588 6.84772 14.4131 6.84454 14.1726 6.87483L14.0313 6.87791C13.7074 6.85281 13.4347 6.60364 13.3925 6.26877C13.3443 5.88597 13.6158 5.53607 13.9985 5.48764L14.2749 5.46307Z"
        fill={color}
      />
      <path
        d="M9.47351 5.63097C11.6155 5.63108 13.3523 7.36808 13.3525 9.50999C13.3525 10.8247 12.6967 11.9851 11.6961 12.6867C14.1005 13.4615 15.8709 15.3558 15.8712 17.7917C15.8712 18.0811 15.6365 18.3157 15.3471 18.3159H3.60559C3.3161 18.3159 3.08142 18.0812 3.08142 17.7917C3.08177 15.3567 4.84799 13.4632 7.25093 12.6877C6.25002 11.9862 5.59455 10.8249 5.59448 9.50999C5.59476 7.36801 7.33146 5.63097 9.47351 5.63097Z"
        fill={color}
      />
    </svg>
  );
};

const GoToDashboardIcon = ({ color }: { color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M11.25 5H4.375C3.33947 5 2.5 5.83947 2.5 6.875V15.625C2.5 16.6605 3.33947 17.5 4.375 17.5H13.125C14.1605 17.5 15 16.6605 15 15.625V8.75M6.25 13.75L17.5 2.5M17.5 2.5L13.125 2.5M17.5 2.5V6.875"
        stroke={color}
        strokeWidth="1.45706"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
const LockWalletIcon = ({ color }: { color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M5.00001 18.3333C4.54168 18.3333 4.14945 18.1703 3.82334 17.8441C3.49723 17.518 3.3339 17.1255 3.33334 16.6666V8.33331C3.33334 7.87498 3.49668 7.48276 3.82334 7.15665C4.15001 6.83054 4.54223 6.6672 5.00001 6.66665H5.83334V4.99998C5.83334 3.8472 6.23973 2.8647 7.05251 2.05248C7.86529 1.24026 8.84779 0.833869 10 0.833314C11.1522 0.832758 12.135 1.23915 12.9483 2.05248C13.7617 2.86581 14.1678 3.84831 14.1667 4.99998V6.66665H15C15.4583 6.66665 15.8508 6.82998 16.1775 7.15665C16.5042 7.48331 16.6672 7.87554 16.6667 8.33331V16.6666C16.6667 17.125 16.5036 17.5175 16.1775 17.8441C15.8514 18.1708 15.4589 18.3339 15 18.3333H5.00001ZM5.00001 16.6666H15V8.33331H5.00001V16.6666ZM10 14.1666C10.4583 14.1666 10.8508 14.0036 11.1775 13.6775C11.5042 13.3514 11.6672 12.9589 11.6667 12.5C11.6661 12.0411 11.5031 11.6489 11.1775 11.3233C10.852 10.9978 10.4595 10.8344 10 10.8333C9.54057 10.8322 9.14834 10.9955 8.82334 11.3233C8.49834 11.6511 8.33501 12.0433 8.33334 12.5C8.33168 12.9566 8.49501 13.3491 8.82334 13.6775C9.15168 14.0058 9.5439 14.1689 10 14.1666ZM7.50001 6.66665H12.5V4.99998C12.5 4.30554 12.257 3.71526 11.7708 3.22915C11.2847 2.74304 10.6945 2.49998 10 2.49998C9.30557 2.49998 8.71529 2.74304 8.22918 3.22915C7.74307 3.71526 7.50001 4.30554 7.50001 4.99998V6.66665Z"
        fill={color}
      />
    </svg>
  );
};
