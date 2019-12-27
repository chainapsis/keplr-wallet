import React, { FunctionComponent, useCallback, useState } from "react";

import { EmptyLayout } from "../../layouts/empty-layout";

import { RegisterInPage } from "./register";
import { VerifyInPage } from "./verify";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { IntroInPage } from "./intro";

enum RegisterState {
  INIT,
  REGISTER,
  RECOVER,
  VERIFY
}

export const RegisterPage: FunctionComponent = observer(() => {
  const [state, setState] = useState<RegisterState>(RegisterState.INIT);
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
      {state === RegisterState.INIT ? (
        <IntroInPage
          onRequestNewAccount={() => {
            setState(RegisterState.REGISTER);
          }}
          onRequestRecoverAccount={() => {
            setState(RegisterState.RECOVER);
          }}
        />
      ) : null}
      {state === RegisterState.REGISTER ? (
        <RegisterInPage onRegister={onRegister} isRecover={false} />
      ) : null}
      {state === RegisterState.RECOVER ? (
        <RegisterInPage onRegister={onRegister} isRecover={true} />
      ) : null}
      {state === RegisterState.VERIFY ? (
        <VerifyInPage words={words} onVerify={onVerify} />
      ) : null}
    </EmptyLayout>
  );
});
