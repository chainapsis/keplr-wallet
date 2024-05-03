import React, { FunctionComponent } from "react";
import styleToken from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { Tokens } from "./tokens";
import { NativeTokens } from "./native-tokens";

export const TokensView: FunctionComponent = observer(() => {
  return (
    <div className={styleToken["tokenContainnerInner"]}>
      <div>
        <NativeTokens />
        <Tokens />
      </div>
    </div>
  );
});
