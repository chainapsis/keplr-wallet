import { isDeliverTxSuccess } from "@cosmjs/stargate";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons/faAngleDown";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";

import { ExtendedCoin, formatExtendedCoin, useBalances } from "../../balances";
import Bottle from "../../balances/assets/bottle.svg";
import Drink from "../../balances/assets/drink.svg";
import { Button } from "../../button";
import { useStore } from "../../stores";
import { TextInput } from "../../text-input";
import { useAddressQrCodeScannerModal } from "../components/address-qr-code-scanner-modal";
import { Back } from "../components/back";
import { BottomSheetBackdrop } from "../components/bottomSheetBackdrop";
import { CoinIcon } from "../components/coin-icon";
import { KeyboardAvoidingView } from "../components/keyboard-avoiding-view";
import { isSmallScreenNumber } from "../components/screen-size";
import {
  SignatureModal,
  useSignatureModalProps,
  useWrapEncodeObjects,
} from "../components/signature-modal";

const BARTENDER_ADDRESS =
  "juno1ps9sk7fqh2f95waggk3r5un6sr7rd4gxmq4kzh73zstgkqz52wmqh2wr0s";

export const SendScreen = observer(() => {
  const { navigate } = useNavigation();
  const { balances, refreshing, refreshBalances } = useBalances();
  const [selectedCoin, setSelectedCoin] = useState<ExtendedCoin | undefined>(
    () => {
      return balances.length > 0 ? balances[0] : undefined;
    }
  );
  const [denominationOpened, setDenominationOpened] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const triggerBottomSheet = (open: boolean) => {
    if (open) {
      setDenominationOpened(true);
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  };

  useEffect(() => {
    if (selectedCoin === undefined && balances.length > 0) {
      setSelectedCoin(balances[0]);
    }
  }, [balances, selectedCoin]);

  const hydratedSelectedCoin = selectedCoin
    ? formatExtendedCoin(selectedCoin)
    : null;

  const { multisigStore, singlesigStore, walletStore } = useStore();
  const multisig = multisigStore.currentAdmin;

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const drinkOrBottleModalFlavor =
    selectedCoin?.denom === "ubottle"
      ? "bottle"
      : selectedCoin?.denom === "udrink"
      ? "drink"
      : null;

  const normalizedAmount = amount.replace(/,/g, ".");
  const encodeObjects = useWrapEncodeObjects(() => {
    if (!selectedCoin || !walletStore.type) return [];

    const addressToUse =
      address || (drinkOrBottleModalFlavor ? BARTENDER_ADDRESS : "");

    const { digits } = formatExtendedCoin(selectedCoin);
    const normalizedAmount =
      parseFloat(amount.replace(",", ".")) * Math.pow(10, digits);
    const msgAmount = [
      {
        denom: selectedCoin.denom,
        amount: normalizedAmount.toFixed(0).toString(),
      },
    ];

    if (!walletStore.address) return [];

    if (selectedCoin.contract) {
      return {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: {
          sender: walletStore.address,
          contract: selectedCoin.contract,
          msg: new Uint8Array(
            Buffer.from(
              JSON.stringify({
                transfer: {
                  amount: msgAmount[0].amount,
                  recipient: addressToUse,
                },
              })
            )
          ),
          funds: [],
        },
      };
    }

    return {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress: singlesigStore.address,
        toAddress: addressToUse,
        amount: msgAmount,
      },
    };
  });

  const [confirmModalVisible, setConfirmModalStatus] = useState<{
    visible?: boolean;
    success?: boolean;
  }>({});

  const { signatureModalProps, openSignatureModal } = useSignatureModalProps({
    multisig,
    encodeObjects,
    async onConfirm(response) {
      console.log(response);
      if (isDeliverTxSuccess(response)) {
        setConfirmModalStatus({
          visible: true,
          success: true,
        });
      } else {
        setConfirmModalStatus({
          visible: true,
          success: false,
        });
      }
    },
  });

  const intl = useIntl();
  const qrCodeScannerModal = useAddressQrCodeScannerModal((address) => {
    setAddress(address);
  });

  const coinIconProps =
    typeof hydratedSelectedCoin?.icon === "number"
      ? { imageIcon: hydratedSelectedCoin.icon }
      : { SVGIcon: hydratedSelectedCoin?.icon };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          backgroundColor: "rgba(9, 8, 23, 1);",
          flex: 1,
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: Platform.select({
            ios: isSmallScreenNumber(20, 20),
            android: isSmallScreenNumber(30, 30),
          }),
        }}
      >
        {qrCodeScannerModal.render()}
        <SignatureModal {...signatureModalProps} />

        {drinkOrBottleModalFlavor &&
        (!address || address === BARTENDER_ADDRESS) &&
        confirmModalVisible.visible &&
        confirmModalVisible.success ? (
          <DrinkOrBottleModal
            flavor={drinkOrBottleModalFlavor}
            visible={confirmModalVisible.visible && confirmModalVisible.success}
            onDismiss={() => {
              setConfirmModalStatus({ visible: false });
              // @ts-expect-error This is actually fine
              navigate("Assets");
            }}
          />
        ) : null}
        {((drinkOrBottleModalFlavor && address !== BARTENDER_ADDRESS) ||
          !drinkOrBottleModalFlavor) &&
        confirmModalVisible.visible &&
        confirmModalVisible.success ? (
          <SuccessModal
            visible={confirmModalVisible.visible && confirmModalVisible.success}
            onDismiss={() => {
              setConfirmModalStatus({ visible: false });
              // @ts-expect-error This is actually fine
              navigate("Assets");
            }}
          />
        ) : null}
        {confirmModalVisible.visible && !confirmModalVisible.success ? (
          <FailureModal
            visible={
              confirmModalVisible.visible && !confirmModalVisible.success
            }
            onDismiss={() => {
              setConfirmModalStatus({ visible: false });
            }}
          />
        ) : null}

        <View>
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
              <FormattedMessage id="send.send" defaultMessage="Send" />
            </Text>
          </View>
          <View
            style={{
              marginTop: 55,
              flexDirection: "row",
              alignItems: "flex-end",
            }}
          >
            <TextInput
              label={intl.formatMessage({
                id: "send.to",
                defaultMessage: "To",
              })}
              placeholder={
                drinkOrBottleModalFlavor
                  ? BARTENDER_ADDRESS
                  : intl.formatMessage({
                      id: "send.walletaddress",
                      defaultMessage: "Wallet Address",
                    })
              }
              style={{ flex: 1 }}
              inputStyle={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderRightWidth: 0,
              }}
              value={address}
              onChangeText={setAddress}
            />
            <TouchableOpacity
              style={{
                width: 56,
                height: 56,
                justifyContent: "center",
                alignItems: "center",
                padding: 5,
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                borderWidth: 1,
                borderColor: "#2F2B4C",
                borderLeftWidth: 0,
              }}
              onPress={() => {
                qrCodeScannerModal.open();
              }}
            >
              <View
                style={{
                  position: "absolute",
                  width: 1,
                  backgroundColor: "#2F2B4C",
                  height: "100%",
                  left: 0,
                }}
              />
              <FontAwesomeIcon
                icon={faQrcode}
                style={{ color: "#887CEB" }}
                size={32}
              />
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 35 }}>
            <Text
              style={{
                color: "#787B9C",
                textTransform: "uppercase",
                fontSize: 10,
                marginBottom: 12,
              }}
            >
              <FormattedMessage id="send.amount" defaultMessage="Amount" />
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 12,
                borderColor: "#2F2B4C",
                padding: 4,
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                style={{
                  borderRadius: 12,
                  flex: 2,
                  backgroundColor: "#17162C",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  paddingLeft: 12,
                }}
                onPress={() => triggerBottomSheet(true)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    flex: 3,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      marginRight: 12,
                      borderRadius: 44,
                    }}
                  >
                    <CoinIcon {...coinIconProps} />
                  </View>
                  <View style={{ justifyContent: "center" }}>
                    <Text
                      style={{
                        color: "#F6F5FF",
                        fontWeight: "500",
                        fontSize: 14,
                      }}
                    >
                      {hydratedSelectedCoin?.denom}
                    </Text>
                    <Text style={{ color: "#999CB6" }}>
                      {hydratedSelectedCoin?.amount}
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    style={{ color: "#7B87A8" }}
                  />
                </View>
              </TouchableOpacity>
              <TextInput
                keyboardType="numeric"
                style={{
                  alignSelf: "center",
                  borderColor: "transparent",
                  flex: 1,
                  paddingLeft: 20,
                  paddingRight: 10,
                }}
                inputStyle={{
                  borderColor: "transparent",
                  textAlign: "right",
                  fontSize: 18,
                  fontWeight: "500",
                }}
                placeholder="0"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>
        </View>
        <Button
          flavor="blue"
          label={intl.formatMessage({
            id: "send.next",
            defaultMessage: "Next",
          })}
          disabled={
            !(address || drinkOrBottleModalFlavor) ||
            !amount ||
            Number(normalizedAmount) <= 0 ||
            (drinkOrBottleModalFlavor && Number(normalizedAmount) < 1) ||
            !selectedCoin
          }
          onPress={() => {
            openSignatureModal();
          }}
        />
        <BottomSheetBackdrop
          onPress={() => triggerBottomSheet(false)}
          visible={denominationOpened}
        />
        <BottomSheet
          handleIndicatorStyle={{ backgroundColor: "white" }}
          backgroundStyle={{ backgroundColor: "#100F1E" }}
          handleStyle={{ backgroundColor: "transparent" }}
          snapPoints={["60"]}
          enablePanDownToClose={true}
          ref={bottomSheetRef}
          index={-1}
          backdropComponent={(props) => null}
          onClose={() => {
            setDenominationOpened(false);
          }}
        >
          <BottomSheetView
            style={{
              flex: 1,
              backgroundColor: "transparent",
              position: "relative",
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                marginBottom: 56,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#f6f5ff" }}
                >
                  <FormattedMessage
                    id="send.denomination"
                    defaultMessage="Denomination"
                  />
                </Text>
                <Text style={{ fontSize: 12, color: "#f6f5ff", opacity: 0.6 }}>
                  <FormattedMessage
                    id="send.selectcoin"
                    defaultMessage="Select the coin you'd like to send"
                  />
                </Text>
              </View>
              <TouchableOpacity onPress={() => triggerBottomSheet(false)}>
                <FontAwesomeIcon icon={faTimes} style={{ color: "#F6F5FF" }} />
              </TouchableOpacity>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#f6f5ff",
                  opacity: 0.6,
                  textTransform: "uppercase",
                }}
              >
                <FormattedMessage id="send.name" defaultMessage="Name" />
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#f6f5ff",
                  opacity: 0.6,
                  textTransform: "uppercase",
                }}
              >
                <FormattedMessage
                  id="send.holdings"
                  defaultMessage="Holdings"
                />
              </Text>
            </View>
            <FlatList
              data={balances}
              keyExtractor={(item) => item.denom}
              renderItem={(props) => (
                <CoinRenderer
                  {...props}
                  selected={props.item.denom === selectedCoin?.denom}
                  onPress={() => {
                    triggerBottomSheet(false);
                    setSelectedCoin(props.item);
                  }}
                />
              )}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshBalances}
                />
              }
            />
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
});

