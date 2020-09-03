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
import { FormattedMessage, useIntl } from "react-intl";

export const LedgerGrantPage: FunctionComponent = () => {
  useEffect(() => {
    disableScroll();
    fitWindow();
  }, []);

  const intl = useIntl();

  const [signCompleted, setSignCompleted] = useState(false);
  const [signRejected, setSignRejected] = useState(false);

  useEffect(() => {
    const closeAfterDelay = (e: CustomEvent) => {
      setSignCompleted(true);
      if (e.detail?.rejected) {
        setSignRejected(true);
      }
      // Close window after 3 seconds.
      setTimeout(window.close, 3000);
    };

    window.addEventListener("ledgerSignCompleted", closeAfterDelay as any);
    // Don't need to delay to close because this event probably occurs only in the register page in tab.
    // So, don't need to consider the window refocusing.
    window.addEventListener("ledgerGetPublickKeyCompleted", window.close);

    return () => {
      window.removeEventListener("ledgerSignCompleted", closeAfterDelay as any);
      window.removeEventListener("ledgerGetPublickKeyCompleted", window.close);
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
      {signCompleted ? (
        <SignCompleteDialog rejected={signRejected} />
      ) : initSucceed ? (
        <ConfirmLedgerDialog />
      ) : (
        <div className={style.instructions}>
          <Instruction
            icon={
              <img
                src={require(".././../public/assets/img/icons8-usb-2.svg")}
                style={{ height: "50px" }}
                alt="usb"
              />
            }
            title={intl.formatMessage({ id: "ledger.step1" })}
            paragraph={intl.formatMessage({ id: "ledger.step1.paragraph" })}
            pass={initTryCount > 0 && initErrorOn === LedgerInitErrorOn.App}
          />
          <Instruction
            icon={
              <img
                src={require(".././../public/assets/img/atom-o.svg")}
                style={{ height: "34px" }}
                alt="atom"
              />
            }
            title={intl.formatMessage({ id: "ledger.step2" })}
            paragraph={intl.formatMessage({ id: "ledger.step2.paragraph" })}
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
            <FormattedMessage id="ledger.button.next" />
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
      <p>
        <FormattedMessage id="ledger.confirm.waiting.paragraph" />
      </p>
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

const SignCompleteDialog: FunctionComponent<{
  rejected: boolean;
}> = ({ rejected }) => {
  const intl = useIntl();

  return (
    <div className={style.signCompleteDialog}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end"
        }}
      >
        {!rejected ? (
          <img
            src={require("../../public/assets/img/icons8-checked.svg")}
            alt="success"
          />
        ) : (
          <img
            src={require("../../public/assets/img/icons8-cancel.svg")}
            alt="rejected"
          />
        )}
      </div>
      <p>
        {!rejected
          ? intl.formatMessage({ id: "ledger.confirm.success" })
          : intl.formatMessage({ id: "ledger.confirm.rejected" })}
      </p>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start"
        }}
      >
        <div className={style.subParagraph}>
          {!rejected
            ? intl.formatMessage({ id: "ledger.confirm.success.paragraph" })
            : intl.formatMessage({ id: "ledger.confirm.rejected.paragraph" })}
        </div>
      </div>
    </div>
  );
};

const Instruction: FunctionComponent<{
  icon: React.ReactElement;
  title: string;
  paragraph: string;
  pass: boolean;
}> = ({ icon, title, paragraph, children, pass }) => {
  return (
    <div className={classnames(style.instruction, { [style.pass]: pass })}>
      <div className={style.icon}>{icon}</div>
      <div className={style.inner}>
        <h1>
          {title}
          {pass ? (
            <i
              className="fas fa-check"
              style={{ marginLeft: "10px", color: "#2dce89" }}
            />
          ) : null}
        </h1>
        <p>{paragraph}</p>
        {children}
      </div>
    </div>
  );
};
