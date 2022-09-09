import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import { MultisigKey, Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useStore } from "../../../stores";
import { Back } from "../../components/back";
import {
  CheckIcon,
  Key,
  keyMetaData,
  KeysList,
  WarningIcon,
} from "../../components/keys-list";
import Keys1 from "./assets/keys1.svg";
import Keys2 from "./assets/keys2.svg";
import Keys3 from "./assets/keys3.svg";
import Keys4 from "./assets/keys4.svg";
import Keys5 from "./assets/keys5.svg";

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

export const KeysConfigScreen = observer(() => {
  const { multisigStore } = useStore();
  const currentAdmin = multisigStore.currentAdmin;
  const refBottomSheet = useRef<BottomSheet>();
  const [selectedItem, setSelectedItem] = useState<KeyListItem | null>(null);

  const triggerBottomSheet = (index) => {
    if (index === -1) {
      refBottomSheet.current.close();
    } else {
      refBottomSheet.current.snapToIndex(index);
    }
  };

  function getKey({
    id,
    title,
  }: {
    id: MultisigKey;
    title: string;
  }): Key & { activated: boolean } {
    const activated = currentAdmin[id] !== null;
    return {
      id,
      title,
      activated,
      right: activated ? <CheckIcon /> : <WarningIcon />,
      onPress: () => {
        triggerBottomSheet(0);
        setSelectedItem({
          id,
          title,
          activated,
        });
      },
    };
  }

  const data: (Key & { activated: boolean })[] = [
    getKey({
      id: "phoneNumber",
      title: "Phone Number Key",
    }),
    getKey({ id: "biometrics", title: "Biometrics Key" }),
    getKey({ id: "social", title: "Social Key" }),
    // getKey({ id: "cloud", title: "Cloud Key" }),
  ];

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
          {data.length - activatedKeys} steps remaining
        </Text>
      </View>
      <View style={{ flex: 6 }}>
        <View style={{ marginTop: 40 }}>
          <KeysList data={data} />
        </View>
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
});

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
  id: MultisigKey;
  title: string;
  activated: boolean;
}

interface KeyConfigProps {
  item: KeyListItem;
  onClose: () => void;
}

function KeyConfig({ item, onClose }: KeyConfigProps) {
  const { id, title, activated } = item;
  const { Icon } = keyMetaData[id];

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
          In case of stolen/lost or any other reason, you can replace this key
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
