import { useLayoutEffect } from "react";
import { PopupWidth } from "./styles";
import * as queryString from "querystring";

export const useMatchPopupSize = () => {
  useLayoutEffect(() => {
    const href = window.location.href;
    if (href.includes("?")) {
      try {
        const query = queryString.parse(href.split("?")[1]);
        // Interaction으로 popup이 열렸을때 실제 window의 width가 원하는 width보다 작을 경우
        // 그 window의 width를 popup의 width로 설정한다.
        // Windows에서 popup을 열때 width에 scrollbar를 뺀 크기를 새 window로 열기 때문에 width가 보장되지 않는다.
        if (query["interaction"] === "true") {
          if (window.visualViewport) {
            const layoutWidth = window.visualViewport.width;
            if (layoutWidth < PopupWidth) {
              document.documentElement.style.setProperty(
                "--popup-width",
                `${layoutWidth}px`
              );
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, []);
};
