import React, { FunctionComponent, useCallback, useState } from "react";

import { EmptyLayout } from "../../layouts/empty-layout";

import { RegisterInPage } from "./register";
import { VerifyInPage } from "./verify";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

enum RegisterState {
  INIT,
  REGISTER,
  VERIFY
}

export const RegisterPage: FunctionComponent = observer(() => {
  const [state, setState] = useState<RegisterState>(RegisterState.REGISTER);
  const [words, setWords] = useState("");
  const [password, setPassword] = useState("");

  const { keyRingStore } = useStore();

  const onRegister = useCallback((words: string, password: string): void => {
    setWords(words);
    setPassword(password);
    setState(RegisterState.VERIFY);
  }, []);

  const onVerify = useCallback(async () => {
    await keyRingStore.createKey(words, password);
    await keyRingStore.save();
  }, [keyRingStore, password, words]);

  return (
    <EmptyLayout style={{ height: "100%", backgroundColor: "white" }}>
      {state === RegisterState.INIT ? <div>Not yet implemented</div> : null}
      {state === RegisterState.REGISTER ? (
        <RegisterInPage onRegister={onRegister} />
      ) : null}
      {state === RegisterState.VERIFY ? (
        <VerifyInPage words={words} onVerify={onVerify} />
      ) : null}
    </EmptyLayout>
  );
});
