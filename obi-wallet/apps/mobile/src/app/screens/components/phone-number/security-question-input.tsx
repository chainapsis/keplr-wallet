import { Text, TextInput as OriginalTextInput } from "@obi-wallet/common";
import { ComponentType, Dispatch, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { TextInputProps, View } from "react-native";

import { useSecurityQuestions } from "../../../../config";
import { DropDownPicker } from "../../../drop-down-picker";
import { TextInput } from "../../../text-input";
export type SetStateCallback<S> = (prevState: S) => S;
export type OnSecurityQuestionChange = Dispatch<SetStateCallback<string>>;

export type SecurityQuestionInputProps = {
  securityQuestion: string;
  securityAnswer: string;
  onSecurityAnswerChange: (securityAnswer: string) => void;
  CustomTextInput?: ComponentType<TextInputProps>;
} & (
  | {
      disabled: true;
      onSecurityQuestionChange?: OnSecurityQuestionChange;
    }
  | {
      disabled?: false;
      onSecurityQuestionChange: OnSecurityQuestionChange;
    }
);

export function SecurityQuestionInput({
  disabled,
  securityQuestion,
  onSecurityQuestionChange = () => {
    // noop if disabled
  },
  securityAnswer,
  onSecurityAnswerChange,
  CustomTextInput = OriginalTextInput,
}: SecurityQuestionInputProps) {
  const [dropdownPickerOpen, setDropdownPickerOpen] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState(
    useSecurityQuestions()
  );

  const intl = useIntl();

  return (
    <View style={{ zIndex: 999 }}>
      <Text
        style={{
          color: "#787B9C",
          fontSize: 10,
          textTransform: "uppercase",
          marginTop: 36,
          marginBottom: 12,
        }}
      >
        <FormattedMessage
          id="onboarding2.securityquestion"
          defaultMessage="Security Question"
        />
      </Text>

      <DropDownPicker
        disabled={disabled}
        open={dropdownPickerOpen}
        value={securityQuestion}
        items={securityQuestions}
        setOpen={setDropdownPickerOpen}
        setValue={onSecurityQuestionChange}
        setItems={setSecurityQuestions}
        listMode="SCROLLVIEW"
        scrollViewProps={{
          persistentScrollbar: true,
          showsVerticalScrollIndicator: true,
          indicatorStyle: "white",
        }}
      />

      <TextInput
        label={intl.formatMessage({
          id: "onboarding2.answer",
          defaultMessage: "Answer",
        })}
        placeholder={intl.formatMessage({
          id: "onboarding2.answerlabel",
          defaultMessage: "Type your answer here",
        })}
        style={{ marginTop: 25 }}
        value={securityAnswer}
        onChangeText={onSecurityAnswerChange}
        CustomTextInput={CustomTextInput}
      />
    </View>
  );
}

export function useSecurityQuestionInput() {
  const [securityQuestion, setSecurityQuestion] = useState(
    useSecurityQuestions()[0].value
  );
  const [securityAnswer, setSecurityAnswer] = useState("");

  return {
    securityQuestion,
    setSecurityQuestion,
    securityAnswer,
    setSecurityAnswer,
  };
}
