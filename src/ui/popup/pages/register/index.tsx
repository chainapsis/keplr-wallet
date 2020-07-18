import React, { FunctionComponent, useCallback, useState } from "react";

import { EmptyLayout } from "../../layouts/empty-layout";

import { RegisterInPage } from "./register";
import { VerifyInPage } from "./verify";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { IntroInPage } from "./intro";

import style from "./style.module.scss";
import { KeyRingStatus } from "../../../../background/keyring";

import { Button } from "reactstrap";

import { KeyRingStore } from "../../stores/keyring";
import { WelcomeInPage } from "./welcome";
import { FormattedMessage } from "react-intl";

enum RegisterState {
  INIT,
  REGISTER,
  RECOVER,
  VERIFY
}

export enum NunWords {
  WORDS12,
  WORDS24
}

const BackButton: FunctionComponent<{ onClick: () => void }> = ({
  onClick
}) => {
  return (
    <div className={style.backButton}>
      <Button color="link" onClick={onClick}>
        <i className="fas fa-angle-left" style={{ marginRight: "8px" }} />
        <FormattedMessage id="register.button.back" />
      </Button>
    </div>
  );
};

export const RegisterPage: FunctionComponent = observer(() => {
  const [state, setState] = useState<RegisterState>(RegisterState.INIT);
  const [accountIsCreating, setAccountIsCreating] = useState(false);
  const [words, setWords] = useState("");
  const [numWords, setNumWords] = useState<NunWords>(NunWords.WORDS12);
  const [password, setPassword] = useState("");

  const { keyRingStore } = useStore();

  const register = useCallback(
    async (words: string, password: string) => {
      setAccountIsCreating(true);
      try {
        await keyRingStore.createMnemonicKey(words, password);
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

  const generateMnemonic = useCallback((numWords: NunWords) => {
    switch (numWords) {
      case NunWords.WORDS12:
        setWords(KeyRingStore.GenereateMnemonic(128));
        break;
      case NunWords.WORDS24:
        setWords(KeyRingStore.GenereateMnemonic(256));
        break;
      default:
        throw new Error("Invalid num words");
    }
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
      <div className={style.logoContainer}>
        <img
          className={style.icon}
          src={require("../../public/assets/temp-icon.svg")}
          alt="logo"
        />
        <div className={style.logoInnerContainer}>
          <img
            className={style.logo}
            src={require("../../public/assets/logo-temp.png")}
            alt="logo"
          />
          <div className={style.paragraph}>Wallet for the Interchain</div>
        </div>
      </div>
      {keyRingStore.status !== KeyRingStatus.NOTLOADED &&
      keyRingStore.status !== KeyRingStatus.EMPTY ? (
        <WelcomeInPage />
      ) : null}
      {keyRingStore.status === KeyRingStatus.EMPTY &&
      state === RegisterState.INIT ? (
        <IntroInPage
          onRequestNewAccount={() => {
            generateMnemonic(numWords);
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
            requestChaneNumWords={numWords => {
              setNumWords(numWords);
              generateMnemonic(numWords);
            }}
            numWords={numWords}
            words={words}
            isRecover={false}
            isLoading={accountIsCreating}
          />
          <BackButton onClick={onBackToInit} />
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
          <BackButton onClick={onBackToInit} />
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
          <BackButton onClick={onBackToRegister} />
        </>
      ) : null}
    </EmptyLayout>
  );
});
