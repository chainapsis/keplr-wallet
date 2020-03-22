import React, {
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect
} from "react";

import { Button } from "reactstrap";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

import style from "./style.module.scss";
import queryString from "query-string";
import { RouteComponentProps } from "react-router";

import { disableScroll, fitWindow } from "../../../../common/window";
import { useRequestAccess } from "../../../hooks/use-request-access";
import { HeaderLayout } from "../../layouts/header-layout";

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

  return (
    <HeaderLayout showChainName canChangeChainInfo={false}>
      <div className={style.container}>
        {access.accessOrigin?.chainId}
        {access.accessOrigin?.origins}
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
    </HeaderLayout>
  );
});