interface CoinRendererProps {
  item: ExtendedCoin;
  selected: boolean;
  onPress: () => void;
}

function CoinRenderer({ item, selected, onPress }: CoinRendererProps) {
  const { denom, label, amount, valueInUsd, icon } = formatExtendedCoin(item);
  const coinIconProps =
    typeof icon === "number" ? { imageIcon: icon } : { SVGIcon: icon };
  return (
    <TouchableOpacity
      style={{
        backgroundColor: selected ? "#17162C" : "#100F1E",
        marginVertical: 10,
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            width: 36,
            height: 36,
            marginRight: 10,
            borderRadius: 12,
          }}
        >
          <CoinIcon {...coinIconProps} />
        </View>
        <View>
          <Text style={{ color: "#f6f5ff", fontWeight: "500" }}>{label}</Text>
          <Text
            style={{
              color: "#f6f5ff",
              fontWeight: "500",
              fontSize: 12,
              opacity: 0.6,
            }}
          >
            {denom}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color: "#f6f5ff", fontWeight: "500" }}>
          ${valueInUsd.toFixed(2)}
        </Text>
        <Text
          style={{
            color: "#f6f5ff",
            fontWeight: "500",
            fontSize: 12,
            opacity: 0.6,
          }}
        >
          {amount} {denom}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface DrinkOrBottleModalProps {
  visible?: boolean;
  onDismiss: () => void;
  flavor: "bottle" | "drink";
}

