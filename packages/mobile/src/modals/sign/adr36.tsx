import React, { FunctionComponent, useMemo } from "react";
import { registerModal } from "../base";
import { observer } from "mobx-react-lite";
import { CardModal } from "../card";
import { Button } from "../../components/button";
import { useStore } from "../../stores";
import { useUnmount } from "../../hooks";
import { ScrollView, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { checkAndValidateADR36AminoSignDoc } from "@keplr-wallet/cosmos";

export const ADR36SignModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const style = useStyle();

    const { chainStore, signInteractionStore } = useStore();
    useUnmount(() => {
      signInteractionStore.rejectAll();
    });

    if (
      signInteractionStore.waitingData &&
      !signInteractionStore.waitingData.data.signDocWrapper.isADR36SignDoc
    ) {
      throw new Error("Sign doc is not for adr36");
    }

    const signDocWrapper =
      signInteractionStore.waitingData?.data.signDocWrapper;
    const isADR36WithString =
      signInteractionStore.waitingData?.data.isADR36WithString === true;
    const content: {
      value: string;
      isJSON: boolean;
    } = useMemo(() => {
      if (!signDocWrapper) {
        return {
          value: "",
          isJSON: false,
        };
      }

      if (signDocWrapper.aminoSignDoc.msgs.length !== 1) {
        throw new Error("Sign doc is improper ADR-36");
      }

      const msg = signDocWrapper.aminoSignDoc.msgs[0];
      if (msg.type !== "sign/MsgSignData") {
        throw new Error("Sign doc is improper ADR-36");
      }

      if (isADR36WithString) {
        const str = Buffer.from(msg.value.data, "base64").toString();

        try {
          // In case of json, it is displayed more easily to read.
          return {
            value: JSON.stringify(JSON.parse(str), null, 2),
            isJSON: true,
          };
        } catch {
          return {
            value: str,
            isJSON: false,
          };
        }
      } else {
        return {
          value: msg.value.data as string,
          isJSON: false,
        };
      }
    }, [isADR36WithString, signDocWrapper]);

    return (
      <CardModal>
        <View
          style={style.flatten([
            "flex-row",
            "items-center",
            "margin-bottom-16",
          ])}
        >
          <Text style={style.flatten(["h4", "color-text-highest"])}>
            Prove Ownership
          </Text>
        </View>

        <View style={style.flatten(["margin-bottom-16"])}>
          <View style={style.flatten(["border-radius-8", "overflow-hidden"])}>
            <ScrollView
              style={style.flatten([
                "max-height-214",
                "background-color-white",
                "dark:background-color-platinum-500",
              ])}
              persistentScrollbar={true}
              indicatorStyle={style.theme === "dark" ? "white" : "black"}
            >
              <Text
                style={style.flatten([
                  "body2",
                  "color-text-middle",
                  "padding-16",
                ])}
              >
                {content.value}
              </Text>
            </ScrollView>
          </View>
        </View>

        {signInteractionStore.waitingData ? (
          <View style={style.flatten(["margin-bottom-16"])}>
            <View
              style={style.flatten([
                "flex",
                "flex-row",
                "items-center",
                "justify-center",
                "border-radius-8",
                "background-color-white",
                "dark:background-color-platinum-500",
              ])}
            >
              <Text
                style={style.flatten([
                  "body2",
                  "color-text-middle",
                  "padding-16",
                ])}
              >
                Requested Network
              </Text>

              <View style={style.flatten(["flex-1"])} />

              <Text
                style={style.flatten([
                  "body2",
                  "color-text-high",
                  "padding-16",
                ])}
              >
                {
                  chainStore.getChain(
                    signInteractionStore.waitingData.data.chainId
                  ).chainName
                }
              </Text>
            </View>
          </View>
        ) : null}

        <Button
          text="Approve"
          size="large"
          disabled={signInteractionStore.waitingData === undefined}
          loading={signInteractionStore.isLoading}
          onPress={async () => {
            if (signInteractionStore.waitingData) {
              const signDocWrapper =
                signInteractionStore.waitingData.data.signDocWrapper;

              if (
                signDocWrapper.mode !== "amino" ||
                !checkAndValidateADR36AminoSignDoc(
                  signDocWrapper.aminoSignDoc,
                  chainStore.getChain(
                    signInteractionStore.waitingData.data.chainId
                  ).bech32Config.bech32PrefixAccAddr
                )
              ) {
                throw new Error("Invalid sign doc for adr36");
              }

              try {
                await signInteractionStore.approveAndWaitEnd(signDocWrapper);
              } catch (e) {
                console.log(e);
              }
            }
          }}
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
    blurBackdropOnIOS: true,
  }
);
