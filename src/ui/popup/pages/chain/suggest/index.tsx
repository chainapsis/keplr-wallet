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
import { Button } from "reactstrap";

import style from "./style.module.scss";
import { EmptyLayout } from "../../../layouts/empty-layout";
import { disableScroll, fitWindow } from "../../../../../common/window";

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
    <EmptyLayout className={style.container}>
      <p>대충 experimental feature라고 경고하는 메세지</p>
      {chainInfo ? (
        <p>
          {`${chainInfo?.origin} suggests the chain `}
          <b>{chainInfo?.chainId}</b>
        </p>
      ) : null}
      <div style={{ flex: 1 }} />
      <div className={style.buttons}>
        <Button
          color="danger"
          disabled={!chainInfo}
          onClick={async e => {
            e.preventDefault();

            await reject();
          }}
        >
          Reject
        </Button>
        <Button
          color="primary"
          disabled={!chainInfo}
          onClick={async e => {
            e.preventDefault();

            await approve();
          }}
        >
          Approve
        </Button>
      </div>
    </EmptyLayout>
  );
};
