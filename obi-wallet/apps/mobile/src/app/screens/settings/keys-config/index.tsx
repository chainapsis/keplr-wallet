import { Text } from "@obi-wallet/common";
import React from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgProps } from "react-native-svg";

import { Back } from "../../components/back";
import Check from "./assets/check-icon.svg";
import Cloud from "./assets/cloud-icon.svg";
import Email from "./assets/email-icon.svg";
import FaceId from "./assets/face-id-icon.svg";
import Keys1 from "./assets/keys1.svg";
import Share from "./assets/share-icon.svg";
import Warning from "./assets/warning-icon.svg";
import Whatsapp from "./assets/whatsapp-icon.svg";

export function KeysConfigScreen() {
  const data: KeyListItem[] = [
    {
      key: "phone-number",
      title: "Phone Number Key",
      activated: true,
      Icon: Whatsapp,
    },
    {
      key: "email",
      title: "E-Mail Key",
      activated: false,
      Icon: Email,
    },
    {
      key: "face-id",
      title: "Face ID Key",
      activated: false,
      Icon: FaceId,
    },
    {
      key: "cloud",
      title: "Cloud Backup Key",
      activated: false,
      Icon: Cloud,
    },
    {
      key: "share",
      title: "Share Key",
      activated: false,
      Icon: Share,
    },
  ];

  return (
    <SafeAreaView
      style={{ backgroundColor: "#090817", flex: 1, paddingHorizontal: 16 }}
    >
      <View style={{ flex: 2 }}>
        <Back />
        <Text style={styles.heading}>Manage Multisig</Text>
        <Text style={styles.subHeading}>
          Add/edit keys to improve security. Tap on any of the following
        </Text>
      </View>
      <View style={{ flex: 3, justifyContent: "center", alignItems: "center" }}>
        <Keys1 />
        <Text
          style={[
            styles.heading,
            { marginTop: 0, fontSize: 18, marginBottom: 8 },
          ]}
        >
          High Security Risk
        </Text>
        <Text style={[styles.subHeading, { marginBottom: 0 }]}>
          4 steps remaining
        </Text>
      </View>
      <View style={{ flex: 6 }}>
        <FlatList
          data={data}
          renderItem={({ item }) => <KeyListItem item={item} />}
          style={{ flex: 1, marginTop: 40 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: "#F6F5FF",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 47,
  },
  subHeading: {
    color: "#999CB6",
    fontSize: 14,
    marginBottom: 31,
  },
});

interface KeyListItem {
  key: string;
  title: string;
  activated: boolean;
  Icon: React.FC<SvgProps>;
}

interface KeyListItemProps {
  item: KeyListItem;
}

function KeyListItem({ item }: KeyListItemProps) {
  const { title, Icon, activated } = item;
  return (
    <View
      style={{
        height: 79,
        width: "100%",
        backgroundColor: "#111023",
        marginBottom: 20,
        flexDirection: "row",
        borderRadius: 12,
      }}
    >
      <View style={{ flex: 2, justifyContent: "center", alignItems: "center" }}>
        <View
          style={{
            backgroundColor: "#1D1C37",
            width: 36,
            height: 36,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 12,
          }}
        >
          <Icon />
        </View>
      </View>
      <View style={{ flex: 6, justifyContent: "center" }}>
        <Text
          style={{
            color: "#F6F5FF",
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: "#F6F5FF",
            fontSize: 12,
            opacity: 0.6,
            marginTop: 4,
          }}
        >
          Now send your encrypted answer to
        </Text>
      </View>
      <View style={{ flex: 2, justifyContent: "center", alignItems: "center" }}>
        {activated ? <Check /> : <Warning />}
      </View>
    </View>
  );
}
