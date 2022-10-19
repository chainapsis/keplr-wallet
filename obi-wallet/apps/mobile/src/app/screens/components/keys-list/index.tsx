import { MultisigKey, Text } from "@obi-wallet/common";
import { FC } from "react";
import {
  FlatList,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SvgProps } from "react-native-svg";

import People from "../../onboarding/common/4-social/assets/people-alt-twotone-24px.svg";
import Biometrics from "./assets/biometrics-icon.svg";
import Check from "./assets/check-icon.svg";
import Cloud from "./assets/cloud-icon.svg";
import Email from "./assets/email-icon.svg";
import PhoneNumber from "./assets/phone-number-icon.svg";
import Warning from "./assets/warning-icon.svg";

export const CheckIcon = Check;
export const WarningIcon = Warning;

export interface KeyMetaData {
  Icon: FC<SvgProps>;
}

export const keyMetaData: Record<MultisigKey, KeyMetaData> = {
  biometrics: { Icon: Biometrics },
  cloud: { Icon: Cloud },
  phoneNumber: { Icon: PhoneNumber },
  email: { Icon: Email },
  social: { Icon: () => <People width={24} height={24} /> },
};

export interface Key {
  id: MultisigKey;
  title: string;
  description?: string;
  right?: React.ReactNode;
  signed?: boolean;
  onPress?: () => void;
}

export type HydratedKeyListItem = Key & KeyMetaData;

export interface KeysListProps {
  data: Key[];
  style?: StyleProp<ViewStyle>;
  tiled?: boolean;
}

const comingSoonKeys: HydratedKeyListItem[] = [
  {
    id: "email",
    title: "E-mail Key",
    description: "Coming Soon",
    right: <View />,
    onPress: () => null,
    Icon: Email,
  },
  {
    id: "cloud",
    title: "Cloud Key",
    description: "Coming Soon",
    right: <View />,
    onPress: () => null,
    Icon: Cloud,
  },
];

export function KeysList({ data, style, tiled }: KeysListProps) {
  const hydratedData = data.map((key) => {
    return {
      ...key,
      ...keyMetaData[key.id],
    };
  });

  return (
    <View style={[style]}>
      <FlatList
        data={[...hydratedData, ...comingSoonKeys]}
        horizontal={tiled}
        keyExtractor={(item) => item.id}
        renderItem={(props) => <KeyListItem {...props} tiled={tiled} />}
      />
    </View>
  );
}

export interface KeyListItemProps {
  item: HydratedKeyListItem;
  tiled?: boolean;
}

export function KeyListItem({ item, tiled }: KeyListItemProps) {
  const { title, description, Icon, right, onPress, signed } = item;

  if (tiled && item.description === "Coming Soon") return null;

  return tiled ? (
    <TouchableOpacity onPress={onPress}>
      <View style={{ padding: 10 }}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <View
            style={{
              backgroundColor: "#1D1C37",
              width: 50,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 36,
              borderWidth: 5,
              borderColor: signed ? "#89F5C2" : "transparent",
            }}
          >
            <Icon />
          </View>
        </View>
        <Text
          style={{
            color: "#F6F5FF",
            fontSize: 12,
            fontWeight: "600",
            opacity: 0.6,
            marginTop: 4,
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={{
        height: 59,
        width: "100%",
        backgroundColor: "#111023",
        marginBottom: 10,
        flexDirection: "row",
        borderRadius: 12,
      }}
      onPress={onPress}
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
        {description ? (
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 12,
              opacity: 0.6,
              marginTop: 4,
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>
      <View style={{ flex: 2, justifyContent: "center", alignItems: "center" }}>
        {right}
      </View>
    </TouchableOpacity>
  );
}
