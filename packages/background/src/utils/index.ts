import { isServiceWorker } from "@keplr-wallet/common";

export const runIfOnlyAppStart = async (
  key: string,
  fn: () => Promise<void>
): Promise<void> => {
  let skip = false;
  // service worker의 경우 active/inactive가 될 수 있다
  // 이 경우 session이 값을 저장함으로써 최초 한번만 실행되도록 보장한다.
  if (isServiceWorker()) {
    try {
      const v = await browser.storage.session.get(key);
      if (v[key]) {
        skip = true;
      }
      await browser.storage.session.set({
        [key]: true,
      });
    } catch (e) {
      console.log(
        `Failed to load from session storage: ${e.message || e.toString()}`
      );
    }
  }

  if (!skip) {
    await fn();
  }
};
