import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { Back } from "../../components/back";
import Keys1 from "./assets/Keys1.svg";
import Check from "./assets/checkIcon.svg";
import Cloud from "./assets/cloudIcon.svg";
import Email from "./assets/emailIcon.svg";
import FaceId from "./assets/faceIdIcon.svg";
import Share from "./assets/shareIcon.svg";
import Warning from "./assets/warningIcon.svg";
import Whatsapp from "./assets/whatsappIcon.svg";

export function Keys() {
  return (
    <SafeAreaView
      style={{ backgroundColor: "#090817", flex: 1, paddingHorizontal: 16 }}
    >
      <View style={{ flex: 2 }}>
        <Back />
        <Text style={styles.heading}>Manage Multisig</Text>
        <Text style={styles.subHeading}>
          Add/ Edit keys to improve security. Tap on any of the following
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
          data={[
            {
              key: "1",
              title: "telephone/whatsapp key",
              activated: true,
              icon: Whatsapp,
            },
            {
              key: "2",
              title: "Email key",
              activated: false,
              icon: Email,
            },
            {
              key: "3",
              title: "FaceId key",
              activated: false,
              icon: FaceId,
            },
            {
              key: "4",
              title: "Cloud Backup key",
              activated: false,
              icon: Cloud,
            },
            {
              key: "5",
              title: "Share key",
              activated: false,
              icon: Share,
            },
          ]}
          renderItem={({ item }) => <KeyListItem item={item} />}
          style={{ flex: 1, marginTop: 40 }}
        />
      </View>
    </SafeAreaView>
  );
}

// styleSheet
const styles = StyleSheet.create({
  heading: {
    color: "#F6F5FF",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 10,
    fontFamily: "Inter",
    marginTop: 47,
  },
  subHeading: {
    color: "#999CB6",
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 31,
    fontFamily: "Inter",
  },
});

function KeyListItem({ item: { title, icon, activated }, ...rest }: any) {
  const Icon = icon;
  console.log({ title, rest });
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
            fontFamily: "Inter",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: "#F6F5FF",
            fontSize: 12,
            fontWeight: "400",
            fontFamily: "Inter",
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
