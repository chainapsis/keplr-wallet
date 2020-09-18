import React, { FunctionComponent, useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  ApproveSuggestedChainInfoMsg,
  GetSuggestedChainInfoMsg,
  RejectSuggestedChainInfoMsg
} from "../../../../../background/chains/messages";
import { sendMessage } from "../../../../../common/message/send";
import { BACKGROUND_PORT } from "../../../../../common/message/constant";
import { BIP44 } from "@chainapsis/cosmosjs/core/bip44";
import { SuggestedChainInfo } from "../../../../../background/chains";
import { Button, Alert } from "reactstrap";

import style from "./style.module.scss";
import { EmptyLayout } from "../../../layouts/empty-layout";
import { disableScroll, fitWindow } from "../../../../../common/window";
import { FormattedMessage } from "react-intl";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export const ChainSuggestedPage: FunctionComponent = () => {
  useEffect(() => {
    fitWindow();
    disableScroll();
  }, []);

  const params = useParams<{
    chainId: string;
  }>();
  const chainId = params.chainId;

  const [chainInfo, setChainInfo] = useState<SuggestedChainInfo | undefined>();

  const [requested, setRequested] = useState<boolean>(false);

  const approve = async () => {
    const msg = new ApproveSuggestedChainInfoMsg(chainId);
    setRequested(true);
    await sendMessage(BACKGROUND_PORT, msg);

    window.close();
  };

  const reject = async () => {
    const msg = new RejectSuggestedChainInfoMsg(chainId);
    setRequested(true);
    await sendMessage(BACKGROUND_PORT, msg);

    window.close();
  };

  useEffect(() => {
    // Force reject when closing window.
    const beforeunload = async () => {
      if (!requested) {
        await reject();
      }
    };

    addEventListener("beforeunload", beforeunload);
    return () => {
      removeEventListener("beforeunload", beforeunload);
    };
  }, [reject, requested]);

  useEffect(() => {
    if (chainId) {
      (async () => {
        try {
          const msg = new GetSuggestedChainInfoMsg(chainId);

          const chainInfo = (await sendMessage(
            BACKGROUND_PORT,
            msg
          )) as Writeable<SuggestedChainInfo>;
          chainInfo.bip44 = Object.setPrototypeOf(
            chainInfo.bip44,
            BIP44.prototype
          );
          setChainInfo(chainInfo);
        } catch (e) {
          setChainInfo(undefined);
        }
      })();
    }
  }, [chainId]);

  return (
    <EmptyLayout style={{ height: "100%", paddingTop: "80px" }}>
      <div className={style.container}>
        <img
          src={require("../../../public/assets/temp-icon.svg")}
          alt="logo"
          style={{ height: "92px" }}
        />
        <h1 className={style.header}>
          <FormattedMessage id="chain.suggested.title" />
        </h1>
        <p className={style.paragraph}>
          <FormattedMessage
            id="chain.suggested.paragraph"
            values={{
              host: chainInfo?.origin,
              chainId: chainInfo?.chainId,
              // eslint-disable-next-line react/display-name
              b: (...chunks: any) => <b>{chunks}</b>
            }}
          />
        </p>
        <div style={{ flex: 1 }} />
        <Alert className={style.warning} color="warning">
          <div className={style.imgContainer}>
            <img
              src={require("../../../public/assets/img/icons8-test-tube.svg")}
              alt="experiment"
            />
          </div>
          <div className={style.content}>
            <div className={style.title}>
              <FormattedMessage id="chain.suggested.waring.experiment.title" />
            </div>
            <div>
              <FormattedMessage id="chain.suggested.waring.experiment.paragraph" />
            </div>
          </div>
        </Alert>
        <div className={style.buttons}>
          <Button
            className={style.button}
            color="danger"
            outline
            disabled={!chainInfo}
            onClick={async e => {
              e.preventDefault();

              await reject();
            }}
          >
            <FormattedMessage id="chain.suggested.button.reject" />
          </Button>
          <Button
            className={style.button}
            color="primary"
            disabled={!chainInfo}
            onClick={async e => {
              e.preventDefault();

              await approve();
            }}
          >
            <FormattedMessage id="chain.suggested.button.approve" />
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
};
