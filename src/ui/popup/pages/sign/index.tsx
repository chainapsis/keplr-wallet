import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from "react";
import { Button } from "../../../components/button";
import { RouteComponentProps } from "react-router";

import { HeaderLayout } from "../../layouts";

import style from "./style.module.scss";

import queryString from "query-string";
import { useStore } from "../../stores";
import { useSignature } from "../../../hooks";

import classnames from "classnames";
import { DataTab } from "./data-tab";
import { DetailsTab } from "./details-tab";

enum Tab {
  Details,
  Data
}

export const SignPage: FunctionComponent<RouteComponentProps<{
  index: string;
}>> = ({ history, match, location }) => {
  const query = queryString.parse(location.search);
  const inPopup = query.inPopup ?? false;

  const index = match.params.index;

  const [tab, setTab] = useState<Tab>(Tab.Details);

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
      style={{ background: "white" }}
    >
      <div className={style.container}>
        <div className="tabs is-fullwidth" style={{ marginBottom: 0 }}>
          <ul>
            <li className={classnames({ "is-active": tab === Tab.Details })}>
              <a
                onClick={() => {
                  setTab(Tab.Details);
                }}
              >
                Details
              </a>
            </li>
            <li className={classnames({ "is-active": tab === Tab.Data })}>
              <a
                onClick={() => {
                  setTab(Tab.Data);
                }}
              >
                Data
              </a>
            </li>
          </ul>
        </div>
        <div className={style.tabContainer}>
          {tab === Tab.Data ? <DataTab message={signing.message} /> : null}
          {tab === Tab.Details ? (
            <DetailsTab message={signing.message} />
          ) : null}
        </div>
        <div style={{ flex: 1 }} />
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
