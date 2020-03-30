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
import { RouteComponentProps } from "react-router";

import { disableScroll, fitWindow } from "../../../../common/window";
import { useRequestAccess } from "../../../hooks/use-request-access";
import { EmptyLayout } from "../../layouts/empty-layout";

export const AccessPage: FunctionComponent<Pick<
  RouteComponentProps,
  "location"
>> = observer(({ location }) => {
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
        <h1 className={style.header}>Requesting Connection</h1>
        <p className={style.paragraph}>
          {host} is requesting to connect to your Keplr account on{" "}
          <b>{access.accessOrigin?.chainId}</b>.
        </p>
        <div className={style.permission}>
          By approving this request, the website will:
        </div>
        <ul>
          <li>Know your wallet address</li>
          <li>Be able to send transaction requests</li>
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
            Reject
          </Button>
          <Button
            className={style.button}
            color="primary"
            onClick={approve}
            data-loading={access.loading}
          >
            Approve
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
});
