import { useStore } from "./stores";
import { useLayoutEffect } from "react";
import {
  GetAutoLockStateMsg,
  StartAutoLockMonitoringMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

// CONTRACT: Use with `observer`
export const useAutoLockMonitoring = () => {
  const { keyRingStore } = useStore();

  useLayoutEffect(() => {
    const listener = async (newState: browser.idle.IdleState) => {
      if ((newState as any) === "locked") {
        const msg = new GetAutoLockStateMsg();
        const requester = new InExtensionMessageRequester();
        const res = await requester.sendMessage(BACKGROUND_PORT, msg);
        if (res.lockOnSleep || res.duration > 0) {
          // view가 켜져있으면 자동으로 lock이 되지 않지만
          // 컴퓨터가 sleep이 되었을때 lock되는건 view에서 처리할 수 없다.
          // 이 경우 view가 꺼지지 않은 상태로 keyring이 lock되면 어차피 정상 작동할 수 없으므로 window를 닫는다.
          window.close();
        }
      }
    };

    browser.idle.onStateChanged.addListener(listener);

    return () => {
      browser.idle.onStateChanged.removeListener(listener);
    };
  }, []);

  useLayoutEffect(() => {
    if (keyRingStore.status === "unlocked") {
      const sendAutoLockMonitorMsg = async () => {
        const msg = new StartAutoLockMonitoringMsg();
        const requester = new InExtensionMessageRequester();
        await requester.sendMessage(BACKGROUND_PORT, msg);
      };

      // Notify to auto lock service to start activation check whenever the keyring is unlocked.
      sendAutoLockMonitorMsg();
      const autoLockInterval = setInterval(() => {
        sendAutoLockMonitorMsg();
      }, 10000);

      return () => {
        clearInterval(autoLockInterval);
      };
    }
  }, [keyRingStore.status]);
};
