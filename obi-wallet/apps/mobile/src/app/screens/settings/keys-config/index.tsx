import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import { isMultisigWallet, MultisigKey, Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useRootNavigation } from "../../../root-stack";
import { useStore } from "../../../stores";
import { Back } from "../../components/back";
import {
  CheckIcon,
  Key,
  keyMetaData,
  KeysList,
  WarningIcon,
} from "../../components/keys-list";
import { isSmallScreenNumber } from "../../components/screen-size";
import Keys1 from "./assets/keys1.svg";
import Keys2 from "./assets/keys2.svg";
import Keys3 from "./assets/keys3.svg";
import Keys4 from "./assets/keys4.svg";
import Keys5 from "./assets/keys5.svg";

const getSVG = (number: number) => {
  switch (number) {
    case 1:
      return <Keys1 width={isSmallScreenNumber(130, 160)} />;
    case 2:
      return <Keys2 width={isSmallScreenNumber(130, 160)} />;
    case 3:
      return <Keys3 width={isSmallScreenNumber(130, 160)} />;
    case 4:
      return <Keys4 width={isSmallScreenNumber(130, 160)} />;
    case 5:
      return <Keys5 width={isSmallScreenNumber(130, 160)} />;
    default:
      return <Keys1 width={isSmallScreenNumber(130, 160)} />;
  }
};

