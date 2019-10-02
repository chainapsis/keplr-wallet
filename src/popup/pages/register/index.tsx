import React, { FunctionComponent, useState, useEffect } from "react";

import { Button } from "../../components/button";

import { KeyRing } from "../../stores/keyring";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

import style from "./style.scss";

export const RegisterPage: FunctionComponent = observer(() => {
  const { keyRing } = useStore();
  const [words, setWords] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setWords(KeyRing.GenereateMnemonic());
  }, []);

  const onClickNextButton = async () => {
    keyRing.setMnemonic(words);
    await keyRing.lock(password);
    keyRing.setMnemonic(words);
    await keyRing.save();
  };

  return (
    <div className={style.container}>
      <div className={style.mnemonic}>{words}</div>
      <form className="pure-form">
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
            }}
          />
        </label>
      </form>
      <div style={{ flex: 1 }} />
      <Button
        className={style.btnNext}
        color="primary"
        onClick={onClickNextButton}
      >
        Next
      </Button>
    </div>
  );
});
