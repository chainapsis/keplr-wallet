import { AminoMsg } from "@cosmjs/amino";
import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Modal,
  ModalProps,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../../button";
import { Loader } from "../../../loader";
import { Background } from "../background";
import ArrowUpIcon from "./assets/arrowUpIcon.svg";

enum Tab {
  TransactionDetails,
  Data,
}

export interface ConfirmMessagesProps extends ModalProps {
  loading?: boolean;
  disabled?: boolean;
  cancelable?: boolean;
  messages: readonly AminoMsg[];
  footer?: ReactNode;
  children?: ReactNode;

  onCancel(): void;

  onConfirm(): void;
}

export const ConfirmMessages = observer<ConfirmMessagesProps>(
  ({
    loading,
    disabled,
    cancelable = true,
    messages,
    onCancel,
    onConfirm,
    footer,
    children,
    ...props
  }) => {
    const intl = useIntl();
    const safeArea = useSafeAreaInsets();
    const [selectedTab, setSelectedTab] = useState(Tab.TransactionDetails);

    return (
      <Modal {...props}>
        <View style={{ flex: 1 }}>
          {loading ? (
            <Loader
              loadingText="Loading..."
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
                position: "absolute",
                backgroundColor: "#100F1D",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ) : null}

          <Background />

          <View
            style={{
              height: 50,
              marginTop: safeArea.top,
              justifyContent: "center",
              alignItems: "center",
              marginHorizontal: 20,
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
              <FormattedMessage
                id="signature.modal.confirmtx"
                defaultMessage="Confirm Transaction"
              />
            </Text>
          </View>

          <View style={{ marginHorizontal: 20, flex: 1 }}>
            <View style={{ flexDirection: "row", height: 50 }}>
              {renderTabButton({
                tab: Tab.TransactionDetails,
                label: "Tx Details",
              })}
              {renderTabButton({ tab: Tab.Data, label: "Data" })}
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: 12,
                  borderTopRightRadius: 0,
                }}
              >
                <ScrollView
                  style={{
                    flex: 1,
                    padding: 10,
                    backgroundColor: "#130F23",
                    marginBottom: 10,
                    borderTopRightRadius:
                      selectedTab === Tab.TransactionDetails ? 12 : 0,
                    borderTopLeftRadius: selectedTab === Tab.Data ? 12 : 0,
                  }}
                >
                  {renderTabContent()}
                </ScrollView>
              </View>

              {children}

              <View>
                {cancelable && (
                  <Button
                    flavor="blue"
                    label={intl.formatMessage({
                      id: "signature.modal.cancel",
                      defaultMessage: "Cancel",
                    })}
                    onPress={() => {
                      onCancel();
                    }}
                  />
                )}
                <Button
                  disabled={disabled}
                  flavor="green"
                  label={intl.formatMessage({
                    id: "signature.modal.confirm",
                    defaultMessage: "Confirm",
                  })}
                  style={{
                    marginVertical: 20,
                  }}
                  onPress={() => {
                    onConfirm();
                  }}
                />
              </View>
            </View>
          </View>

          {footer}
        </View>
      </Modal>
    );

    function renderTabButton({ tab, label }: { tab: Tab; label: string }) {
      return (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              setSelectedTab(tab);
            }}
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              borderTopLeftRadius: tab === Tab.TransactionDetails ? 12 : 0,
              borderTopRightRadius: tab === Tab.Data ? 12 : 0,
              backgroundColor: selectedTab === tab ? "#130F23" : "transparent",
            }}
          >
            <Text
              style={{
                color: selectedTab === tab ? "#89F5C2" : "white",
                textDecorationLine: selectedTab === tab ? "underline" : "none",
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    function renderTabContent() {
      switch (selectedTab) {
        case Tab.TransactionDetails:
          return <MessageView messages={messages} />;
        case Tab.Data:
          return (
            <Text style={{ color: "#ffffff" }}>
              {JSON.stringify(messages, null, 2)}
            </Text>
          );
      }
    }
  }
);

interface MessageViewProps {
  messages: readonly AminoMsg[];
}

function MessageView({ messages }: MessageViewProps) {
  if (messages.length === 0) return null;

  return (
    <>
      {messages.map((message, index) => (
        <View
          key={index}
          style={{
            height: 50,
            flexDirection: "row",
            borderBottomColor: "rgba(255,255,255, 0.6)",
            borderBottomWidth: 1,
          }}
        >
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <ArrowUpIcon />
          </View>
          <View
            style={{ flex: 1, justifyContent: "space-around", paddingLeft: 10 }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
              <FormattedMessage
                id="signature.modal.createobiwallet"
                defaultMessage="Create Obi Wallet"
              />
              {/* TODO: handle other message types */}
              {/* {renderDirectMessage(msg)} */}
            </Text>
            <Text style={{ color: "white", opacity: 0.6 }}>
              <FormattedMessage
                id="signature.modal.value"
                defaultMessage="Value"
              />
            </Text>
          </View>
        </View>
      ))}
    </>
  );
}
