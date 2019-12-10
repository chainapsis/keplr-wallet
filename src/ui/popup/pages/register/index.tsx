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

  const register = useCallback(
    async (words: string, password: string) => {
      await keyRingStore.createKey(words, password);
      await keyRingStore.save();
    },
    [keyRingStore]
  );

  const onRegister = useCallback(
    (words: string, password: string, recovered: boolean): void => {
      setWords(words);
      setPassword(password);
      if (!recovered) {
        setState(RegisterState.VERIFY);
      } else {
        register(words, password);
      }
    },
    [register]
  );

  const onVerify = useCallback(async () => {
    await register(words, password);
  }, [register, password, words]);

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
