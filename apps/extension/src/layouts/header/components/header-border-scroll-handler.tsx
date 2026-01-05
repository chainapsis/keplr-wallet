import { FunctionComponent, useEffect } from "react";
import { usePageSimpleBar } from "../../../hooks/page-simplebar";

// 이 컴포넌트는 PageSimpleBarProvider 내부에서 렌더링되어야 합니다.
export const HeaderBorderScrollHandler: FunctionComponent<{
  onShowBorderBottomChange: (show: boolean) => void;
}> = ({ onShowBorderBottomChange }) => {
  const pageSimpleBar = usePageSimpleBar();

  useEffect(() => {
    const scrollElement = pageSimpleBar.ref.current?.getScrollElement();
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
