import { FunctionComponent, useEffect } from "react";
import { useGlobalSimpleBar } from "../../../hooks/global-simplebar";

// 이 컴포넌트는 GlobalSimpleBarProvider 내부에서 렌더링되어야 합니다.
export const HeaderBorderScrollHandler: FunctionComponent<{
  onShowBorderBottomChange: (show: boolean) => void;
}> = ({ onShowBorderBottomChange }) => {
  const globalSimpleBar = useGlobalSimpleBar();

  useEffect(() => {
    const scrollElement = globalSimpleBar.ref.current?.getScrollElement();
    if (!scrollElement) return;

    const handleScroll = () => {
      if (scrollElement.scrollTop > 0) {
        onShowBorderBottomChange(true);
      } else {
        onShowBorderBottomChange(false);
      }
    };

    scrollElement.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
