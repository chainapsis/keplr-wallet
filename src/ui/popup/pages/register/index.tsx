import React, { FunctionComponent, useCallback, useState } from "react";

import { EmptyLayout } from "../../layouts/empty-layout";

import { RegisterInPage } from "./register";
import { VerifyInPage } from "./verify";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { IntroInPage } from "./intro";

import style from "./style.module.scss";
import { KeyRingStatus } from "../../../../background/keyring";
import { Button } from "../../../components/button";
import { KeyRingStore } from "../../stores/keyring";
import { WelcomeInPage } from "./welcome";
import { FormattedMessage } from "react-intl";

enum RegisterState {
  INIT,
  REGISTER,
  RECOVER,
  VERIFY
}

export const RegisterPage: FunctionComponent = observer(() => {
  const [state, setState] = useState<RegisterState>(RegisterState.INIT);
  const [accountIsCreating, setAccountIsCreating] = useState(false);
  const [words, setWords] = useState("");
  const [password, setPassword] = useState("");

  const { keyRingStore } = useStore();

  const register = useCallback(
    async (words: string, password: string) => {
      setAccountIsCreating(true);
      try {
        await keyRingStore.createKey(words, password);
        await keyRingStore.save();
      } finally {
        setAccountIsCreating(false);
      }
    },
    [keyRingStore]
  );

  const onRegister = useCallback(
    (_words: string, password: string, recovered: boolean): void => {
      if (!recovered) {
        if (words !== _words) {
          throw new Error("Unexpected error");
        }
        setPassword(password);
        setState(RegisterState.VERIFY);
      } else {
        register(_words, password);
      }
    },
    [register, words]
  );

  const generateMnemonic = useCallback(() => {
    setWords(KeyRingStore.GenereateMnemonic(128));
  }, []);

  const onVerify = useCallback(
    async (_words: string) => {
      if (words !== _words) {
        throw new Error("Unexpected error");
      }
      await register(_words, password);
    },
    [register, password, words]
  );

  const onBackToInit = useCallback(() => {
    setState(RegisterState.INIT);
  }, []);

  const onBackToRegister = useCallback(() => {
    setState(RegisterState.REGISTER);
  }, []);

  return (
    <EmptyLayout
      className={style.container}
      style={{ height: "100%", backgroundColor: "white", padding: 0 }}
    >
      <div>
        <img
          className={style.logo}
          src={require("../../public/assets/logo-temp.png")}
        />
      </div>
      {keyRingStore.status !== KeyRingStatus.NOTLOADED &&
      keyRingStore.status !== KeyRingStatus.EMPTY ? (
        <WelcomeInPage />
      ) : null}
      {keyRingStore.status === KeyRingStatus.EMPTY &&
      state === RegisterState.INIT ? (
        <IntroInPage
          onRequestNewAccount={() => {
            generateMnemonic();
            setState(RegisterState.REGISTER);
          }}
          onRequestRecoverAccount={() => {
            setState(RegisterState.RECOVER);
          }}
        />
      ) : null}
      {keyRingStore.status === KeyRingStatus.EMPTY &&
      state === RegisterState.REGISTER ? (
        <>
          <RegisterInPage
            onRegister={onRegister}
            words={words}
            isRecover={false}
            isLoading={accountIsCreating}
          />
          <div className={style.backButton}>
            <Button className="is-white" onClick={onBackToInit}>
              <span className="icon">
                <i className="fas fa-angle-left" />
              </span>
              <span>
                <FormattedMessage id="register.button.back" />
              </span>
            </Button>
          </div>
        </>
      ) : null}
      {keyRingStore.status === KeyRingStatus.EMPTY &&
      state === RegisterState.RECOVER ? (
        <>
          <RegisterInPage
            onRegister={onRegister}
            words={words}
            isRecover={true}
            isLoading={accountIsCreating}
          />
          <div className={style.backButton}>
            <Button className="is-white" onClick={onBackToInit}>
              <span className="icon">
                <i className="fas fa-angle-left" />
              </span>
              <FormattedMessage id="register.button.back" />
            </Button>
          </div>
        </>
      ) : null}
      {keyRingStore.status === KeyRingStatus.EMPTY &&
      state === RegisterState.VERIFY ? (
        <>
          <VerifyInPage
            words={words}
            onVerify={onVerify}
            isLoading={accountIsCreating}
          />
          <div className={style.backButton}>
            <Button className="is-white" onClick={onBackToRegister}>
              <span className="icon">
                <i className="fas fa-angle-left" />
              </span>
              <FormattedMessage id="register.button.back" />
            </Button>
          </div>
        </>
      ) : null}
    </EmptyLayout>
  );
});
