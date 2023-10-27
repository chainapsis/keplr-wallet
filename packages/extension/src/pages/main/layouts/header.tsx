import React, { FunctionComponent } from "react";
import { Columns } from "../../../components/column";
import { Box } from "../../../components/box";
import { Tooltip } from "../../../components/tooltip";
import { Image } from "../../../components/image";
import { MenuIcon } from "../../../components/icon";
import { ProfileButton } from "../../../layouts/header/components";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { HeaderLayout } from "../../../layouts/header";
import { useTheme } from "styled-components";
import { Modal } from "../../../components/modal";
import { MenuBar } from "../components";
import { HeaderProps } from "../../../layouts/header/types";
import { ColorPalette } from "../../../styles";
import { YAxis } from "../../../components/axis";
import { Body2, Subtitle3 } from "../../../components/typography";
import { FormattedMessage, useIntl } from "react-intl";
import { Gutter } from "../../../components/gutter";
import { Button } from "../../../components/button";

export const MainHeaderLayout: FunctionComponent<
  Pick<
    HeaderProps,
    | "isNotReady"
    | "bottomButton"
    | "fixedHeight"
    | "additionalPaddingBottom"
    | "onSubmit"
    | "headerContainerStyle"
  >
> = observer((props) => {
  const { children, ...otherProps } = props;

  const {
    keyRingStore,
    uiConfigStore,
    chainStore,
    accountStore,
    queriesStore,
  } = useStore();

  const icnsPrimaryName = (() => {
    if (
      uiConfigStore.icnsInfo &&
      chainStore.hasChain(uiConfigStore.icnsInfo.chainId)
    ) {
      const queries = queriesStore.get(uiConfigStore.icnsInfo.chainId);
      const icnsQuery = queries.icns.queryICNSNames.getQueryContract(
        uiConfigStore.icnsInfo.resolverContractAddress,
        accountStore.getAccount(uiConfigStore.icnsInfo.chainId).bech32Address
      );

      return icnsQuery.primaryName.split(".")[0];
    }
  })();

  const theme = useTheme();
  const intl = useIntl();

  const [isOpenMenu, setIsOpenMenu] = React.useState(false);

  const openMenu = () => {
    setIsOpenMenu(true);

    if (uiConfigStore.newChainSuggestionConfig.newSuggestionChains.length > 0) {
      uiConfigStore.newChainSuggestionConfig.turnOffSuggestionChains(
        ...uiConfigStore.newChainSuggestionConfig.newSuggestionChains
      );
    }
  };

  return (
    <HeaderLayout
      title={(() => {
        const name = keyRingStore.selectedKeyInfo?.name || "Keplr Account";

        if (icnsPrimaryName !== "") {
          return (
            <Columns sum={1} alignY="center" gutter="0.25rem">
              <Box>{name}</Box>

              <Tooltip
                content={
                  <div style={{ whiteSpace: "nowrap" }}>
                    ICNS : {icnsPrimaryName}
                  </div>
                }
              >
                <Image
                  alt="icns-icon"
                  src={require(theme.mode === "light"
                    ? "../../../public/assets/img/icns-icon-light.png"
                    : "../../../public/assets/img/icns-icon.png")}
                  style={{ width: "1rem", height: "1rem" }}
                />
              </Tooltip>
            </Columns>
          );
        }

        return name;
      })()}
      left={
        <React.Fragment>
          {/* 일종의 padding left인데 cursor를 가지게 하면서 밑에서 tooltip도 함께 사용하기 위해서 다른 Box로 분리되어있음 */}
          <Box
            width="1rem"
            height="1.5rem"
            cursor="pointer"
            onClick={openMenu}
          />
          <Box>
            <Tooltip
              content={
                <Box width="17rem" padding="0.375rem">
                  <YAxis>
                    <Subtitle3
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-700"]
                          : ColorPalette["white"]
                      }
                    >
                      <FormattedMessage
                        id="page.main.layouts.header.new-chain.title"
                        values={{
                          chains:
                            uiConfigStore.newChainSuggestionConfig.newSuggestionChains
                              .map((chain) => {
                                return chainStore.getChain(chain).chainName;
                              })
                              .join(", "),
                        }}
                      />
                    </Subtitle3>
                    <Gutter size="0.75rem" />
                    <Body2
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-300"]
                          : ColorPalette["gray-200"]
                      }
                    >
                      <FormattedMessage id="page.main.layouts.header.new-chain.paragraph" />
                    </Body2>
                    <Gutter size="0.75rem" />
                    <YAxis alignX="right">
                      <Button
                        size="small"
                        color="secondary"
                        text={intl.formatMessage({
                          id: "page.main.layouts.header.new-chain.button",
                        })}
                        onClick={openMenu}
                      />
                    </YAxis>
                  </YAxis>
                </Box>
              }
              backgroundColor={
                theme.mode === "light"
                  ? ColorPalette["white"]
                  : ColorPalette["gray-500"]
              }
              hideBorder={theme.mode === "light"}
              filter={
                theme.mode === "light"
                  ? "drop-shadow(0px 1px 10px rgba(43, 39, 55, 0.20))"
                  : undefined
              }
              enabled={
                uiConfigStore.newChainSuggestionConfig.newSuggestionChains
                  .length > 0
              }
              isAlwaysOpen={
                uiConfigStore.newChainSuggestionConfig.newSuggestionChains
                  .length > 0
              }
            >
              <Box onClick={openMenu} cursor="pointer">
                <MenuIcon />
              </Box>
            </Tooltip>
          </Box>
        </React.Fragment>
      }
      right={<ProfileButton />}
      {...otherProps}
    >
      {children}

      <Modal
        isOpen={isOpenMenu}
        align="left"
        close={() => setIsOpenMenu(false)}
      >
        <MenuBar close={() => setIsOpenMenu(false)} />
      </Modal>
    </HeaderLayout>
  );
});
