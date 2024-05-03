import React, { FunctionComponent } from "react";
import { CardModal } from "modals/card";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { IconButton } from "components/new/button/icon";
import { LayerGroupIcon } from "../icon/layer-group";
import { EditIcon } from "../icon/edit";
import { DeleteIcon } from "../icon/color-delete";
import { RectButton } from "components/rect-button";
import { PlusIcon } from "../../icon";
import { BlurBackground } from "components/new/blur-background/blur-background";

export enum ManageWalletOption {
  addNewWallet,
  changeWallet,
  renameWallet,
  deleteWallet,
}

export const WalletCardModel: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  accountName: string;
  onSelectWallet: (option: ManageWalletOption) => void;
}> = ({ close, title, isOpen, onSelectWallet, accountName }) => {
  const style = useStyle();

  if (!isOpen) {
    return null;
  }

  return (
    <CardModal
      title={title}
      isOpen={isOpen}
      cardStyle={style.flatten(["padding-bottom-12"]) as ViewStyle}
      disableGesture={true}
      close={() => close()}
    >
      <View style={style.flatten(["margin-y-12"]) as ViewStyle}>
        <BlurBackground
          borderRadius={12}
          blurIntensity={15}
          containerStyle={style.flatten(["margin-bottom-6"]) as ViewStyle}
        >
          <RectButton
            onPress={() => {
              close();
              onSelectWallet(ManageWalletOption.addNewWallet);
            }}
            style={style.flatten(["border-radius-12"]) as ViewStyle}
            activeOpacity={0.5}
            underlayColor={style.flatten(["color-gray-50"]).color}
          >
            <View
              style={
                style.flatten([
                  "flex-row",
                  "items-center",
                  "padding-18",
                ]) as ViewStyle
              }
            >
              <IconButton
                backgroundBlur={false}
                icon={<PlusIcon color={"white"} size={13} />}
                iconStyle={style.flatten(["padding-0"]) as ViewStyle}
              />
              <Text
                style={
                  style.flatten([
                    "body3",
                    "color-white",
                    "margin-left-18",
                  ]) as ViewStyle
                }
              >
                Add new wallet
              </Text>
            </View>
          </RectButton>
        </BlurBackground>
        <BlurBackground
          borderRadius={12}
          blurIntensity={15}
          containerStyle={style.flatten(["margin-bottom-6"]) as ViewStyle}
        >
          <RectButton
            onPress={() => {
              onSelectWallet(ManageWalletOption.changeWallet);
            }}
            style={style.flatten(["border-radius-12"]) as ViewStyle}
            activeOpacity={0.5}
            underlayColor={style.flatten(["color-gray-50"]).color}
          >
            <View
              style={
                style.flatten([
                  "flex-row",
                  "items-center",
                  "padding-18",
                ]) as ViewStyle
              }
            >
              <IconButton
                backgroundBlur={false}
                icon={<LayerGroupIcon size={16} />}
                iconStyle={style.flatten(["padding-0"]) as ViewStyle}
              />
              <Text
                style={
                  style.flatten([
                    "body3",
                    "color-white",
                    "margin-left-18",
                  ]) as ViewStyle
                }
              >
                Change wallet
              </Text>
            </View>
          </RectButton>
        </BlurBackground>
        <BlurBackground
          borderRadius={12}
          blurIntensity={15}
          containerStyle={style.flatten(["margin-bottom-6"]) as ViewStyle}
        >
          <RectButton
            onPress={() => {
              onSelectWallet(ManageWalletOption.renameWallet);
            }}
            style={style.flatten(["border-radius-12"]) as ViewStyle}
            activeOpacity={0.5}
            underlayColor={style.flatten(["color-gray-50"]).color}
          >
            <View
              style={
                style.flatten([
                  "flex-row",
                  "items-center",
                  "padding-18",
                ]) as ViewStyle
              }
            >
              <IconButton
                backgroundBlur={false}
                icon={<EditIcon size={16} />}
                iconStyle={style.flatten(["padding-0"]) as ViewStyle}
              />
              <Text
                style={
                  style.flatten([
                    "body3",
                    "color-white",
                    "margin-left-18",
                  ]) as ViewStyle
                }
              >
                Rename wallet
              </Text>
            </View>
          </RectButton>
        </BlurBackground>
        <BlurBackground
          borderRadius={12}
          blurIntensity={15}
          containerStyle={style.flatten(["margin-bottom-6"]) as ViewStyle}
        >
          <RectButton
            onPress={() => {
              onSelectWallet(ManageWalletOption.deleteWallet);
            }}
            style={style.flatten(["border-radius-12"]) as ViewStyle}
            activeOpacity={0.5}
            underlayColor={style.flatten(["color-gray-50"]).color}
          >
            <View
              style={
                style.flatten([
                  "flex-row",
                  "items-center",
                  "padding-18",
                ]) as ViewStyle
              }
            >
              <IconButton
                backgroundBlur={false}
                icon={<DeleteIcon size={16} />}
                iconStyle={style.flatten(["padding-0"]) as ViewStyle}
              />
              <Text
                style={
                  style.flatten([
                    "body2",
                    "color-white",
                    "margin-left-18",
                    "color-orange-400",
                  ]) as ViewStyle
                }
              >
                {`Delete ${accountName}`}
              </Text>
            </View>
          </RectButton>
        </BlurBackground>
      </View>
    </CardModal>
  );
};
