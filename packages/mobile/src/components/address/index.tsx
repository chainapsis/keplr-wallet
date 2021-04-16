import React, { FunctionComponent } from "react";

import { Text } from "react-native-elements";
import { View } from "react-native";
import { Bech32Address } from "@keplr-wallet/cosmos";

export interface AddressProps {
  maxCharacters: number;
  address: string;
}

export const Address: FunctionComponent<AddressProps> = ({
  maxCharacters,
  address,
}) => {
  return (
    <View
      accessible
      style={{
        borderRadius: 100,
        borderWidth: 1,
        borderColor: "#e6e6e6",
        paddingHorizontal: 16,
      }}
    >
      <Text>{Bech32Address.shortenAddress(address, maxCharacters)}</Text>
    </View>
  );
};
