import { Secp256k1HdWallet, Secp256k1Wallet } from "@cosmjs/amino";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton, InlineButton } from "../../../button";
import { useStore } from "../../../stores";
import { TextInput } from "../../../text-input";
import { Background } from "../../components/background";
import { KeyboardAvoidingView } from "../../components/keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../components/phone-number/verify-and-proceed-button";
import { OnboardingStackParamList } from "../onboarding-stack";

export type RecoverSinglesigProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "recover-singlesig"
>;

export const RecoverSinglesig = observer<RecoverSinglesigProps>(
  ({ navigation }) => {
    const [mnemonic, setMnemonic] = useState("");
    const [generateDisabled, setGenerateDisabled] = useState(false);
    const { walletsStore } = useStore();

    return (
      <KeyboardAvoidingView style={{ flex: 1 }}>
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
                  marginTop: 20,
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
              <View style={{ justifyContent: "flex-end", marginTop: 43 }}>
                <View>
                  <Text
                    style={{
                      color: "#F6F5FF",
                      fontSize: 24,
                      fontWeight: "600",
                      marginTop: 32,
                    }}
                  >
                    <FormattedMessage
                      id="recovery.singlesig.title"
                      defaultMessage="Recover your Singlesig Wallet"
                    />
                  </Text>
                  <Text
                    style={{
                      color: "#999CB6",
                      fontSize: 14,
                      marginTop: 10,
                    }}
                  >
                    <FormattedMessage
                      id="recovery.singlesig.enterphrase"
                      defaultMessage="Enter your recovery phrase of your singlesig wallet."
                    />
                  </Text>
                </View>
              </View>
              <TextInput
                placeholder="never gonna give you up never gonna let you down never gonna..."
                style={{ marginTop: 25 }}
                value={mnemonic}
                onChangeText={setMnemonic}
              />
              <Text
                style={{
                  color: "rgba(246, 245, 255, 0.6)",
                  fontSize: 12,
                  marginTop: 20,
                }}
              >
                <InlineButton
                  label="Generate seed"
                  onPress={async () => {
                    setGenerateDisabled(true);
                    const wallet = await Secp256k1HdWallet.generate(12);
                    setMnemonic(wallet.mnemonic);
                    setGenerateDisabled(false);
                  }}
                  disabled={generateDisabled}
                />
              </Text>
            </View>
            <View>
              <VerifyAndProceedButton
                onPress={async () => {
                  await walletsStore.addWallet({
                    type: "singlesig",
                    data: mnemonic,
                  });
                }}
              />
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }
);
