import React, { FunctionComponent } from "react";
import { HeaderProps } from "../../../layouts/header/types";
import { EthSignType } from "@keplr-wallet/types";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { Adr36SignHeader } from "../components/adr36/adr36-header";
import { Adr36RequestOrigin } from "../components/adr36/adr36-request-origin";
import { Adr36WalletDetails } from "../components/adr36/adr36-wallet-details";
import { Adr36DataView } from "../components/adr36/adr36-data-view";
import { IChainInfoImpl } from "@keplr-wallet/stores";
import { ChainInfoWithCoreTypes } from "@keplr-wallet/background";
import { Box } from "../../../components/box";
import { Gutter } from "../../../components/gutter";

export const EthereumArbitrarySignPage: FunctionComponent<{
  bottomButtons: HeaderProps["bottomButtons"];
  headerLeft: React.ReactNode;
  ledgerGuideBox: React.ReactNode;
  keystoneUSBBox?: React.ReactNode;
  keystoneSign?: React.ReactNode;
  origin: string;
  walletName: string;
  chainInfo: IChainInfoImpl<ChainInfoWithCoreTypes>;
  addressInfo: {
    type: "bech32" | "ethereum" | "starknet";
    address: string;
  };
  messageData: {
    signType: EthSignType;
    signingDataText: string;
  };
}> = observer(
  ({
    bottomButtons,
    headerLeft,
    ledgerGuideBox,
    keystoneUSBBox,
    keystoneSign,
    origin,
    walletName,
    chainInfo,
    addressInfo,
    messageData,
  }) => {
    return (
      <HeaderLayout
        title={""}
        fixedHeight={true}
        headerContainerStyle={{
          height: "0",
        }}
        contentContainerStyle={{
          paddingTop: "2rem",
        }}
        left={headerLeft}
        bottomButtons={bottomButtons}
      >
        <Box
          height="100%"
          paddingX="0.75rem"
          //NOTE - In light mode, the simplebar has shadow, but if there is no bottom margin,
          // it feels like it gets cut off, so I arbitrarily added about 2px.
          paddingBottom="0.125rem"
          style={{
            overflow: "auto",
          }}
        >
          <Adr36SignHeader />
          <Gutter size="0.75rem" />
          <Adr36RequestOrigin origin={origin} />
          <Gutter size="0.75rem" />
          <Adr36WalletDetails
            walletName={walletName}
            chainInfo={chainInfo}
            addressInfo={addressInfo}
          />
          <Gutter size="0.75rem" />
          <Adr36DataView
            {...(messageData.signType === EthSignType.MESSAGE
              ? { message: messageData.signingDataText }
              : { rawMessage: messageData.signingDataText })}
          />
          {ledgerGuideBox}
          {keystoneUSBBox}
        </Box>
        {keystoneSign}
      </HeaderLayout>
    );
  }
);
