import React, { FunctionComponent, useCallback, useEffect } from "react";
import { Button } from "../../../components/button";
import { RouteComponentProps } from "react-router";

import { HeaderLayout } from "../../layouts";

import style from "./styles.module.scss";

import queryString from "query-string";
import { useStore } from "../../stores";
import { useSignature } from "../../../hooks";

export const SignPage: FunctionComponent<RouteComponentProps<{
  index: string;
}>> = ({ history, match, location }) => {
  const query = queryString.parse(location.search);
  const inPopup = query.inPopup ?? false;

  const index = match.params.index;

  const { chainStore } = useStore();

  const signing = useSignature(
    index,
    useCallback(
      chainId => {
        chainStore.setChain(chainId);
      },
      [chainStore]
    )
  );

  useEffect(() => {
    // Force reject when closing window.
    const beforeunload = async () => {
      if (!signing.loading && !inPopup && signing.reject) {
        await signing.reject();
      }
    };

    addEventListener("beforeunload", beforeunload);
    return () => {
      removeEventListener("beforeunload", beforeunload);
    };
  }, [signing, inPopup]);

  useEffect(() => {
    return () => {
      // If index is changed, just reject the prior one.
      if (!inPopup && signing.reject) {
        signing.reject();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signing.reject, signing.index, inPopup]);

  const onApproveClick = useCallback(async () => {
    if (signing.approve) {
      await signing.approve();
    }

    // If this is called by injected wallet provider. Just close.
    if (!inPopup) {
      window.close();
    }
  }, [signing, inPopup]);

  const onRejectClick = useCallback(async () => {
    if (signing.reject) {
      await signing.reject();
    }

    // If this is called by injected wallet provider. Just close.
    if (!inPopup) {
      window.close();
    }
  }, [signing, inPopup]);

  let prettyMessage = signing.message;
  if (prettyMessage) {
    try {
      prettyMessage = JSON.stringify(JSON.parse(prettyMessage), undefined, 2);
    } catch (e) {
      prettyMessage = signing.message;
    }
  }

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo={false}
      onBackButton={
        inPopup
          ? () => {
              history.goBack();
            }
          : undefined
      }
    >
      <div>
        <pre className={style.message}>{prettyMessage}</pre>
        <div className={style.buttons}>
          <Button
            className={style.button}
            size="medium"
            color="primary"
            disabled={
              signing.message == null ||
              signing.message === "" ||
              signing.initializing
            }
            loading={signing.requested}
            onClick={onApproveClick}
          >
            Approve
          </Button>
          <Button
            className={style.button}
            size="medium"
            color="danger"
            disabled={
              signing.message == null ||
              signing.message === "" ||
              signing.initializing
            }
            loading={signing.requested}
            onClick={onRejectClick}
          >
            Reject
          </Button>
        </div>
      </div>
    </HeaderLayout>
  );
};
