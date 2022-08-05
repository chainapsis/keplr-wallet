import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "../../../button";
import { useStore } from "../../../stores";
import { Background } from "../../components/background";
import { StackParamList } from "../stack";

export type Onboarding5Props = NativeStackScreenProps<
  StackParamList,
  "onboarding4"
>;

export const Onboarding5 = observer<Onboarding5Props>(({ navigation }) => {
  const { multisigStore } = useStore();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Background />
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          justifyContent: "space-between",
        }}
      >
        <View>
          <IconButton
            style={{
              marginLeft: -5,
              padding: 5,
              width: 25,
            }}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <FontAwesomeIcon
              icon={faChevronLeft}
              style={{ color: "#7B87A8" }}
            />
          </IconButton>
        </View>
        <Text style={{ color: "#ffffff" }}>
          {JSON.stringify(multisigStore.getMultisig(), null, 2)}
        </Text>
      </View>
    </SafeAreaView>
  );
});
