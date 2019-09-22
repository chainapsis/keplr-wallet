import React, { FunctionComponent, useEffect } from "react";

import { KeyRingStatus } from "../../stores/keyring";

import { RouteComponentProps } from "react-router-dom";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

export const LockPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    const { keyRing } = useStore();

    useEffect(() => {
      if (keyRing.status === KeyRingStatus.EMPTY) {
        history.replace("/register");
      } else if (keyRing.status === KeyRingStatus.UNLOCKED) {
        history.replace("/main");
      }
    }, [keyRing.status]);

    return <div>Lock</div>;
  }
);
