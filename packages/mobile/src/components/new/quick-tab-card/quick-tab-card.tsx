import React, { FunctionComponent } from "react";
import { CardModal } from "modals/card";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { IconButton } from "components/new/button/icon";
import { RectButton } from "components/rect-button";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { ArrowUpIcon } from "../icon/arrow-up";
import { ArrowDownIcon } from "../icon/arrow-down";
import { NewBridgeIcon } from "../icon/new-bridge-icon";
import { Button } from "components/button";

export enum QuickTabOptions {
  receive,
  send,
  earn,
  bridge,
}

export const QuickTabOptionModel: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  onPress: (event: QuickTabOptions) => void;
}> = ({ close, isOpen, onPress }) => {
  const style = useStyle();

  if (!isOpen) {
    return null;
  }

  return (
    <CardModal
      isOpen={isOpen}
      cardStyle={style.flatten([]) as ViewStyle}
      disableGesture={true}
      close={() => close()}
    >
      <View style={style.flatten([]) as ViewStyle}>
        <BlurBackground
          borderRadius={12}
          blurIntensity={15}
          containerStyle={style.flatten(["margin-bottom-4"]) as ViewStyle}
        >
          <RectButton
            onPress={() => {
              close();
              onPress(QuickTabOptions.send);
            }}
            style={
              style.flatten([
                "border-radius-12",
                "flex-row",
                "items-center",
                "padding-y-18",
                "padding-x-12",
              ]) as ViewStyle
            }
            activeOpacity={0.5}
            underlayColor={style.flatten(["color-gray-50"]).color}
          >
            <IconButton
              backgroundBlur={false}
              icon={<ArrowUpIcon />}
              iconStyle={style.flatten(["padding-0"]) as ViewStyle}
            />
            <Text
              style={
                style.flatten([
                  "body2",
                  "color-white",
                  "margin-left-18",
                ]) as ViewStyle
              }
            >
              Send
            </Text>
          </RectButton>
        </BlurBackground>
        <BlurBackground
          borderRadius={12}
          blurIntensity={15}
          containerStyle={style.flatten(["margin-bottom-4"]) as ViewStyle}
        >
          <RectButton
            onPress={() => {
              close();
              onPress(QuickTabOptions.receive);
            }}
            style={
              style.flatten([
                "border-radius-12",
                "flex-row",
                "items-center",
                "padding-y-18",
                "padding-x-12",
              ]) as ViewStyle
            }
            activeOpacity={0.5}
            underlayColor={style.flatten(["color-gray-50"]).color}
          >
            <IconButton
              backgroundBlur={false}
              icon={<ArrowDownIcon />}
              iconStyle={style.flatten(["padding-0"]) as ViewStyle}
            />
            <Text
              style={
                style.flatten([
                  "body2",
                  "color-white",
                  "margin-left-18",
                ]) as ViewStyle
              }
            >
              Receive
            </Text>
          </RectButton>
        </BlurBackground>
        {/* <BlurBackground
          borderRadius={12}
          blurIntensity={15}
          containerStyle={style.flatten(["margin-bottom-8"]) as ViewStyle}
        >
          <RectButton
            style={
              style.flatten([
                "border-radius-12",
                "flex-row",
                "items-center",
                "padding-18",
                "justify-between",
              ]) as ViewStyle
            }
            activeOpacity={1}
            //   underlayColor={style.flatten(["color-gray-50"]).color}
            rippleColor={"rgba(255,255,255,0)"}
          >
            <View
              style={style.flatten(["flex-row", "items-center"]) as ViewStyle}
            >
              <IconButton
                backgroundBlur={false}
                icon={<StakeIcon color="#64646D" />}
                iconStyle={style.flatten(["padding-0"]) as ViewStyle}
              />
              <Text
                style={
                  style.flatten([
                    "body2",
                    "color-gray-400",
                    "margin-left-18",
                  ]) as ViewStyle
                }
              >
                Earn
              </Text>
            </View>
            <Button
              text="COMING SOON"
              size="small"
              rippleColor={"rgba(255,255,255,0)"}
              containerStyle={
                style.flatten([
                  "background-color-indigo",
                  "border-radius-4",
                  "height-24",
                ]) as ViewStyle
              }
              textStyle={style.flatten([
                "text-caption2",
                "color-white",
                "font-bold",
              ])}
            />
          </RectButton>
        </BlurBackground> */}
        <BlurBackground
          borderRadius={12}
          blurIntensity={15}
          containerStyle={style.flatten(["margin-bottom-4"]) as ViewStyle}
        >
          <RectButton
            style={
              style.flatten([
                "border-radius-12",
                "flex-row",
                "items-center",
                "padding-y-18",
                "padding-x-12",
                "justify-between",
              ]) as ViewStyle
            }
            activeOpacity={1}
            //   underlayColor={style.flatten(["color-gray-50"]).color}
            rippleColor={"rgba(255,255,255,0)"}
          >
            <View
              style={style.flatten(["flex-row", "items-center"]) as ViewStyle}
            >
              <IconButton
                backgroundBlur={false}
                icon={<NewBridgeIcon color={"#64646D"} />}
                iconStyle={style.flatten(["padding-0"]) as ViewStyle}
              />
              <Text
                style={
                  style.flatten([
                    "body2",
                    "color-gray-400",
                    "margin-left-18",
                  ]) as ViewStyle
                }
              >
                Bridge
              </Text>
            </View>
            <Button
              text="COMING SOON"
              size="small"
              rippleColor={"rgba(255,255,255,0)"}
              containerStyle={
                style.flatten([
                  "background-color-indigo",
                  "border-radius-4",
                  "height-24",
                ]) as ViewStyle
              }
              textStyle={style.flatten([
                "text-caption2",
                "color-white",
                "font-bold",
              ])}
            />
          </RectButton>
        </BlurBackground>
      </View>
    </CardModal>
  );
};
