import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton, InlineButton } from "../../../../button";
import { createStargateClient } from "../../../../clients";
import { useStore } from "../../../../stores";
import { TextInput } from "../../../../text-input";
import { Background } from "../../../components/background";
import { KeyboardAvoidingView } from "../../../components/keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../../components/phone-number/verify-and-proceed-button";
import { OnboardingStackParamList } from "../../onboarding-stack";
import PeopleIcon from "./assets/people-alt-twotone-24px.svg";

export type MultisigSocialProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "create-multisig-social"
>;

export const MultisigSocial = observer<MultisigSocialProps>(
  ({ navigation }) => {
    const { chainStore, demoStore, multisigStore, pendingMultisigStore } =
      useStore();
    const [address, setAddress] = useState("");
    const [fetchingPubKey, setFetchingPubKey] = useState(false);
    const obi_address = "juno17w77rnps59cnallfskg42s3ntnlhrzu2mjkr3e";

    const intl = useIntl();

    useEffect(() => {
      if (demoStore.demoMode) return;

      const { social } = multisigStore.nextAdmin;

      if (social && multisigStore.getKeyInRecovery !== "social") {
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
                id: "general.yes",
              }),
              onPress: () => {
                navigation.navigate("create-multisig-init");
              },
            },
          ]
        );
      }
    }, [demoStore, intl, multisigStore, navigation, pendingMultisigStore]);

    async function getAccountPubkey(key: string) {
      const client = await createStargateClient(chainStore.currentChain);

      try {
        const account = await client.getAccount(key);
        return account?.pubkey;
      } catch (e) {
        console.log(e);
        Alert.alert(
          "We don’t see any activity for this address.",
          "Please check the address, tell your friend to use it once (such as sending coins to themselves), or try another address."
        );
        return null;
      } finally {
        client.disconnect();
      }
    }

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
                    {multisigStore.getKeyInRecovery === "social" ? (
                      <FormattedMessage
                        id="onboarding5.recovery.setsocialkey"
                        defaultMessage="Set a New Social Key"
                      />
                    ) : (
                      <FormattedMessage
                        id="onboarding5.setsocialkey"
                        defaultMessage="Set a Social Key"
                      />
                    )}
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
                {multisigStore.getKeyInRecovery === "social" &&
                multisigStore.nextAdmin?.social?.address === obi_address ? (
                  <FormattedMessage
                    id="onboarding5.recovery.setsocialkey.subtext2"
                    defaultMessage="You're currently using the Obi account. This will remove the Obi account from your multisig and replace it with your friend's key."
                  />
                ) : (
                  <FormattedMessage
                    id="onboarding5.setsocialkey.subtext2"
                    defaultMessage="…or you can use the default Obi account if you don't trust any of your friends"
                  />
                )}
              </Text>
              {multisigStore.getKeyInRecovery === "social" &&
              multisigStore.nextAdmin?.social?.address ===
                obi_address ? null : (
                <InlineButton
                  label={intl.formatMessage({
                    id: "onboarding5.useobiaccount",
                  })}
                  style={{ alignSelf: "flex-start", marginTop: 10 }}
                  onPress={() => {
                    setAddress(obi_address);
                  }}
                />
              )}
            </View>
            <View>
              <VerifyAndProceedButton
                disabled={fetchingPubKey}
                onPress={async () => {
                  setFetchingPubKey(true);
                  const publicKey = demoStore.demoMode
                    ? { type: "demo", value: "demo" }
                    : await getAccountPubkey(address);
                  setFetchingPubKey(false);
                  if (publicKey) {
                    if (!demoStore.demoMode) {
                      if (multisigStore.getKeyInRecovery === null) {
                        multisigStore.setSocialPublicKey({
                          publicKey: publicKey,
                        });
                      } else {
                        pendingMultisigStore.setSocialPublicKey({
                          publicKey: publicKey,
                        });
                      }
                    }
                    if (multisigStore.getKeyInRecovery !== "social") {
                      navigation.navigate("create-multisig-init");
                    } else {
                      navigation.navigate("replace-multisig");
                    }
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
