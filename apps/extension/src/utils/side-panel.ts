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
