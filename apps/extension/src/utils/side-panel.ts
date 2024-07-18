export const isRunningInSidePanel = (): boolean => {
  // webpack과 manifest를 참조해보면
  // popup.html과 sidePanel.html은 완전히 동일하지만
  // popup에서 실행되었는지 sidePanel에서 실행되었는지 알기 위해서
  // 단순히 파일 이름만 다르게 분리되어있다.
  return new URL(window.location.href).pathname === "/sidePanel.html";
};
