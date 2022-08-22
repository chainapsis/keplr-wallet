import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import { Text } from "@obi-wallet/common";
import { useRef, useState, FC } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { SvgProps } from "react-native-svg";

import { Back } from "../../components/back";
import Check from "./assets/check-icon.svg";
import Cloud from "./assets/cloud-icon.svg";
import Email from "./assets/email-icon.svg";
import FaceId from "./assets/face-id-icon.svg";
import Keys1 from "./assets/keys1.svg";
import Keys2 from "./assets/keys2.svg";
import Keys3 from "./assets/keys3.svg";
import Keys4 from "./assets/keys4.svg";
import Keys5 from "./assets/keys5.svg";
import Share from "./assets/share-icon.svg";
import Warning from "./assets/warning-icon.svg";
import Whatsapp from "./assets/whatsapp-icon.svg";

const getSVG = (number: number) => {
  switch (number) {
    case 1:
      return <Keys1 />;
    case 2:
      return <Keys2 />;
    case 3:
      return <Keys3 />;
    case 4:
      return <Keys4 />;
    case 5:
      return <Keys5 />;
    default:
      return <Keys1 />;
  }
};
export function KeysConfigScreen() {
  const refBottomSheet = useRef<BottomSheet>();
  const [selectedItem, setSelectedItem] = useState<KeyListItem | null>(null);
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
      activated: true,
      Icon: Email,
    },
    {
      key: "face-id",
      title: "Face ID Key",
      activated: true,
      Icon: FaceId,
    },
    {
      key: "cloud",
      title: "Cloud Backup Key",
      activated: true,
      Icon: Cloud,
    },
    {
      key: "share",
      title: "Share Key",
      activated: true,
      Icon: Share,
    },
  ];

  const triggerBottomSheet = (index) => {
    console.log({ index });
    if (index === -1) {
      refBottomSheet.current.close();
    } else {
      refBottomSheet.current.snapToIndex(index);
    }
  };
  const openKeyConfig = (item) => {
    triggerBottomSheet(0);
    setSelectedItem(item);
  };
  const activatedKeys = data.filter((item) => item.activated).length;

  return (
    <SafeAreaView
      style={{ backgroundColor: "#090817", flex: 1, paddingHorizontal: 16 }}
    >
      <View style={{ flex: 2 }}>
        <Back style={{ alignSelf: "flex-start" }} />
        <Text style={styles.heading}>Manage Multisig</Text>
        <Text style={styles.subHeading}>
          Add/edit keys to improve security. Tap on any of the following
        </Text>
      </View>
      <View style={{ flex: 3, justifyContent: "center", alignItems: "center" }}>
        {getSVG(activatedKeys)}
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
          renderItem={({ item }) => (
            <KeyListItem
              item={item}
              onPress={() => {
                openKeyConfig(item);
              }}
            />
          )}
          style={{ flex: 1, marginTop: 40 }}
        />
      </View>
      <BottomSheet
        handleIndicatorStyle={{ backgroundColor: "white" }}
        backgroundStyle={{ backgroundColor: "#100F1E" }}
        handleStyle={{ backgroundColor: "transparent" }}
        snapPoints={["50%"]}
        enablePanDownToClose={true}
        ref={refBottomSheet}
        index={-1}
      >
        <BottomSheetView
          style={{
            flex: 1,
            backgroundColor: "transparent",
            position: "relative",
          }}
        >
          {selectedItem && (
            <KeyConfig
              item={selectedItem}
              onClose={() => triggerBottomSheet(-1)}
            />
          )}
        </BottomSheetView>
      </BottomSheet>
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
  Icon: FC<SvgProps>;
}

interface KeyListItemProps {
  item: KeyListItem;
  onPress: () => void;
}

function KeyListItem({ item, onPress }: KeyListItemProps) {
  const { title, Icon, activated } = item;
  return (
    <TouchableOpacity
      style={{
        height: 79,
        width: "100%",
        backgroundColor: "#111023",
        marginBottom: 20,
        flexDirection: "row",
        borderRadius: 12,
      }}
      onPress={() => onPress()}
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
    </TouchableOpacity>
  );
}

interface KeyConfigProps {
  item: KeyListItem;
  onClose: () => void;
}
function KeyConfig({ item, onClose }: KeyConfigProps) {
  const { title, Icon, activated } = item;
  const safeArea = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        paddingBottom: safeArea.bottom,
        paddingHorizontal: 20,
        marginTop: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            padding: 10,
            backgroundColor: "#1D1C37",
            alignSelf: "flex-start",
            borderRadius: 12,
          }}
        >
          <Icon />
        </View>
        <View
          style={{ padding: 10, backgroundColor: "#1D1C37", borderRadius: 12 }}
        >
          <Text
            style={{
              color: activated ? "#89F5C2" : "#999CB6",
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            {!activated && "Not"} Active
          </Text>
        </View>
      </View>
      <View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#f6f5ff",
            marginBottom: 10,
          }}
        >
          {title}
        </Text>
        <Text style={{ color: "rgba(246, 245, 255, 0.6)" }}>
          Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
          sint. Velit officia consequat duis enim velit mollit.{" "}
        </Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        <FontAwesomeIcon
          icon={faInfoCircle}
          style={{ color: "rgba(246, 245, 255, 0.6)", marginRight: 10 }}
        />
        <Text style={{ fontSize: 12, color: "rgba(246, 245, 255, 0.6)" }}>
          In case of stolen/ lost or any other reason, you can replace this key
          with a new one
        </Text>
      </View>
      <View style={{ alignItems: "center" }}>
        <TouchableOpacity
          style={{
            paddingVertical: 15,
            width: "100%",
            backgroundColor: "#59D6E6",
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "700" }}>
            Replace {title} now
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onClose()}
          style={{ paddingVertical: 15, paddingHorizontal: 63 }}
        >
          <Text style={{ color: "#787B9C" }}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
