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

export const MainHeaderLayout: FunctionComponent<
  Pick<
    HeaderProps,
    | "isNotReady"
    | "bottomButton"
    | "fixedHeight"
    | "additionalPaddingBottom"
    | "onSubmit"
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

  const [isOpenMenu, setIsOpenMenu] = React.useState(false);

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
        <Box
          paddingLeft="1rem"
          onClick={() => setIsOpenMenu(true)}
          cursor="pointer"
        >
          <MenuIcon />
        </Box>
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
