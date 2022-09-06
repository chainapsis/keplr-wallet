import { SigningStargateClient } from "@cosmjs/stargate";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, IconButton, InlineButton } from "../../../../button";
import { useStore } from "../../../../stores";
import { TextInput } from "../../../../text-input";
import { StackParamList } from "../../../onboarding/stack";
import { Background } from "../../background";
import { KeyboardAvoidingView } from "../../keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../phone-number/verify-and-proceed-button";
// import { StackParamList } from "../stack";
import PeoPleIcon from "./assets/people-alt-twotone-24px.svg";

export type Onboarding3Props = NativeStackScreenProps<
  StackParamList,
  "onboarding5"
>;

export function SocialKey({ navigation }: Onboarding3Props) {
  const { multisigStore } = useStore();
  const [key, setKey] = useState("");
  const [fetchingPubKey, setFechingPubKey] = useState(false);

  useEffect(() => {
    const { socialKey } = multisigStore.getNextAdmin("");

    if (socialKey) {
      Alert.alert(
        "You already have a social key",
        `Do you want to reuse your existing social key for ${socialKey.socialKey}?`,
        [
          {
            text: "Generate a new key",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => {
              navigation.navigate("onboarding6");
            },
          },
        ]
      );
    }
  }, [multisigStore, navigation]);

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
    >
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
                <PeoPleIcon width={70} height={70} />
                <Text
                  style={{
                    color: "#F6F5FF",
                    fontSize: 24,
                    fontWeight: "600",
                    marginTop: 32,
                  }}
                >
                  Set your Social Key
                </Text>
                <Text
                  style={{
                    color: "#999CB6",
                    fontSize: 14,
                    marginTop: 10,
                  }}
                >
                  Enter the juno address of a trusted friend who can help you
                  recover your account
                </Text>
              </View>
            </View>
            <TextInput
              placeholder="juno1234...."
              textContentType="oneTimeCode"
              keyboardType="number-pad"
              style={{ marginTop: 25 }}
              value={key}
              onChangeText={setKey}
            />
            <Text
              style={{
                color: "#999CB6",
                fontSize: 14,
                marginTop: 10,
              }}
            >
              ...or you can use the default obi account if you dont trust any of
              your friends
            </Text>
            <InlineButton
              label="Use OBI Account"
              style={{ alignSelf: "flex-start", marginTop: 10 }}
              onPress={() => {
                setKey("juno17w77rnps59cnallfskg42s3ntnlhrzu2mjkr3e");
              }}
            />
          </View>
          <View>
            <VerifyAndProceedButton
              disabled={fetchingPubKey}
              onPress={async () => {
                setFechingPubKey(true);
                const publicKey = await getAccountPubkey(key);
                setFechingPubKey(false);
                if (publicKey) {
                  multisigStore.setSocialKeyPublicKey({
                    publicKey,
                    socialKey: key,
                  });
                  navigation.navigate("onboarding6");
                }
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
export async function getAccountPubkey(key: string) {
  const rcp = "https://rpc.uni.junonetwork.io/";
  const client = await SigningStargateClient.connect(rcp);
  try {
    const result = await client.getAccount(key);
    return result.pubkey.value;
  } catch (e) {
    console.log(e);
    Alert.alert(
      "We don’t see any activity for this address.",
      "Please check the address, tell your friend to use it once (such as sending coins to themselves), or try another address."
    );
  }
}
