export interface ModalProps {
  isOpen: boolean;
  close: () => void;

  onCloseTransitionEnd?: () => void;

  // XXX: 세로로 애니메이션할 때는 height를 결정지을 수 없다.
  //      그러므로 center, bottom일 때는 screen height에 대해서 상대적으로 설정할 수 없다.
  align: "center" | "bottom" | "left" | "right";

  maxHeight?: string;

  forceNotUseSimplebar?: boolean;
  forceNotOverflowAuto?: boolean;

  disableBackdrop?: boolean;
}
