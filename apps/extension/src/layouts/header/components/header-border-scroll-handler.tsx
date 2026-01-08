import { FunctionComponent, useEffect, useState } from "react";
import { usePageSimpleBar } from "../../../hooks/page-simplebar";
import SimpleBarCore from "simplebar-core";

// 이 컴포넌트는 PageSimpleBarProvider 내부에서 렌더링되어야 합니다.
export const HeaderBorderScrollHandler: FunctionComponent<{
  onShowBorderBottomChange: (show: boolean) => void;
}> = ({ onShowBorderBottomChange }) => {
  const pageSimpleBar = usePageSimpleBar();

  const [simpleBarRefState, setSimpleBarRefState] =
    useState<SimpleBarCore | null>(null);
  useEffect(() => {
    return pageSimpleBar.refChangeHandler(setSimpleBarRefState);
  }, []);

  useEffect(() => {
    if (!simpleBarRefState) {
      return;
    }

    const scrollElement = simpleBarRefState.getScrollElement();
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
  }, [simpleBarRefState]);

  return null;
};
