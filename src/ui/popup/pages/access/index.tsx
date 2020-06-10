import React, {
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useState
} from "react";

import { Button } from "reactstrap";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

import style from "./style.module.scss";
import queryString from "query-string";

import { disableScroll, fitWindow } from "../../../../common/window";
import { useRequestAccess } from "../../../hooks/use-request-access";
import { EmptyLayout } from "../../layouts/empty-layout";
import { FormattedMessage } from "react-intl";
import { useLocation } from "react-router";

export const AccessPage: FunctionComponent = observer(() => {
  const location = useLocation();

  useEffect(() => {
    fitWindow();
    disableScroll();
  }, []);

  const query = queryString.parse(location.search);

  if (typeof query.id !== "string") {
    throw new Error("Invalid query");
  }

  const { chainStore } = useStore();

  const access = useRequestAccess(
    query.id,
    useCallback(
      accessOrigin => {
        chainStore.setChain(accessOrigin.chainId);
      },
      [chainStore]
    )
  );

  useEffect(() => {
    // Force reject when closing window.
    const beforeunload = async () => {
      if (!access.loading && access.reject) {
        await access.reject();
      }
    };

    addEventListener("beforeunload", beforeunload);
    return () => {
      removeEventListener("beforeunload", beforeunload);
    };
  }, [access]);

  const approve = useCallback(
    (e: MouseEvent) => {
      if (access.approve) {
        access.approve().then(() => {
          window.close();
        });
        e.preventDefault();
      }
    },
    [access]
  );

  const reject = useCallback(
    (e: MouseEvent) => {
      if (access.reject) {
        access.reject().then(() => {
          window.close();
        });
        e.preventDefault();
      }
    },
    [access]
  );

  const [host, setHost] = useState("");
  useEffect(() => {
    if (access.accessOrigin?.origins) {
      const hosts: string[] = [];
      for (const origin of access.accessOrigin.origins) {
        const url = new URL(origin);
        hosts.push(url.host);
      }
      setHost(hosts.join(","));
    }
  }, [access.accessOrigin?.origins]);

  return (
    <EmptyLayout style={{ height: "100%", paddingTop: "80px" }}>
      <div className={style.container}>
        <img
          src={require("../../public/assets/temp-icon.svg")}
          alt="logo"
          style={{ height: "92px" }}
        />
        <h1 className={style.header}>
          <FormattedMessage id="access.title" />
        </h1>
        <p className={style.paragraph}>
          <FormattedMessage
            id="access.paragraph"
            values={{
              host,
              chainId: access.accessOrigin?.chainId,
              // eslint-disable-next-line react/display-name
              b: (...chunks: any) => <b>{chunks}</b>
            }}
          />
        </p>
        <div className={style.permission}>
          <FormattedMessage id="access.permission.title" />
        </div>
        <ul>
          <li>
            <FormattedMessage id="access.permission.account" />
          </li>
          <li>
            <FormattedMessage id="access.permission.tx-request" />
          </li>
        </ul>
        <div style={{ flex: 1 }} />
        <div className={style.buttons}>
          <Button
            className={style.button}
            color="danger"
            outline
            onClick={reject}
            data-loading={access.loading}
          >
            <FormattedMessage id="access.button.reject" />
          </Button>
          <Button
            className={style.button}
            color="primary"
            onClick={approve}
            data-loading={access.loading}
          >
            <FormattedMessage id="access.button.approve" />
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
});
