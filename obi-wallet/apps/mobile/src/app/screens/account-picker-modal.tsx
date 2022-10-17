import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

import { Button, IconButton } from "../button";
import { useStore } from "../stores";
import { Modal } from "./components/modal";

export const AccountPickerModal = observer(() => {
  const { walletsStore } = useStore();
  const [isVisible, setIsVisible] = useState(() => {
    return walletsStore.wallets.length > 0;
  });

  return (
    <Modal
      isVisible={isVisible}
      onClose={() => {
        setIsVisible(false);
      }}
    >
      <View style={{ flexShrink: 1 }}>
        <View>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 24,
              fontWeight: "600",
            }}
          >
            <FormattedMessage id="login.title" defaultMessage="Login" />
          </Text>
          <Text
            style={{
              color: "#999CB6",
              fontSize: 14,
              marginTop: 10,
            }}
          >
            <FormattedMessage
              id="login.subtext"
              defaultMessage="We found various wallets on-device. You can log back in or add a new one."
            />
          </Text>
        </View>
        <ScrollView>
          {walletsStore.wallets.map((wallet, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={{
                  height: 79,
                  width: "100%",
                  backgroundColor: "#111023",
                  marginBottom: 20,
                  flexDirection: "row",
                  borderRadius: 12,
                  paddingHorizontal: 10,
                }}
                onPress={async () => {
                  await walletsStore.setCurrentWallet(index);
                }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    paddingHorizontal: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#F6F5FF",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {wallet.shortenedAddress}
                  </Text>
                </View>
                <IconButton
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 10,
                  }}
                  onPress={() => {
                    Alert.alert(
                      "Are you sure?",
                      "This will remove the wallet from device.",
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "Confirm",
                          onPress: async () => {
                            await walletsStore.removeWallet(index);
                          },
                        },
                      ]
                    );
                  }}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    style={{ color: "#7B87A8" }}
                  />
                </IconButton>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <View
        style={{
          marginTop: 20,
          flexShrink: 0,
        }}
      >
        <Button
          // label={intl.formatMessage({
          //   id: "onboarding3.verifyandproceed",
          //   defaultMessage: "Verify & Proceed",
          // })}
          label="Add new wallet"
          flavor="blue"
          onPress={() => {
            setIsVisible(false);
          }}
        />
      </View>
    </Modal>
  );
});
