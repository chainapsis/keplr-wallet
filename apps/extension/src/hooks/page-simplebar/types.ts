import React from "react";
import SimpleBarCore from "simplebar-core";

export interface PageSimpleBar {
  ref: React.MutableRefObject<SimpleBarCore | null>;
  // simplebar 라이브러리의 한계로 자식 컴포넌트가 mount될때 ref을 찾을 수 없다.
  // useEffect((){}, []) 식으로 사용하려면 refChangeHandler를 사용해야한다.
  // ref이 변경될때마다 handler를 호출함.
  // handler가 등록될때 ref이 존재하면 handler를 바로 호출함.
  // return disposal
  refChangeHandler: (
    handler: (ref: SimpleBarCore | null) => void
  ) => () => void;
}
