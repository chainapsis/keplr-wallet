import { MultisigKey, Text } from "@obi-wallet/common";
import { FC } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

import People from "../../onboarding/5-social/assets/people-alt-twotone-24px.svg";
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
  onPress?: () => void;
}

export type HydratedKeyListItem = Key & KeyMetaData;

export interface KeysListProps {
  data: Key[];
}
const comingSoonKeys: HydratedKeyListItem[] = [
  {
    id: "email",
    title: "Email",
    description: "Coming Soon",
    right: <View />,
    onPress: () => null,
    Icon: Email,
  },
  {
    id: "cloud",
    title: "Cloud",
    description: "Coming Soon",
    right: <View />,
    onPress: () => null,
    Icon: Cloud,
  },
];

export function KeysList({ data }: KeysListProps) {
  const hydratedData = data.map((key) => {
    return {
      ...key,
      ...keyMetaData[key.id],
    };
  });

  return (
    <FlatList
      data={[...hydratedData, ...comingSoonKeys]}
      keyExtractor={(item) => item.id}
      renderItem={(props) => <KeyListItem {...props} />}
    />
  );
}

export interface KeyListItemProps {
  item: HydratedKeyListItem;
}

export function KeyListItem({ item }: KeyListItemProps) {
  const { title, description, Icon, right, onPress } = item;

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
      onPress={() => {
        onPress();
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
