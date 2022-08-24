import { Text } from "@obi-wallet/common";
import { Dispatch, useState } from "react";

import { SECURITY_QUESTIONS } from "../../../../config";
import { DropDownPicker } from "../../../drop-down-picker";
import { TextInput } from "../../../text-input";

export type SetStateCallback<S> = (prevState: S) => S;
export type OnSecurityQuestionChange = Dispatch<
  SetStateCallback<string | null>
>;

export type SecurityQuestionInputProps = {
  securityQuestion: string;
  securityAnswer: string;
  onSecurityAnswerChange: (securityAnswer: string) => void;
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
}: SecurityQuestionInputProps) {
  const [dropdownPickerOpen, setDropdownPickerOpen] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState(
    SECURITY_QUESTIONS
  );

  return (
    <>
      <Text
        style={{
          color: "#787B9C",
          fontSize: 10,
          textTransform: "uppercase",
          marginTop: 36,
          marginBottom: 12,
        }}
      >
        Security Question
      </Text>
      <DropDownPicker
        disabled={disabled}
        open={dropdownPickerOpen}
        value={securityQuestion}
        items={securityQuestions}
        setOpen={setDropdownPickerOpen}
        setValue={onSecurityQuestionChange}
        setItems={setSecurityQuestions}
      />

      <TextInput
        label="Answer"
        placeholder="Type your answer here"
        style={{ marginTop: 25 }}
        value={securityAnswer}
        onChangeText={onSecurityAnswerChange}
      />
    </>
  );
}

export function useSecurityQuestionInput() {
  const [securityQuestion, setSecurityQuestion] = useState(
    SECURITY_QUESTIONS[0].value
  );
  const [securityAnswer, setSecurityAnswer] = useState("");

  return {
    securityQuestion,
    setSecurityQuestion,
    securityAnswer,
    setSecurityAnswer,
  };
}
