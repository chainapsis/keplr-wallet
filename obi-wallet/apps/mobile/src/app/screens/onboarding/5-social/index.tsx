import { SigningStargateClient } from "@cosmjs/stargate";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton, InlineButton } from "../../../button";
import { useStore } from "../../../stores";
import { TextInput } from "../../../text-input";
import { Background } from "../../components/background";
import { KeyboardAvoidingView } from "../../components/keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../components/phone-number/verify-and-proceed-button";
import { StackParamList } from "../stack";
import PeopleIcon from "./assets/people-alt-twotone-24px.svg";

export type SocialOnboardingProps = NativeStackScreenProps<
  StackParamList,
  "onboarding5"
>;

export const SocialOnboarding = observer<SocialOnboardingProps>(
  ({ navigation }) => {
    const { multisigStore } = useStore();
    const [address, setAddress] = useState("");
    const [fetchingPubKey, setFetchingPubKey] = useState(false);

    useEffect(() => {
      const { social } = multisigStore.getNextAdmin("");

      if (social) {
        Alert.alert(
          intl.formatMessage({ id: "onboarding4.error.socialkeyexists.title" }),
          intl.formatMessage({ id: "onboarding4.error.socialkeyexists.text" }) +
            ` ${social.address}?`,
          [
            {
              text: intl.formatMessage({
                id: "onboarding4.error.socialkeyexists.newkey",
              }),
              style: "cancel",
            },
            {
              text: intl.formatMessage({
                id: "onboarding4.error.socialkeyexists.yes",
              }),
              onPress: () => {
                navigation.navigate("onboarding6");
              },
            },
          ]
        );
      }
    }, [multisigStore, navigation]);

    const intl = useIntl();

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
                  <PeopleIcon width={70} height={70} />
                  <Text
                    style={{
                      color: "#F6F5FF",
                      fontSize: 24,
                      fontWeight: "600",
                      marginTop: 32,
                    }}
                  >
                    <FormattedMessage
                      id="onboarding5.setsocialkey"
                      defaultMessage="Set your Social Key"
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
                      id="onboarding5.setsocialkey.subtext"
                      defaultMessage="Enter the juno address of a trusted friend who can help you recover your account."
                    />
                  </Text>
                </View>
              </View>
              <TextInput
                placeholder="juno1234...."
                style={{ marginTop: 25 }}
                value={address}
                onChangeText={setAddress}
              />
              <Text
                style={{
                  color: "#999CB6",
                  fontSize: 14,
                  marginTop: 10,
                }}
              >
                <FormattedMessage
                  id="onboarding5.setsocialkey.subtext2"
                  defaultMessage="…or you can use the default Obi account if you don't trust any of your friends"
                />
              </Text>
              <InlineButton
                label={intl.formatMessage({ id: "onboarding5.useobiaccount" })}
                style={{ alignSelf: "flex-start", marginTop: 10 }}
                onPress={() => {
                  setAddress("juno17w77rnps59cnallfskg42s3ntnlhrzu2mjkr3e");
                }}
              />
            </View>
            <View>
              <VerifyAndProceedButton
                disabled={fetchingPubKey}
                onPress={async () => {
                  setFetchingPubKey(true);
                  const publicKey = await getAccountPubkey(address);
                  setFetchingPubKey(false);
                  if (publicKey) {
                    multisigStore.setSocialPublicKey({
                      publicKey: publicKey,
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
);

async function getAccountPubkey(key: string) {
  const rcp = "https://rpc.uni.junonetwork.io/";
  const client = await SigningStargateClient.connect(rcp);
  try {
    const { pubkey } = await client.getAccount(key);
    return pubkey;
  } catch (e) {
    console.log(e);
    // ToDo: This Alert needs to have translation implemented, but useIntl not working here
    // "onboarding5.error.notactiveaddress.title" && "onboarding5.error.notactiveaddress.text"
    Alert.alert(
      "We don’t see any activity for this address.",
      "Please check the address, tell your friend to use it once (such as sending coins to themselves), or try another address."
    );
  }
}