function DrinkOrBottleModal({
  visible,
  onDismiss,
  flavor,
}: DrinkOrBottleModalProps) {
  const startTime = useRef(Date.now());
  const previousVisible = useRef(visible);
  const [remainingTime, setRemainingTime] = useState(180);
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = remainingTime % 60;

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(
        180 - Math.floor((Date.now() - startTime.current) / 1000)
      );
    });

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (remainingTime <= 0) {
      onDismiss();
    }
  }, [onDismiss, remainingTime]);

  if (visible !== previousVisible.current) {
    previousVisible.current = visible;
    startTime.current = Date.now();
  }

  return (
    <Modal isVisible={visible}>
      <View
        style={{
          flex: 1,
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#111023",
            borderRadius: 20,
            alignItems: "center",
            paddingVertical: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 19 }}>
            Please show this to your bartender
          </Text>
          <Text style={{ color: "#FF1010", marginTop: 10 }}>
            {remainingTime > 0 ? (
              <>
                {remainingMinutes}:
                {remainingSeconds.toString(10).length < 2 ? "0" : ""}
                {remainingSeconds}
              </>
            ) : (
              0
            )}
          </Text>
          <View style={{ marginTop: 16 }}>
            {flavor === "drink" ? (
              <Drink />
            ) : flavor === "bottle" ? (
              <Bottle />
            ) : null}
          </View>
          <Button
            flavor="blue"
            label="Dismiss"
            style={{ marginTop: 20 }}
            onPress={() => {
              onDismiss();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

interface SuccessModalProps {
  visible?: boolean;
  onDismiss: () => void;
}

function SuccessModal({ visible, onDismiss }: SuccessModalProps) {
  return (
    <Modal isVisible={visible}>
      <View
        style={{
          flex: 1,
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#111023",
            borderRadius: 20,
            alignItems: "center",
            paddingVertical: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 19 }}>
            Transaction successful
          </Text>
          <Button
            flavor="blue"
            label="Dismiss"
            style={{ marginTop: 20 }}
            onPress={() => {
              onDismiss();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

interface FailureModalProps {
  visible?: boolean;
  onDismiss: () => void;
}

function FailureModal({ visible, onDismiss }: FailureModalProps) {
  return (
    <Modal isVisible={visible}>
      <View
        style={{
          flex: 1,
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#111023",
            borderRadius: 20,
            alignItems: "center",
            paddingVertical: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 19 }}>
            Transaction failed
          </Text>
          <Button
            flavor="blue"
            label="Dismiss"
            style={{ marginTop: 20 }}
            onPress={() => {
              onDismiss();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
