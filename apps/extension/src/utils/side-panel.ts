import { SetSidePanelEnabledMsg } from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

export const isRunningInSidePanel = (): boolean => {
  // webpack과 manifest를 참조해보면
  // popup.html과 sidePanel.html은 완전히 동일하지만
  // popup에서 실행되었는지 sidePanel에서 실행되었는지 알기 위해서
  // 단순히 파일 이름만 다르게 분리되어있다.
  return new URL(window.location.href).pathname === "/sidePanel.html";
};

export const handleExternalInteractionWithNoProceedNext = () => {
  if (window.isStartFromInteractionWithSidePanelEnabled) {
    window.close();
  } else {
    if (isRunningInSidePanel()) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.close();
      }
    } else {
      window.close();
    }
  }
};

export const handleExternalInteractionBeforeFnWithNoProceedNext = async (
  beforeFn: () => Promise<void>
) => {
  if (window.isStartFromInteractionWithSidePanelEnabled) {
    await beforeFn();
    window.close();
  } else {
    if (isRunningInSidePanel()) {
      if (window.history.length > 1) {
        await beforeFn();
        window.history.back();
      } else {
        await beforeFn();
        window.close();
      }
    } else {
      await beforeFn();
      window.close();
    }
  }
};

export const toggleSidePanelMode = async (
  enable: boolean,
  onRes: (enabled: boolean) => void
): Promise<void> => {
  const msg = new SetSidePanelEnabledMsg(enable);
  const res = await new InExtensionMessageRequester().sendMessage(
    BACKGROUND_PORT,
    msg
  );
  onRes(res.enabled);

  if (res.enabled) {
    if (
      typeof chrome !== "undefined" &&
      typeof chrome.sidePanel !== "undefined"
    ) {
      const selfCloseId = Math.random() * 100000;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__self_id_for_closing_view_side_panel = selfCloseId;
      // side panel을 열고 나서 기존의 popup view를 모두 지워야한다
      const viewsBefore = browser.extension.getViews();

      try {
        const activeTabs = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (activeTabs.length > 0) {
          const id = activeTabs[0].id;
          if (id != null) {
            await chrome.sidePanel.open({
              tabId: id,
            });
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        for (const view of viewsBefore) {
          if (
            // 자기 자신은 제외해야한다.
            // 다른거 끄기 전에 자기가 먼저 꺼지면 안되기 때문에...
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.__self_id_for_closing_view_side_panel !== selfCloseId
          ) {
            view.window.close();
          }
        }

        window.close();
      }
    } else {
      window.close();
    }
  } else {
    const selfCloseId = Math.random() * 100000;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__self_id_for_closing_view_side_panel = selfCloseId;
    // side panel을 모두 닫아야한다.
    const views = browser.extension.getViews();

    for (const view of views) {
      if (
        // 자기 자신은 제외해야한다.
        // 다른거 끄기 전에 자기가 먼저 꺼지면 안되기 때문에...
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.__self_id_for_closing_view_side_panel !== selfCloseId
      ) {
        view.window.close();
      }
    }

    window.close();
  }
};
