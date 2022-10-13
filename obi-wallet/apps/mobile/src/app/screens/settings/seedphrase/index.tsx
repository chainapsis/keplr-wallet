import { isSinglesigWallet } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { FormattedMessage } from "react-intl";
import { Platform, Share, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../../stores";
import { Back } from "../../components/back";
import { isSmallScreenNumber } from "../../components/screen-size";

export const Seedphrase = observer(() => {
  const { currentWallet } = useStore().walletsStore;

  if (!isSinglesigWallet(currentWallet)) return null;
  const mnemonic = currentWallet.mnemonic;

  const onShare = async (text: string) => {
    try {
      await Share.share({
        message: text,
      });
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
        paddingVertical: Platform.select({
          ios: isSmallScreenNumber(20, 20),
          android: isSmallScreenNumber(30, 30),
        }),
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
            <FormattedMessage
              id="singlesig.seedphrase"
              defaultMessage="Seedphrase"
            />
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#17162C",
            borderRadius: 12,
            paddingVertical: 20,
            paddingHorizontal: 30,
          }}
          onPress={() => onShare(mnemonic)}
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
              id="seedphrase.taptoshare"
              defaultMessage="Tap to copy your seedphrase"
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
            {mnemonic}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});
