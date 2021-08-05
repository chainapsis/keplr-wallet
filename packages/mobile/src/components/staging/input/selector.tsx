import React, { FunctionComponent, useMemo, useState } from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";
import { RectButton } from "react-native-gesture-handler";
import { registerModal } from "../../../modals/staging/base";

export const SelectorModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  items: {
    label: string;
    key: string;
  }[];
  selectedKey: string | undefined;
  setSelectedKey: (key: string | undefined) => void;
  modalPersistent?: boolean;
}> = registerModal(
  ({ close, items, selectedKey, setSelectedKey, modalPersistent }) => {
    const style = useStyle();

    const renderBall = (selected: boolean) => {
      if (selected) {
        return (
          <View
            style={style.flatten([
              "width-24",
              "height-24",
              "border-radius-32",
              "background-color-primary",
              "items-center",
              "justify-center",
            ])}
          >
            <View
              style={style.flatten([
                "width-12",
                "height-12",
                "border-radius-32",
                "background-color-white",
              ])}
            />
          </View>
        );
      } else {
        return (
          <View
            style={style.flatten([
              "width-24",
              "height-24",
              "border-radius-32",
              "background-color-white",
              "border-width-1",
              "border-color-text-black-very-low",
            ])}
          />
        );
      }
    };

    return (
      <View style={style.flatten(["padding-page"])}>
        <View
          style={style.flatten([
            "border-radius-8",
            "overflow-hidden",
            "background-color-white",
          ])}
        >
          {items.map((item) => {
            return (
              <RectButton
                key={item.key}
                style={style.flatten(
                  [
                    "height-64",
                    "padding-left-36",
                    "padding-right-28",
                    "flex-row",
                    "items-center",
                    "justify-between",
                  ],
                  [item.key === selectedKey && "background-color-primary-10"]
                )}
                onPress={() => {
                  setSelectedKey(item.key);
                  if (!modalPersistent) {
                    close();
                  }
                }}
              >
                <Text
                  style={style.flatten([
                    "subtitle1",
                    "color-text-black-medium",
                  ])}
                >
                  {item.label}
                </Text>
                {renderBall(item.key === selectedKey)}
              </RectButton>
            );
          })}
        </View>
      </View>
    );
  }
);

export const Selector: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  selectorContainerStyle?: ViewStyle;
  textStyle?: TextStyle;

  label: string;
  placeHolder?: string;

  items: {
    label: string;
    key: string;
  }[];

  selectedKey: string | undefined;
  setSelectedKey: (key: string | undefined) => void;

  modalPersistent?: boolean;
}> = ({
  containerStyle,
  labelStyle,
  selectorContainerStyle,
  textStyle,
  label,
  placeHolder,
  items,
  selectedKey,
  setSelectedKey,
  modalPersistent,
}) => {
  const style = useStyle();

  const selected = useMemo(() => {
    return items.find((item) => item.key === selectedKey);
  }, [items, selectedKey]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    backgroundColor: selectorContainerStyleBackgroundColor,
    ...selectorContainerStyleObj
  } = StyleSheet.flatten([
    style.flatten([
      "background-color-white",
      "padding-x-11",
      "padding-y-12",
      "border-radius-4",
      "border-width-1",
      "border-color-border-white",
    ]),
    selectorContainerStyle,
  ]);

  return (
    <React.Fragment>
      <SelectorModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        items={items}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        modalPersistent={modalPersistent}
      />
      <View
        style={StyleSheet.flatten([
          style.flatten(["padding-bottom-16"]),
          containerStyle,
        ])}
      >
        <Text
          style={StyleSheet.flatten([
            style.flatten([
              "subtitle2",
              "color-text-black-medium",
              "margin-bottom-3",
            ]),
            labelStyle,
          ])}
        >
          {label}
        </Text>
        <RectButton
          style={StyleSheet.flatten([
            style.flatten(["overflow-hidden"]),
            {
              backgroundColor: selectorContainerStyleBackgroundColor,
              borderRadius: selectorContainerStyleObj.borderRadius,
            },
          ])}
          onPress={() => setIsModalOpen(true)}
        >
          <View style={selectorContainerStyleObj}>
            <Text
              style={StyleSheet.flatten([
                style.flatten([
                  "body2",
                  "color-text-black-medium",
                  "padding-0",
                ]),
                textStyle,
              ])}
            >
              {selected ? selected.label : placeHolder ?? ""}
            </Text>
          </View>
        </RectButton>
      </View>
    </React.Fragment>
  );
};
