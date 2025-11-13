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
import { XAxis, YAxis } from "../../../../components/axis";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse/collapse";
import { Body2, Body3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { FormattedMessage, useIntl } from "react-intl";
import { Toggle } from "../../../../components/toggle/toggle";
import { AdjustmentIcon, CloseIcon } from "../../../../components/icon";
import { IconProps } from "../../../../components/icon/types";
import { useGlobarSimpleBar } from "../../../../hooks/global-simplebar";
import { Tooltip } from "../../../../components/tooltip";
import { Gutter } from "../../../../components/gutter";
import { isRunningInSidePanel } from "../../../../utils";
import { COMMON_HOVER_OPACITY } from "../../../../styles/constant";
import { useNavigate } from "react-router";
import { ContextMenuStyles } from "../../../../components/context-menu";

const Styles = {
  MenuContainer: styled.div`
    position: relative;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-color: transparent;
  `,
  ContextMenuContent: styled(ContextMenuStyles.Container)`
    position: absolute;
    right: 0;
    top: calc(100% + 0.5rem);
    z-index: 9999;
    min-width: 15.625rem;
    overflow: visible;
    border-radius: 0.5rem;
    overflow: hidden;
  `,
  MenuBackdrop: styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9998;
    background-color: transparent;
  `,
  MenuItem: styled(ContextMenuStyles.Item)`
    padding: 0.75rem 0.75rem 0.75rem 1rem;
    justify-content: space-between;

    border-bottom: 1px solid
      ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-400"]};

    &:last-child {
      border-bottom: none;
    }
  `,
  MenuItemXAxis: styled(XAxis)`
    height: 100%;
    display: flex;
    align-items: center;
  `,
};

interface MainMenuProps {
  hideLowBalance: boolean;
  showFiatValue: boolean;
  assetViewMode: string;
  onToggleHideLowBalance: () => void;
  onToggleShowFiatValue: () => void;
  onToggleAssetViewMode: () => void;
  showFiatValueVisible: boolean;
}

const MainMenu: React.FC<MainMenuProps> = observer(
  ({
    onToggleHideLowBalance,
    onToggleShowFiatValue,
    onToggleAssetViewMode,
    showFiatValueVisible,
    assetViewMode,
  }) => {
    const { uiConfigStore } = useStore();
    const { hideLowBalance, showFiatValue } = uiConfigStore.options;
    const theme = useTheme();
    const intl = useIntl();
    const navigate = useNavigate();

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
        <Styles.MenuItem
          onClick={(e) => {
            e.preventDefault();
            navigate("/manage-view-asset-token-list");
          }}
        >
          <Styles.MenuItemXAxis alignY="center" gap="0.25rem">
            <AdjustmentIcon
              width="1rem"
              height="1rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["white"]
              }
            />
            <Body3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["white"]
              }
            >
              {intl.formatMessage({
                id: "page.main.components.context-menu.manage-asset-list",
              })}
            </Body3>
          </Styles.MenuItemXAxis>
        </Styles.MenuItem>
        <Styles.MenuItem
          onClick={(e) => handleToggleClick(e, onToggleHideLowBalance)}
        >
          <Styles.MenuItemXAxis alignY="center" gap="0.25rem">
            <HideLowBalanceIcon
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["white"]
              }
            />
            <Body3 color={textColorByCondition(hideLowBalance)}>
              {intl.formatMessage({
                id: "page.main.components.context-menu.hide-low-balance",
              })}
            </Body3>
          </Styles.MenuItemXAxis>
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
        </Styles.MenuItem>
        <Styles.MenuItem onClick={onToggleAssetViewMode}>
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Styles.MenuItemXAxis alignY="center" gap="0.25rem">
              {assetViewMode === "grouped" ? (
                <GroupByAssetsIcon
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette["white"]
                  }
                />
              ) : (
                <FlatIcon
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette["white"]
                  }
                />
              )}
              <Body3>
                {intl.formatMessage({
                  id: "page.main.components.context-menu.smart-grouping",
                })}
              </Body3>
              <Gutter size="0.125rem" />
              <BetaIcon />
            </Styles.MenuItemXAxis>
            <div onClick={(e) => e.stopPropagation()}>
              <Toggle
                isOpen={showFiatValueVisible}
                setIsOpen={onToggleAssetViewMode}
                size="extra-small"
              />
            </div>
          </Box>
        </Styles.MenuItem>
        <VerticalCollapseTransition collapsed={!showFiatValueVisible}>
          <Styles.MenuItem
            onClick={(e) => handleToggleClick(e, onToggleShowFiatValue)}
          >
            <Styles.MenuItemXAxis alignY="center" gap="0.25rem">
              <ShowFiatValueIcon
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["white"]
                }
              />
              <Body3 color={textColorByCondition(showFiatValue)}>
                {intl.formatMessage({
                  id: "page.main.components.context-menu.show-fiat-value",
                })}
              </Body3>
            </Styles.MenuItemXAxis>
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
          </Styles.MenuItem>
        </VerticalCollapseTransition>
      </YAxis>
    );
  }
);

const CustomBox = styled(Box)`
  cursor: pointer;
  transition: opacity 0.1s ease;

  &:hover {
    opacity: ${COMMON_HOVER_OPACITY};
  }
`;

export const ViewOptionsContextMenu: FunctionComponent<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  showFiatValueVisible: boolean;
  setShowFiatValueVisible: (showFiatValueVisible: boolean) => void;
}> = observer(
  ({ isOpen, setIsOpen, showFiatValueVisible, setShowFiatValueVisible }) => {
    const { uiConfigStore, analyticsAmplitudeStore } = useStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const menuContentRef = useRef<HTMLDivElement>(null);
    const [initialized, setInitialized] = useState(false);
    const theme = useTheme();
    const globalSimpleBar = useGlobarSimpleBar();

    useLayoutEffect(() => {
      if (!initialized) {
        setInitialized(true);
      }
    }, [initialized]);

    useEffect(() => {
      if (isOpen) {
        const scrollElement = globalSimpleBar.ref.current?.getScrollElement();
        if (scrollElement && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const scrollRect = scrollElement.getBoundingClientRect();

          const relativeTop =
            containerRect.top - scrollRect.top + scrollElement.scrollTop;

          scrollElement.scrollTo({
            top: relativeTop - 60,
            left: 0,
            behavior: "smooth",
          });
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const closeMenu = () => {
      setIsOpen(false);
    };

    const toggleMenu = () => {
      analyticsAmplitudeStore.logEvent("click_view_options_context_menu", {
        itemKind: "button",
      });
      handleCloseTooltip();
      setIsOpen(!isOpen);
    };

    const handleToggleHideLowBalance = () => {
      uiConfigStore.toggleHideLowBalance();
    };

    const handleToggleShowFiatValue = () => {
      const willBeEnabled = !uiConfigStore.options.showFiatValue;
      const isSidePanel = isRunningInSidePanel();
      analyticsAmplitudeStore.logEvent(
        willBeEnabled
          ? "click_toggle_on_show_fiat_value"
          : "click_toggle_off_show_fiat_value",
        { itemKind: "toggle", isSidePanel }
      );

      analyticsAmplitudeStore.setUserProperties({
        show_fiat_value_enabled: willBeEnabled,
        show_fiat_value_last_toggled_at: Date.now(),
        is_side_panel: isSidePanel,
      });

      uiConfigStore.toggleShowFiatValue();
    };

    const handleToggleAssetViewMode = () => {
      const willBeEnabled = !(
        uiConfigStore.options.assetViewMode === "grouped"
      );
      const isSidePanel = isRunningInSidePanel();
      analyticsAmplitudeStore.logEvent(
        willBeEnabled
          ? "click_toggle_on_smart_grouping"
          : "click_toggle_off_smart_grouping",
        { itemKind: "toggle", isSidePanel }
      );

      analyticsAmplitudeStore.setUserProperties({
        smart_grouping_enabled: willBeEnabled,
        smart_grouping_last_toggled_at: Date.now(),
        is_side_panel: isSidePanel,
      });

      if (uiConfigStore.options.assetViewMode === "grouped") {
        uiConfigStore.setAssetViewMode("flat");
        setShowFiatValueVisible(false);
      } else {
        uiConfigStore.setAssetViewMode("grouped");
        setShowFiatValueVisible(true);
      }
    };

    const handleCloseTooltip = () => {
      uiConfigStore.turnOffSwitchAssetViewModeSuggestion();
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      const currentTarget = e.currentTarget;

      requestAnimationFrame(() => {
        if (!currentTarget.contains(document.activeElement)) {
          closeMenu();
        }
      });
    };

    return (
      <Styles.MenuContainer ref={containerRef} onBlur={handleBlur} tabIndex={0}>
        <Tooltip
          content={
            <SuggestionTooltipContent handleCloseTooltip={handleCloseTooltip} />
          }
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["white"]
              : ColorPalette["gray-600"]
          }
          borderColor={
            theme.mode === "light"
              ? ColorPalette["gray-50"]
              : ColorPalette["gray-500"]
          }
          filter={
            theme.mode === "light"
              ? "drop-shadow(0px 20px 60px rgba(43, 39, 55, 0.08))"
              : undefined
          }
          enabled={uiConfigStore.switchAssetViewModeSuggestion}
          isAlwaysOpen={uiConfigStore.switchAssetViewModeSuggestion}
        >
          <CustomBox onClick={toggleMenu}>
            <ViewOptionsIcon
              width="1.5rem"
              height="1.5rem"
              color={ColorPalette["gray-300"]}
            />
          </CustomBox>
        </Tooltip>

        {isOpen && (
          <Styles.ContextMenuContent ref={menuContentRef}>
            <MainMenu
              onToggleAssetViewMode={handleToggleAssetViewMode}
              hideLowBalance={uiConfigStore.options.hideLowBalance}
              showFiatValue={uiConfigStore.options.showFiatValue}
              onToggleHideLowBalance={handleToggleHideLowBalance}
              onToggleShowFiatValue={handleToggleShowFiatValue}
              showFiatValueVisible={showFiatValueVisible}
              assetViewMode={uiConfigStore.options.assetViewMode}
            />
          </Styles.ContextMenuContent>
        )}
      </Styles.MenuContainer>
    );
  }
);

const SuggestionTooltipContent: FunctionComponent<{
  handleCloseTooltip: () => void;
}> = ({ handleCloseTooltip }) => {
  const intl = useIntl();
  const theme = useTheme();

  return (
    <Box width="14.375rem" padding="0.125rem 0.375rem">
      <YAxis>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <XAxis gap="0.25rem" alignY="center">
            <FireIcon color={ColorPalette["blue-400"]} />
            <Body3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-500"]
                  : ColorPalette["white"]
              }
            >
              {intl.formatMessage({
                id: "page.main.components.context-menu.tooltip-title",
              })}
            </Body3>
          </XAxis>
          <Box onClick={handleCloseTooltip} cursor="pointer" alignX="right">
            <CloseIcon
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
              width="1.25rem"
              height="1.25rem"
            />
          </Box>
        </div>
        <Gutter size="0.4375rem" />
        <Body2
          color={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
          style={{ lineHeight: "140%" }}
        >
          <FormattedMessage
            id="page.main.components.context-menu.tooltip-paragraph"
            values={{
              br: <br />,
            }}
          />
        </Body2>
      </YAxis>
    </Box>
  );
};

const ViewOptionsIcon: FunctionComponent<IconProps> = ({
  color,
  width,
  height,
}) => {
  return (
    <div
      style={{
        width: width,
        height: height,
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
        style={{ stroke: "none" }}
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
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M1.49276 5.57395C1.56376 5.30062 1.64955 5.03918 1.75013 4.78962C1.85071 4.54006 1.96608 4.30238 2.09624 4.07659C2.20273 3.89834 2.24415 3.70819 2.22048 3.50617C2.19681 3.30415 2.1199 3.13777 1.98974 3.00705C1.85958 2.87633 1.69688 2.81394 1.50164 2.81988C1.3064 2.82582 1.15553 2.91198 1.04904 3.07835C0.800548 3.45864 0.590516 3.8508 0.418941 4.25485C0.247366 4.6589 0.114247 5.08671 0.0195853 5.5383C-0.0277458 5.72844 0.0107107 5.90075 0.134955 6.05524C0.259199 6.20973 0.421899 6.28697 0.623056 6.28697C0.824213 6.28697 1.00466 6.22161 1.16441 6.09089C1.32415 5.96017 1.4336 5.78786 1.49276 5.57395ZM2.09624 9.92341C1.96608 9.69762 1.85071 9.45994 1.75013 9.21038C1.64955 8.96082 1.56376 8.69938 1.49276 8.42605C1.4336 8.21215 1.32415 8.03983 1.16441 7.90911C1.00466 7.77839 0.824213 7.71303 0.623056 7.71303C0.421899 7.71303 0.259199 7.78433 0.134955 7.92693C0.0107107 8.06954 -0.0277458 8.23591 0.0195853 8.42605C0.114247 8.88952 0.250324 9.33516 0.427816 9.76298C0.605307 10.1908 0.818297 10.583 1.06679 10.9395C1.17328 11.094 1.32119 11.1742 1.51051 11.1801C1.69984 11.1861 1.85958 11.1237 1.98974 10.9929C2.1199 10.8622 2.19681 10.6959 2.22048 10.4938C2.24415 10.2918 2.20273 10.1017 2.09624 9.92341ZM4.06639 2.11577C4.30305 1.97316 4.54562 1.84838 4.79411 1.74143C5.04259 1.63448 5.297 1.54535 5.55732 1.47404C5.75848 1.41463 5.92414 1.30767 6.0543 1.15318C6.18446 0.998693 6.24954 0.820437 6.24954 0.618413C6.24954 0.416389 6.17854 0.255959 6.03655 0.137121C5.89455 0.0182829 5.7289 -0.0233097 5.53957 0.0123415C5.10176 0.107411 4.67874 0.238132 4.27051 0.404506C3.86228 0.570878 3.46884 0.778845 3.09019 1.0284C2.92453 1.13536 2.83283 1.28688 2.81508 1.48296C2.79733 1.67904 2.85353 1.84838 2.98369 1.99099C3.12569 2.13359 3.29726 2.21678 3.49842 2.24055C3.69958 2.26432 3.8889 2.22272 4.06639 2.11577ZM5.59282 12.526C5.3325 12.4547 5.08105 12.3685 4.83848 12.2675C4.59591 12.1665 4.35629 12.0447 4.11964 11.9021C3.93032 11.7951 3.73212 11.7505 3.52504 11.7684C3.31797 11.7862 3.14344 11.8664 3.00144 12.009C2.85945 12.1516 2.79437 12.318 2.8062 12.5081C2.81803 12.6983 2.90678 12.8468 3.07244 12.9538C3.46292 13.2033 3.86819 13.4143 4.28826 13.5866C4.70832 13.7589 5.14317 13.8926 5.59282 13.9877C5.77031 14.0233 5.93005 13.9817 6.07205 13.8629C6.21404 13.744 6.28504 13.5836 6.28504 13.3816C6.28504 13.1796 6.21995 13.0013 6.08979 12.8468C5.95963 12.6923 5.79398 12.5854 5.59282 12.526ZM9.88811 2.09794C10.0656 2.2049 10.2579 2.24946 10.465 2.23164C10.672 2.21381 10.8466 2.13359 10.9886 1.99099C11.1306 1.84838 11.1956 1.67904 11.1838 1.48296C11.172 1.28688 11.0832 1.1413 10.9176 1.04623C10.5389 0.79667 10.1366 0.585733 9.71062 0.413419C9.28464 0.241104 8.84683 0.107411 8.39718 0.0123415C8.20786 -0.0233097 8.03924 0.0182829 7.89133 0.137121C7.74342 0.255959 7.66947 0.416389 7.66947 0.618413C7.66947 0.820437 7.73751 0.998693 7.87358 1.15318C8.00966 1.30767 8.17828 1.41463 8.37944 1.47404C8.65159 1.54535 8.91191 1.63151 9.1604 1.73252C9.40889 1.83353 9.65146 1.95534 9.88811 2.09794ZM8.39718 12.526C8.19603 12.5854 8.03037 12.6923 7.90021 12.8468C7.77005 13.0013 7.70497 13.1796 7.70497 13.3816C7.70497 13.5836 7.77596 13.744 7.91796 13.8629C8.05995 13.9817 8.21969 14.0233 8.39718 13.9877C8.84683 13.8926 9.28464 13.7589 9.71062 13.5866C10.1366 13.4143 10.5389 13.2033 10.9176 12.9538C11.0832 12.8468 11.172 12.6983 11.1838 12.5081C11.1956 12.318 11.1365 12.1516 11.0063 12.009C10.8643 11.8664 10.6927 11.7832 10.4916 11.7595C10.2904 11.7357 10.0952 11.7773 9.90586 11.8842C9.65737 12.0268 9.40889 12.1516 9.1604 12.2586C8.91191 12.3655 8.65751 12.4547 8.39718 12.526ZM12.4972 5.59177C12.5564 5.7938 12.6659 5.96017 12.8256 6.09089C12.9853 6.22161 13.1658 6.28697 13.3669 6.28697C13.5681 6.28697 13.7308 6.20973 13.855 6.05524C13.9793 5.90075 14.0177 5.72844 13.9704 5.5383C13.8758 5.08671 13.7367 4.65296 13.5533 4.23702C13.3699 3.82109 13.1599 3.43487 12.9232 3.07835C12.8167 2.92387 12.6688 2.84068 12.4795 2.8288C12.2902 2.81691 12.1304 2.87633 12.0003 3.00705C11.8701 3.13777 11.7932 3.30712 11.7695 3.51508C11.7459 3.72305 11.7873 3.91616 11.8938 4.09442C12.0239 4.33209 12.1393 4.57274 12.2399 4.81636C12.3405 5.05997 12.4262 5.31845 12.4972 5.59177ZM11.8938 9.92341C11.7873 10.1017 11.7459 10.2918 11.7695 10.4938C11.7932 10.6959 11.8701 10.8622 12.0003 10.9929C12.1304 11.1237 12.2902 11.1831 12.4795 11.1712C12.6688 11.1593 12.8167 11.0761 12.9232 10.9216C13.1835 10.5414 13.4024 10.1433 13.5799 9.72733C13.7574 9.31139 13.8935 8.87764 13.9882 8.42605C14.0237 8.23591 13.9793 8.06954 13.855 7.92693C13.7308 7.78433 13.5681 7.71303 13.3669 7.71303C13.1658 7.71303 12.9853 7.77839 12.8256 7.90911C12.6659 8.03983 12.5564 8.21215 12.4972 8.42605C12.4262 8.69938 12.3405 8.96082 12.2399 9.21038C12.1393 9.45994 12.0239 9.69762 11.8938 9.92341ZM6.97725 3.43487C6.77609 3.43487 6.60748 3.5032 6.4714 3.63986C6.33532 3.77653 6.26729 3.94587 6.26729 4.14789V7.80215L4.9361 6.4474C4.79411 6.3048 4.62549 6.2335 4.43025 6.2335C4.23501 6.2335 4.06639 6.3048 3.9244 6.4474C3.78241 6.59001 3.70845 6.75935 3.70253 6.95544C3.69662 7.15152 3.76466 7.32086 3.90665 7.46347L6.48028 10.066C6.61044 10.1967 6.77609 10.2621 6.97725 10.2621C7.17841 10.2621 7.34407 10.1967 7.47423 10.066L10.0124 7.51694C10.1544 7.37434 10.2283 7.20202 10.2342 7C10.2401 6.79798 10.1721 6.62566 10.0301 6.48306C9.88811 6.34045 9.71654 6.26915 9.51538 6.26915C9.31422 6.26915 9.14265 6.34045 9.00066 6.48306L7.68722 7.80215V4.14789C7.68722 3.94587 7.61918 3.77653 7.4831 3.63986C7.34703 3.5032 7.17841 3.43487 6.97725 3.43487Z"
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

const FireIcon: FunctionComponent<IconProps> = ({ color }) => {
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
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.7999 3.95005C13.4783 5.49645 14.396 8.92136 12.8496 11.5998C11.3032 14.2782 7.8783 15.1959 5.19986 13.6495C2.52142 12.1031 1.60372 8.67823 3.15012 5.99979C3.28484 5.76646 3.43381 5.54648 3.59531 5.34033C3.7566 5.13445 4.0678 5.16558 4.22981 5.3709C4.45199 5.65247 4.70505 5.90857 4.98387 6.13406C5.24998 6.34928 5.61327 6.0955 5.60253 5.75342C5.60093 5.70245 5.60012 5.65128 5.60012 5.59993C5.60012 4.86509 5.76524 4.16883 6.06041 3.54621C6.48693 2.64652 7.18499 1.90062 8.04873 1.41434C8.24632 1.3031 8.4891 1.40171 8.5903 1.60463C9.06387 2.55411 9.81214 3.37979 10.7999 3.95005ZM11.2001 9.59995C11.2001 11.3673 9.76743 12.8 8.00012 12.8C6.46949 12.8 5.18338 11.6812 4.87223 10.2546C4.79738 9.91143 5.22383 9.73988 5.52326 9.92352C5.91209 10.162 6.34994 10.3171 6.8044 10.3747C7.0465 10.4054 7.22897 10.1831 7.21195 9.93966C7.2041 9.82744 7.20012 9.71416 7.20012 9.59995C7.20012 8.45843 7.59859 7.40998 8.26403 6.58611C8.34708 6.48328 8.47927 6.43281 8.60905 6.45782C10.0851 6.74219 11.2001 8.04086 11.2001 9.59995Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

const BetaIcon: FunctionComponent<IconProps> = () => {
  return (
    <div
      style={{
        display: "flex",
        width: "28px",
        height: "15px",
        padding: "1px 3px",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        borderRadius: "4px",
        background: "var(--Blue-Blue400, #2C4BE2)",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="8"
        viewBox="0 0 20 8"
        fill="none"
      >
        <path
          d="M15.1934 7.04541C14.7979 7.04541 14.5254 6.79932 14.5254 6.44775C14.5254 6.30273 14.5649 6.13574 14.666 5.84131L15.9932 1.95215C16.2305 1.24023 16.5732 0.95459 17.2061 0.95459C17.8389 0.95459 18.1729 1.23584 18.4146 1.95215L19.7373 5.84131C19.8164 6.0874 19.856 6.26318 19.856 6.41699C19.856 6.79932 19.5835 7.04541 19.166 7.04541C18.7793 7.04541 18.5552 6.83447 18.4102 6.33789L18.1816 5.62158H16.1646L15.9316 6.33789C15.7866 6.84766 15.5801 7.04541 15.1934 7.04541ZM16.4634 4.57129H17.8872L17.2148 2.29932H17.1445L16.4634 4.57129Z"
          fill="#FEFEFE"
        />
        <path
          d="M12.4577 7.04102C12.005 7.04102 11.7326 6.75098 11.7326 6.27637V2.18945H10.5944C10.2604 2.18945 10.0099 1.93457 10.0099 1.59619C10.0099 1.25342 10.2604 0.998535 10.5944 0.998535H14.3341C14.6681 0.998535 14.9142 1.25342 14.9142 1.59619C14.9142 1.93457 14.6681 2.18945 14.3341 2.18945H13.1872V6.27637C13.1872 6.75098 12.9103 7.04102 12.4577 7.04102Z"
          fill="#FEFEFE"
        />
        <path
          d="M5.68782 6.1665V1.8291C5.68782 1.29297 5.98225 0.998535 6.53157 0.998535H9.25179C9.58577 0.998535 9.82307 1.23584 9.82307 1.57861C9.82307 1.91699 9.58577 2.1499 9.25179 2.1499H7.12483V3.44629H9.14632C9.45833 3.44629 9.66927 3.66602 9.66927 3.98242C9.66927 4.30322 9.45833 4.50977 9.14632 4.50977H7.12483V5.8457H9.23421C9.58577 5.8457 9.82307 6.07422 9.82307 6.42139C9.82307 6.77295 9.58577 6.99707 9.22981 6.99707H6.53157C5.98225 6.99707 5.68782 6.70703 5.68782 6.1665Z"
          fill="#FEFEFE"
        />
        <path
          d="M0.144028 6.1665V1.8291C0.144028 1.29297 0.438461 0.998535 0.987778 0.998535H2.80272C3.93651 0.998535 4.64842 1.56543 4.64842 2.4707C4.64842 3.15625 4.23534 3.65723 3.57616 3.78027V3.84619C4.38036 3.89893 4.93407 4.48779 4.93407 5.29639C4.93407 6.31592 4.09911 6.99707 2.84666 6.99707H0.987778C0.438461 6.99707 0.144028 6.70703 0.144028 6.1665ZM1.58104 3.4375H2.27977C2.94334 3.4375 3.22899 3.14746 3.22899 2.72119C3.22899 2.29932 2.93895 2.02686 2.43358 2.02686H1.58104V3.4375ZM1.58104 5.96875H2.35887C3.1367 5.96875 3.4575 5.66553 3.4575 5.17773C3.4575 4.68994 3.1367 4.36914 2.50389 4.36914H1.58104V5.96875Z"
          fill="#FEFEFE"
        />
      </svg>
    </div>
  );
};
