import React, { FunctionComponent } from "react";

import { Text } from "react-native-elements";
import { View } from "react-native";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { bcGray, br3, bw1, caption1, px4, sf } from "../../styles";

export interface AddressProps {
  maxCharacters: number;
  address: string;
}

export const Address: FunctionComponent<AddressProps> = ({
  maxCharacters,
  address,
}) => {
  return (
    <View accessible style={sf([bw1, bcGray, px4, br3])}>
      <Text style={caption1}>
        {Bech32Address.shortenAddress(address, maxCharacters)}
      </Text>
    </View>
  );
};
