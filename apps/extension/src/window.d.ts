import { Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {
    // keplr가 side panel 옵션일때
    // 유저가 keplr 아이콘을 눌러서 켰는지
    // 외부 웹페이지에 의한 interaction에 의해서 side panel이 열렸는지 확인한다.
    // 목적은 interaction 이후에 외부 웹페이지에 의해 켜진 상태라면 side panel을 닫고
    // 유저가 keplr 아이콘을 눌러서 켰다면 외부 interaction 이후에 기존의 페이지로 돌아가기 위한 것이다.
    // 하지만 이것을 extension api로 알아낼 순 없기 때문에
    // 로직에 의해서 알아내는데 알아내는 방법은 index.tsx에서 isReady를 확인하는 로직을 참고
    isStartFromInteractionWithSidePanelEnabled: boolean | undefined;
  }
}
