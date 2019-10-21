import React, { FunctionComponent, useState, useEffect } from "react";

import { Button } from "../../../components/button";

import { KeyRingStore } from "../../stores/keyring";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

import style from "./style.scss";

export const RegisterPage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const [words, setWords] = useState("");
  const [password, setPassword] = useState("");
  const [isRecover, setIsRecover] = useState(false);

  useEffect(() => {
    setWords(KeyRingStore.GenereateMnemonic());
  }, []);

  const onClickNextButton = async () => {
    // TODO: Check mnemonic checksum.
    await keyRingStore.createKey(words, password);
    await keyRingStore.save();
  };

  return (
    <div className={style.container}>
      <textarea
        className="textarea"
        disabled={!isRecover}
        value={words}
        onChange={e => {
          setWords(e.target.value);
        }}
      />
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
      <Button
        className={style.btnNext}
        onClick={() => {
          setIsRecover(!isRecover);
        }}
      >
        Recover
      </Button>
    </div>
  );
});
