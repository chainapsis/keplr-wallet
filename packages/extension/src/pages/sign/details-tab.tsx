import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

import styleDetailsTab from "./details-tab.module.scss";
import style from "./style.module.scss";

import { renderAminoMessage } from "./amino";
import { Msg } from "@cosmjs/launchpad";
import { FormattedMessage, useIntl } from "react-intl";
import { FeeButtons, MemoInput } from "../../components/form";
import {
  IFeeConfig,
  IGasConfig,
  IMemoConfig,
  SignDocHelper,
} from "@keplr-wallet/hooks";
import { useLanguage } from "../../languages";
import { Badge, Label, Button } from "reactstrap";
import { renderDirectMessage } from "./direct";

export const DetailsTab: FunctionComponent<{
  signDocHelper: SignDocHelper;
  memoConfig: IMemoConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;

  disableInputs: boolean | undefined;
  disableFeeInputs: boolean;
}> = observer(
  ({
    signDocHelper,
    memoConfig,
    feeConfig,
    gasConfig,
    disableInputs,
    disableFeeInputs,
  }) => {
    const { chainStore, priceStore, accountStore } = useStore();
    const intl = useIntl();

    const language = useLanguage();

    const mode = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode
      : "none";
    const msgs = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode === "amino"
        ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
        : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
      : [];
    let _disableFeeInputs = disableFeeInputs;
    const renderedMsgs = (() => {
      if (mode === "amino") {
        return (msgs as readonly Msg[]).map((msg, i) => {
          const msgContent = renderAminoMessage(
            accountStore.getAccount(chainStore.current.chainId).msgOpts,
            msg,
            chainStore.current.currencies,
            intl
          );
          return (
            <React.Fragment key={i.toString()}>
              <Msg icon={msgContent.icon} title={msgContent.title}>
                {msgContent.content}
              </Msg>
              <hr />
            </React.Fragment>
          );
        });
      } else if (mode === "direct") {
        return (msgs as any[]).map((msg, i) => {
          const msgContent = renderDirectMessage(
            msg,
            chainStore.current.currencies,
            intl
          );
          return (
            <React.Fragment key={i.toString()}>
              <Msg icon={msgContent.icon} title={msgContent.title}>
                {msgContent.content}
              </Msg>
              <hr />
            </React.Fragment>
          );
        });
      } else {
        return null;
      }
    })();

    return (
      <div className={styleDetailsTab.container}>
        <Label
          for="signing-messages"
          className="form-control-label"
          style={{ display: "flex" }}
        >
          <FormattedMessage id="sign.list.messages.label" />
          <Badge className="ml-2" color="primary">
            {msgs.length}
          </Badge>
        </Label>
        <div id="signing-messages" className={styleDetailsTab.msgContainer}>
          {renderedMsgs}
        </div>
        {!disableInputs ? (
          <MemoInput
            memoConfig={memoConfig}
            label={intl.formatMessage({ id: "sign.info.memo" })}
            rows={1}
          />
        ) : (
          <React.Fragment>
            <Label for="memo" className="form-control-label">
              <FormattedMessage id="sign.info.memo" />
            </Label>
            <div id="memo" style={{ marginBottom: "8px" }}>
              <div style={{ color: memoConfig.memo ? undefined : "#AAAAAA" }}>
                {memoConfig.memo
                  ? memoConfig.memo
                  : intl.formatMessage({ id: "sign.info.warning.empty-memo" })}
              </div>
            </div>
          </React.Fragment>
        )}
        {!disableInputs && !_disableFeeInputs ? (
          <FeeButtons
            feeConfig={feeConfig}
            gasConfig={gasConfig}
            priceStore={priceStore}
            label={intl.formatMessage({ id: "sign.info.fee" })}
            gasLabel={intl.formatMessage({ id: "sign.info.gas" })}
          />
        ) : feeConfig.fee ? (
          <React.Fragment>
            <Label for="fee-price" className="form-control-label">
              <FormattedMessage id="sign.info.fee" />
            </Label>
            <div id="fee-price">
              <div>
                {feeConfig.fee.maxDecimals(6).trim(true).toString()}
                {priceStore.calculatePrice(
                  language.fiatCurrency,
                  feeConfig.fee
                ) ? (
                  <div
                    className="ml-2"
                    style={{ display: "inline-block", fontSize: "12px" }}
                  >
                    {priceStore
                      .calculatePrice(language.fiatCurrency, feeConfig.fee)
                      ?.toString()}

                    <Button
                      className={style.button}
                      color="primary"
                      onClick={async (e) => {
                        e.preventDefault();
                        _disableFeeInputs = false;
                      }}
                    >
                      {intl.formatMessage({
                        id: "sign.button.approve",
                      })}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </React.Fragment>
        ) : null}
      </div>
    );
  }
);

const Msg: FunctionComponent<{
  icon?: string;
  title: string;
}> = ({ icon = "fas fa-question", title, children }) => {
  return (
    <div className={styleDetailsTab.msg}>
      <div className={styleDetailsTab.icon}>
        <div style={{ height: "2px" }} />
        <i className={icon} />
        <div style={{ flex: 1 }} />
      </div>
      <div className={styleDetailsTab.contentContainer}>
        <div className={styleDetailsTab.contentTitle}>{title}</div>
        <div className={styleDetailsTab.content}>{children}</div>
      </div>
    </div>
  );
};
