import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { BIP44Option } from "./bip44-option";
import { Button } from "components/button";
import { useStyle } from "styles/index";
import { CardModal } from "modals/card";
import { Text, View, ViewStyle } from "react-native";
import { InputCardView } from "components/new/card-view/input-card";

const useZeroOrPositiveIntegerString = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    setValue: useCallback((text: string) => {
      if (!text) {
        setValue("0");
        return;
      }

      const num = Number.parseInt(text);
      if (!Number.isNaN(num) && num >= 0) {
        setValue(num.toString());
      }
    }, []),
    isValid: useMemo(() => {
      if (!value) {
        return false;
      }

      const num = Number.parseInt(value);
      return !Number.isNaN(num) && num >= 0;
    }, [value]),
    number: useMemo(() => {
      return Number.parseInt(value);
    }, [value]),
  };
};

export const BIP44AdvancedButton: FunctionComponent<{
  bip44Option: BIP44Option;
  containerStyle?: ViewStyle;
  selected: boolean;
}> = observer(({ bip44Option, selected }) => {
  const style = useStyle();

  // const [isModalOpen, setIsModalOpen] = useState(false);

  // const account = useZeroOrPositiveIntegerString(
  //   bip44Option.account.toString()
  // );
  const change = useZeroOrPositiveIntegerString(bip44Option.change.toString());
  // const index = useZeroOrPositiveIntegerString(bip44Option.index.toString());

  const isChangeZeroOrOne =
    change.isValid && (change.number === 0 || change.number === 1);

  return (
    <React.Fragment>
      {selected ? (
        <React.Fragment>
          <Text
            style={
              style.flatten([
                "body2",
                "color-gray-200",
                "font-medium",
                "margin-bottom-18",
              ]) as ViewStyle
            }
          >
            HD Derivation Path
          </Text>
          <View
            style={
              style.flatten([
                "flex-row",
                "items-center",
                "margin-bottom-16",
              ]) as ViewStyle
            }
          >
            <Text
              style={
                style.flatten([
                  "body2",
                  "color-white",
                  "margin-right-4",
                ]) as ViewStyle
              }
            >{`m/44’/${bip44Option.coinType ?? "···"}’/`}</Text>
            <InputCardView
              value={bip44Option.account.toString()}
              containerStyle={style.flatten(["min-width-72"]) as ViewStyle}
              keyboardType="number-pad"
              onChangeText={(value: string) => {
                if (value) {
                  if (value !== "0") {
                    // Remove leading zeros
                    for (let i = 0; i < value.length; i++) {
                      if (value[i] === "0") {
                        value = value.replace("0", "");
                      } else {
                        break;
                      }
                    }
                  }
                  const parsed = parseFloat(value);
                  // Should be integer and positive.
                  if (Number.isInteger(parsed) && parsed >= 0) {
                    bip44Option.setAccount(parsed);
                  }
                } else {
                  bip44Option.setAccount(0);
                }
              }}
            />
            <Text
              style={style.flatten(["color-white", "margin-x-4"]) as ViewStyle}
            >
              ’/
            </Text>
            <InputCardView
              value={bip44Option.change.toString()}
              containerStyle={style.flatten(["min-width-72"]) as ViewStyle}
              keyboardType="number-pad"
              onChangeText={(value: string) => {
                if (value) {
                  if (value !== "0") {
                    // Remove leading zeros
                    for (let i = 0; i < value.length; i++) {
                      if (value[i] === "0") {
                        value = value.replace("0", "");
                      } else {
                        break;
                      }
                    }
                  }
                  const parsed = parseFloat(value);
                  // Should be integer and positive.
                  if (
                    Number.isInteger(parsed) &&
                    (parsed === 0 || parsed === 1)
                  ) {
                    bip44Option.setChange(parsed);
                  }
                } else {
                  bip44Option.setChange(0);
                }
              }}
            />
            <Text
              style={style.flatten(["color-white", "margin-x-4"]) as ViewStyle}
            >
              /
            </Text>
            <InputCardView
              value={bip44Option.index.toString()}
              containerStyle={style.flatten(["min-width-72"]) as ViewStyle}
              keyboardType="number-pad"
              onChangeText={(value: string) => {
                if (value) {
                  if (value !== "0") {
                    // Remove leading zeros
                    for (let i = 0; i < value.length; i++) {
                      if (value[i] === "0") {
                        value = value.replace("0", "");
                      } else {
                        break;
                      }
                    }
                  }
                  const parsed = parseFloat(value);
                  // Should be integer and positive.
                  if (Number.isInteger(parsed) && parsed >= 0) {
                    bip44Option.setIndex(parsed);
                  }
                } else {
                  bip44Option.setIndex(0);
                }
              }}
            />
          </View>
          {change.isValid && !isChangeZeroOrOne ? (
            <Text
              style={
                style.flatten([
                  "text-caption2",
                  "color-red-250",
                  "margin-bottom-8",
                ]) as ViewStyle
              }
            >
              Change should be 0 or 1
            </Text>
          ) : null}
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
});

export const BIP44SelectModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bip44Option: BIP44Option;
}> = observer(({ isOpen, bip44Option, close }) => {
  const style = useStyle();

  const account = useZeroOrPositiveIntegerString(
    bip44Option.account.toString()
  );
  const change = useZeroOrPositiveIntegerString(bip44Option.change.toString());
  const index = useZeroOrPositiveIntegerString(bip44Option.index.toString());

  const isChangeZeroOrOne =
    change.isValid && (change.number === 0 || change.number === 1);

  return (
    <CardModal isOpen={isOpen} title="HD Derivation Path">
      <Text
        style={
          style.flatten([
            "body2",
            "color-gray-200",
            "font-medium",
            "margin-bottom-18",
          ]) as ViewStyle
        }
      >
        HD Derivation Path
      </Text>
      <View
        style={
          style.flatten([
            "flex-row",
            "items-center",
            "margin-bottom-16",
          ]) as ViewStyle
        }
      >
        <Text style={style.flatten(["body2", "color-white"])}>{`m/44’/${
          bip44Option.coinType ?? "···"
        }’/ `}</Text>
        <InputCardView
          value={account.value}
          containerStyle={style.flatten(["min-width-72"]) as ViewStyle}
          keyboardType="number-pad"
          onChangeText={account.setValue}
        />
        <Text style={style.flatten(["color-white"])}> ’/ </Text>
        <InputCardView
          value={account.value}
          containerStyle={style.flatten(["min-width-72"]) as ViewStyle}
          keyboardType="number-pad"
          onChangeText={account.setValue}
        />
        <Text style={style.flatten(["color-white"])}> / </Text>
        <InputCardView
          value={account.value}
          containerStyle={style.flatten(["min-width-72"]) as ViewStyle}
          keyboardType="number-pad"
          onChangeText={account.setValue}
        />
      </View>
      {change.isValid && !isChangeZeroOrOne ? (
        <Text
          style={
            style.flatten([
              "text-caption2",
              "color-red-250",
              "margin-bottom-8",
            ]) as ViewStyle
          }
        >
          Change should be 0 or 1
        </Text>
      ) : null}
      <Button
        text="Confirm"
        size="large"
        disabled={
          !account.isValid ||
          !change.isValid ||
          !index.isValid ||
          !isChangeZeroOrOne
        }
        onPress={() => {
          bip44Option.setAccount(account.number);
          bip44Option.setChange(change.number);
          bip44Option.setIndex(index.number);

          close();
        }}
      />
    </CardModal>
  );
});
