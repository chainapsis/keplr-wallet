import { observer } from "mobx-react-lite";
import { FormattedMessage } from "react-intl";
import { Share, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../stores";
import { Back } from "../components/back";

export const ReceiveScreen = observer(() => {
  const { demoStore, multisigStore } = useStore();
  const address = demoStore.demoMode
    ? "demo-address"
    : multisigStore.proxyAddress?.address;

  if (!address) return null;

  const onShare = async (text: string) => {
    try {
      const result = await Share.share({
        message: text,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (e) {
      const error = e as Error;
      alert(error.message);
    }
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: "rgba(9, 8, 23, 1);",
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: "space-between",
      }}
    >
      <View style={{ zIndex: 2 }}>
        <View style={{ flexDirection: "row" }}>
          <Back style={{ alignSelf: "flex-start", zIndex: 2 }} />
          <Text
            style={{
              width: "100%",
              textAlign: "center",
              marginLeft: -20,
              color: "#F6F5FF",
              fontWeight: "600",
            }}
          >
            <FormattedMessage id="receive.receive" defaultMessage="Receive" />
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View
          style={{
            borderRadius: 16,
            backgroundColor: "white",
            padding: 10,
            marginBottom: "30%",
          }}
        >
          <QRCode value={address} size={200} />
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "#17162C",
            borderRadius: 12,
            paddingVertical: 20,
            paddingHorizontal: 30,
          }}
          onPress={() => onShare(address)}
        >
          <Text
            style={{
              textAlign: "center",
              color: "#F6F5FF",
              fontSize: 16,
              fontWeight: "500",
            }}
          >
            <FormattedMessage
              id="receive.taptoshare"
              defaultMessage="Tap to share your address"
            />
          </Text>
          <Text
            style={{
              textAlign: "center",
              color: "#F6F5FF",
              fontSize: 12,
              fontWeight: "500",
              opacity: 0.6,
              marginTop: 10,
            }}
          >
            {address}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});
