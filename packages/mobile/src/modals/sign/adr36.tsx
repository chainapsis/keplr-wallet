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
      <CardModal title="Confirm Transaction">
        <View style={style.flatten(["margin-bottom-16"])}>
          <Text style={style.flatten(["margin-bottom-3"])}>
            <Text style={style.flatten(["subtitle3", "color-text-middle"])}>
              Messages
            </Text>
          </Text>
          <View
            style={style.flatten([
              "border-radius-8",
              "border-width-1",
              "border-color-gray-50",
              "dark:border-color-platinum-400",
              "overflow-hidden",
            ])}
          >
            <ScrollView
              style={style.flatten([
                "max-height-214",
                "background-color-white",
                "dark:background-color-platinum-500",
              ])}
              persistentScrollbar={true}
              indicatorStyle={style.theme === "dark" ? "white" : "black"}
            >
              <Text>{content.value}</Text>
            </ScrollView>
          </View>
        </View>
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
