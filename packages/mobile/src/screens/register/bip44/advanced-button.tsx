import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { BIP44Option } from "./bip44-option";
import { Button } from "../../../components/button";
import { useStyle } from "../../../styles";
import { registerModal } from "../../../modals/base";
import { CardModal } from "../../../modals/card";
import { Text, View } from "react-native";
import { TextInput } from "../../../components/input";

export const BIP44AdvancedButton: FunctionComponent<{
  bip44Option: BIP44Option;
}> = observer(({ bip44Option }) => {
  const style = useStyle();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <React.Fragment>
      <BIP44SelectModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        bip44Option={bip44Option}
      />
      <Button
        containerStyle={style.flatten(["margin-bottom-16"])}
        text="Advanced"
        mode="text"
        size="small"
        onPress={() => {
          setIsModalOpen(true);
        }}
      />
    </React.Fragment>
  );
});

const useZeroOrPositiveIntegerString = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    setValue: useCallback((text: string) => {
      if (!text) {
        setValue("");
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

export const BIP44SelectModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bip44Option: BIP44Option;
}> = registerModal(
  observer(({ bip44Option, close }) => {
    const style = useStyle();

    const account = useZeroOrPositiveIntegerString(
      bip44Option.account.toString()
    );
    const change = useZeroOrPositiveIntegerString(
      bip44Option.change.toString()
    );
    const index = useZeroOrPositiveIntegerString(bip44Option.index.toString());

    const isChangeZeroOrOne =
      change.isValid && (change.number === 0 || change.number === 1);

    return (
      <CardModal title="HD Derivation Path">
        <Text
          style={style.flatten([
            "body2",
            "color-text-black-medium",
            "margin-bottom-18",
          ])}
        >
          Set custom address derivation path by modifying the indexes below:
        </Text>
        <View
          style={style.flatten([
            "flex-row",
            "items-center",
            "margin-bottom-16",
          ])}
        >
          <Text
            style={style.flatten(["body2", "color-text-black-medium"])}
          >{`m/44’/${bip44Option.coinType ?? "-"}’`}</Text>
          <TextInput
            value={account.value}
            containerStyle={style.flatten(["min-width-58", "padding-bottom-0"])}
            style={style.flatten(["text-right"])}
            keyboardType="number-pad"
            onChangeText={account.setValue}
          />
          <Text>’/</Text>
          <TextInput
            value={change.value}
            containerStyle={style.flatten(["min-width-58", "padding-bottom-0"])}
            style={style.flatten(["text-right"])}
            keyboardType="number-pad"
            onChangeText={change.setValue}
          />
          <Text>/</Text>
          <TextInput
            value={index.value}
            containerStyle={style.flatten(["min-width-58", "padding-bottom-0"])}
            style={style.flatten(["text-right"])}
            keyboardType="number-pad"
            onChangeText={index.setValue}
          />
        </View>
        {change.isValid && !isChangeZeroOrOne ? (
          <Text
            style={style.flatten([
              "text-caption2",
              "color-danger",
              "margin-bottom-8",
            ])}
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
  }),
  {
    disableSafeArea: true,
  }
);
