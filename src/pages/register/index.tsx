import React, { FunctionComponent, useState, useEffect } from "react";

import { Button } from "../../components/button";

import { KeyRing } from "../../stores/keyring";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import style from "./style.scss";

export const RegisterPage: FunctionComponent = observer(() => {
  const { keyRing } = useStore();
  const [words, setWords] = useState("");

  useEffect(() => {
    setWords(KeyRing.GenereateMnemonic());
  }, []);

  const onClickNextButton = async () => {
    await keyRing.lock("test");
    keyRing.setMnemonic(words);
    await keyRing.save();
  };

  return (
    <div className={style.container}>
      <div className={style.mnemonic}>{words}</div>
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
