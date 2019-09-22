import React, { FunctionComponent, useState, useEffect } from "react";

import { Button } from "../../components/button";

import { KeyRing } from "../../stores/keyring";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import style from "./style.scss";

import { RouteComponentProps } from "react-router-dom";

export const RegisterPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    const { keyRing } = useStore();
    const [words, setWords] = useState("");

    useEffect(() => {
      setWords(KeyRing.GenereateMnemonic());
    }, []);

    const onClickNextButton = async () => {
      keyRing.setMnemonic(words);
      await keyRing.save();
      history.replace("/main");
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
  }
);
