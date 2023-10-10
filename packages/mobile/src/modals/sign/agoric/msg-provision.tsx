import React from "react";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Text } from "react-native";

export interface MsgProvisionSmartWallet {
  value: {
    address: string;
  };
}

export const renderMsgProvisionSmartWallet = (address: string) => ({
  title: "Provision Smart Wallet",
  content: (
    <Text>
      Provision a smart wallet for address{" "}
      <Text style={{ fontWeight: "bold" }}>
        {Bech32Address.shortenAddress(address, 20)}
      </Text>
    </Text>
  ),
});
