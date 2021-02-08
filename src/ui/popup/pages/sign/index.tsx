import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from "react";
import { Button } from "reactstrap";

import { HeaderLayout } from "../../layouts";

import style from "./style.module.scss";

import queryString from "query-string";
import { useStore } from "../../stores";
import { useSignature } from "../../../hooks";

import classnames from "classnames";
import { DataTab } from "./data-tab";
import { DetailsTab } from "./details-tab";
import { FormattedMessage, useIntl } from "react-intl";
import {
  disableScroll,
  enableScroll,
  fitWindow
} from "../../../../common/window";
import { useHistory, useLocation, useRouteMatch } from "react-router";
import { observer } from "mobx-react";

enum Tab {
  Details,
  Data
}

export const SignPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch<{
    id: string;
  }>();

  const query = queryString.parse(location.search);
  const external = query.external ?? false;

  useEffect(() => {
    if (external) {
      fitWindow();
      disableScroll();
    } else {
      enableScroll();
    }

    // Close when ledger is aborted if external.
    if (external) {
      window.addEventListener("ledgerInitAborted", window.close);
    }

    return () => {
      if (external) {
        window.removeEventListener("ledgerInitAborted", window.close);
      }
    };
  }, [external]);

  const id = match.params.id;

  const [tab, setTab] = useState<Tab>(Tab.Details);

  const intl = useIntl();

  const { chainStore, keyRingStore } = useStore();

  const signing = useSignature(
    id,
    useCallback(
      chainId => {
        chainStore.setChain(chainId);
      },
      [chainStore]
    )
  );

  // Approve signing automatically if key type is ledger.
  useEffect(() => {
    const closeWindowIfExternal = () => {
      if (external) {
        window.close();
      }
    };

    if (keyRingStore.keyRingType === "ledger") {
      window.addEventListener("ledgerSignCompleted", closeWindowIfExternal);

      if (signing.approve && !signing.requested && !signing.loading) {
        signing.approve();
      }
    }

    return () => {
      window.removeEventListener("ledgerSignCompleted", closeWindowIfExternal);
    };
  }, [external, keyRingStore.keyRingType, signing]);

  useEffect(() => {
    // Force reject when closing window.
    const beforeunload = async () => {
      if (!signing.loading && external && signing.reject) {
        await signing.reject();
      }
    };

    addEventListener("beforeunload", beforeunload);
    return () => {
      removeEventListener("beforeunload", beforeunload);
    };
  }, [signing, external]);

  useEffect(() => {
    return () => {
      // If id is changed, just reject the prior one.
      if (external && signing.reject) {
        signing.reject();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signing.reject, signing.id, external]);

  const onApproveClick = useCallback(async () => {
    if (signing.approve) {
      await signing.approve();
    }

    // If this is called by injected wallet provider. Just close.
    if (external) {
      window.close();
    }
  }, [signing, external]);

  const onRejectClick = useCallback(async () => {
    if (signing.reject) {
      await signing.reject();
    }

    // If this is called by injected wallet provider. Just close.
    if (external) {
      window.close();
    }
  }, [signing, external]);

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo={false}
      onBackButton={
        !external
          ? () => {
              history.goBack();
            }
          : undefined
      }
      style={{ background: "white" }}
    >
      <div className={style.container}>
        <div className={classnames(style.tabs)}>
          <ul>
            <li className={classnames({ active: tab === Tab.Details })}>
              <a
                className={style.tab}
                onClick={() => {
                  setTab(Tab.Details);
                }}
              >
                {intl.formatMessage({
                  id: "sign.tab.details"
                })}
              </a>
            </li>
            <li className={classnames({ active: tab === Tab.Data })}>
              <a
                className={style.tab}
                onClick={() => {
                  setTab(Tab.Data);
                }}
              >
                {intl.formatMessage({
                  id: "sign.tab.data"
                })}
              </a>
            </li>
          </ul>
        </div>
        <div className={style.tabContainer}>
          {tab === Tab.Data ? (
            <DataTab messageHex={signing.messageHex} />
          ) : null}
          {tab === Tab.Details ? (
            <DetailsTab messageHex={signing.messageHex} />
          ) : null}
        </div>
        <div style={{ flex: 1 }} />
        <div className={style.buttons}>
          {keyRingStore.keyRingType === "ledger" ? (
            <Button
              className={style.button}
              color="primary"
              disabled={true}
              outline
            >
              <FormattedMessage id="sign.button.confirm-ledger" />{" "}
              <i className="fa fa-spinner fa-spin fa-fw" />
            </Button>
          ) : (
            <React.Fragment>
              <Button
                className={style.button}
                color="danger"
                disabled={
                  signing.messageHex == null ||
                  signing.messageHex === "" ||
                  signing.initializing
                }
                data-loading={signing.requested}
                onClick={onRejectClick}
                outline
              >
                {intl.formatMessage({
                  id: "sign.button.reject"
                })}
              </Button>
              <Button
                className={style.button}
                color="primary"
                disabled={
                  signing.messageHex == null ||
                  signing.messageHex === "" ||
                  signing.initializing
                }
                data-loading={signing.requested}
                onClick={onApproveClick}
              >
                {intl.formatMessage({
                  id: "sign.button.approve"
                })}
              </Button>
            </React.Fragment>
          )}
        </div>
      </div>
    </HeaderLayout>
  );
});