export const KeysConfigScreen = observer(() => {
  const { walletsStore } = useStore();
  const wallet = walletsStore.currentWallet;
  const currentAdmin = isMultisigWallet(wallet) ? wallet.currentAdmin : null;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedItem, setSelectedItem] = useState<KeyListItem | null>(null);

  const triggerBottomSheet = (index: number) => {
    if (index === -1) {
      bottomSheetRef.current?.close();
    } else {
      bottomSheetRef.current?.snapToIndex(index);
    }
  };

  function getKey({
    id,
    title,
  }: {
    id: MultisigKey;
    title: string;
  }): Key & { activated: boolean; disabled: boolean } {
    const activated = currentAdmin?.[id] !== null;
    const disabled = false;
    return {
      id,
      title,
      activated,
      disabled,
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

  const intl = useIntl();

  const data: (Key & { activated: boolean })[] = [
    getKey({
      id: "phoneNumber",
      title: intl.formatMessage({
        id: "settings.multisig.option.phonekey",
        defaultMessage: "Phone Number Key",
      }),
    }),
    getKey({
      id: "biometrics",
      title: intl.formatMessage({
        id: "settings.multisig.option.biometricskey",
        defaultMessage: "Biometrics Key",
      }),
    }),
    getKey({
      id: "social",
      title: intl.formatMessage({
        id: "settings.multisig.option.socialkey",
        defaultMessage: "Social Key",
      }),
    }),
    // KLUDGE for party demo, rm later
    {
      id: "email",
      title: intl.formatMessage({
        id: "settings.multisig.option.emailkey",
        defaultMessage: "Email Key",
      }),
      activated: false,
    },
    {
      id: "cloud",
      title: intl.formatMessage({
        id: "settings.multisig.option.cloudkey",
        defaultMessage: "Cloud Key",
      }),
      activated: false,
    },
  ];

  const activatedKeys = data.filter((item) => item.activated).length;

  return (
    <SafeAreaView
      style={{
        backgroundColor: "#090817",
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
      }}
    >
      <View style={{ flex: 2 }}>
        <Back style={{ alignSelf: "flex-start" }} />
        <Text style={styles.heading}>
          <FormattedMessage
            id="settings.multisig.title"
            defaultMessage="Manage Multisig"
          />
        </Text>
        <Text style={styles.subHeading}>
          <FormattedMessage
            id="settings.multisig.subtitle"
            defaultMessage="Add/edit keys to improve security. Tap on any of the following"
          />
        </Text>
      </View>
      <View style={{ flex: 3, justifyContent: "center", alignItems: "center" }}>
        <View>{getSVG(activatedKeys)}</View>
        <Text
          style={[
            styles.heading,
            { marginTop: 0, fontSize: 18, marginBottom: 8 },
          ]}
        >
          <FormattedMessage
            id="settings.multisig.risk.high"
            defaultMessage="Security Tier: Basic"
          />
        </Text>
        <Text style={[styles.subHeading, { marginBottom: 0 }]}>
          {data.length - activatedKeys}&nbsp;
          {data.length - activatedKeys === 0 && (
            <FormattedMessage
              id="settings.multisig.risk.stepsremaining"
              defaultMessage="steps remaining"
            />
          )}
          {data.length - activatedKeys === 1 && (
            <FormattedMessage
              id="settings.multisig.risk.stepsremaining"
              defaultMessage="step remaining"
            />
          )}
          {data.length - activatedKeys >= 1 && (
            <FormattedMessage
              id="settings.multisig.risk.stepsremaining"
              defaultMessage="steps remaining"
            />
          )}
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
        ref={bottomSheetRef}
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
    marginTop: 30,
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
  const { navigate } = useRootNavigation();
  const { id, title, activated } = item;
  const { Icon } = keyMetaData[id];
  const { walletsStore } = useStore();

  const safeArea = useSafeAreaInsets();

  const getRecoverButton = (keyId: MultisigKey) => {
    return (
      <TouchableOpacity
        onPress={() => {
          const wallet = walletsStore.currentWallet;
          if (isMultisigWallet(wallet)) {
            wallet.recover(keyId);
            navigate("state-renderer");
          }
        }}
        style={{
          paddingVertical: 5,
          width: "100%",
          backgroundColor: "#59D6E6",
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "700" }}>
          {/** ToDo: i18n - Building sentences dynamically is not feasible with translations, as the word-order is different in other languages. */}
          {/** "Replace {title} now" ...not possible */}
          <FormattedMessage
            id="settings.multisig.modal.replacenow"
            defaultMessage="Replace now"
          />
        </Text>
      </TouchableOpacity>
    );
  };

  const getModalText = (keyId: MultisigKey) => {
    switch (keyId) {
      case "phoneNumber":
        return (
          <FormattedMessage
            id="settings.multisig.modal.phone.text"
            defaultMessage="This key can authorize messages via SMS or WhatsApp messages sent directly to your phone number."
          />
        );
      case "biometrics":
        return (
          <FormattedMessage
            id="settings.multisig.modal.biometrics.text"
            defaultMessage="This key is held on your device, in a secure element or secure keychain."
          />
        );
      case "social":
        return (
          <FormattedMessage
            id="settings.multisig.modal.social.text"
            defaultMessage="This key belongs to a trusted contact or to Obi and can help you recover your account. It cannot access your account on its own."
          />
        );
      default:
        return null;
    }
  };

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
            {activated && (
              <FormattedMessage id="general.active" defaultMessage="Active" />
            )}
            {!activated && (
              <FormattedMessage
                id="general.notactive"
                defaultMessage="Not Active"
              />
            )}
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
          {getModalText(item.id)}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {item.id !== "biometrics" ? (
          <>
            <FontAwesomeIcon
              icon={faInfoCircle}
              style={{ color: "rgba(246, 245, 255, 0.6)", marginRight: 10 }}
            />
            <Text
              style={{
                flex: 1,
                fontSize: 12,
                color: "rgba(246, 245, 255, 0.6)",
              }}
            >
              <FormattedMessage
                id="settings.multisig.modal.info"
                defaultMessage="In case this key is stolen/lost or for any other reason, you can replace it with a new one."
              />
            </Text>
          </>
        ) : null}
      </View>
      <View style={{ alignItems: "center" }}>
        {item.id !== "biometrics" ? <>{getRecoverButton(item.id)}</> : null}
        <TouchableOpacity
          onPress={() => onClose()}
          style={{ paddingVertical: 15, paddingHorizontal: 63 }}
        >
          <Text style={{ color: "#787B9C" }}>
            {item.id !== "biometrics" ? (
              <FormattedMessage
                id="settings.multisig.modal.close"
                defaultMessage="Close"
              />
            ) : (
              <FormattedMessage
                id="settings.multisig.modal.notnow"
                defaultMessage="Not now"
              />
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
