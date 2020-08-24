import React, { FunctionComponent, useEffect, useState } from "react";

import { Button } from "reactstrap";

import { LedgerInitResumeMsg } from "../../../../background/ledger/messages";
import { sendMessage } from "../../../../common/message/send";
import { BACKGROUND_PORT } from "../../../../common/message/constant";

import {
  Ledger,
  LedgerInitErrorOn
} from "../../../../background/ledger/ledger";

import style from "./style.module.scss";
import { EmptyLayout } from "../../layouts/empty-layout";
import { disableScroll, fitWindow } from "../../../../common/window";

import classnames from "classnames";

export const LedgerGrantPage: FunctionComponent = () => {
  useEffect(() => {
    disableScroll();
    fitWindow();
  }, []);

  useEffect(() => {
    const close = () => {
      // Close window after 3 seconds.
      setTimeout(window.close, 3000);
    };

    window.addEventListener("ledgerSignCompleted", close);

    return () => {
      window.removeEventListener("ledgerSignCompleted", close);
    };
  }, []);

  const [initTryCount, setInitTryCount] = useState(0);
  const [initErrorOn, setInitErrorOn] = useState<LedgerInitErrorOn | undefined>(
    undefined
  );
  const [tryInitializing, setTryInitializing] = useState(false);
  const [initSucceed, setInitSucceed] = useState(false);

  const tryInit = async () => {
    setInitTryCount(initTryCount + 1);
    setTryInitializing(true);
    let initErrorOn: LedgerInitErrorOn | undefined;

    try {
      const ledger = await Ledger.init();
      await ledger.close();
    } catch (e) {
      console.log(e);
      if (e.errorOn != null) {
        initErrorOn = e.errorOn;
      } else {
        initErrorOn = LedgerInitErrorOn.Unknown;
      }
    }

    setInitErrorOn(initErrorOn);
    setTryInitializing(false);

    if (initErrorOn === undefined) {
      setInitSucceed(true);

      const msg = new LedgerInitResumeMsg();
      await sendMessage(BACKGROUND_PORT, msg);
    }
  };

  return (
    <EmptyLayout className={style.container}>
      {initSucceed ? (
        <ConfirmLedgerDialog />
      ) : (
        <div className={style.instructions}>
          <Instruction
            title="Step 1"
            paragraph="Connect and unlock your Ledger, then grant permission on the browser."
            pass={initTryCount > 0 && initErrorOn === LedgerInitErrorOn.App}
          >
            <Button
              size="sm"
              color="primary"
              onClick={async e => {
                e.preventDefault();
                await tryInit();
              }}
            >
              Grant Permission
            </Button>
          </Instruction>
          <Instruction
            title="Step 2"
            paragraph="Open Cosmos App."
            pass={initTryCount > 0 && initErrorOn == null}
          />
          <div style={{ flex: 1 }} />
          <Button
            color="primary"
            block
            onClick={async e => {
              e.preventDefault();
              await tryInit();
            }}
            data-loading={tryInitializing}
          >
            Next
          </Button>
        </div>
      )}
    </EmptyLayout>
  );
};

const ConfirmLedgerDialog: FunctionComponent = () => {
  return (
    <div className={style.confirmLedgerDialog}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end"
        }}
      >
        <img
          src={require("../../public/assets/img/icons8-pen.svg")}
          alt="pen"
        />
      </div>
      <p>Waiting for confirmation on Ledger device</p>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start"
        }}
      >
        <i className="fa fa-spinner fa-spin fa-2x fa-fw" />
      </div>
    </div>
  );
};

const Instruction: FunctionComponent<{
  title: string;
  paragraph: string;
  pass: boolean;
}> = ({ title, paragraph, children, pass }) => {
  return (
    <div className={classnames(style.instruction, { [style.pass]: pass })}>
      <h1>{title}</h1>
      <p>{paragraph}</p>
      {children}
    </div>
  );
};
