import React, { FunctionComponent } from "react";
import { Splash } from "../../../../components/splash";
import { observer } from "mobx-react-lite";

export const SignBitcoinMessagePage: FunctionComponent = observer(() => {
  // const { signStarknetMessageInteractionStore } = useStore();

  // useInteractionInfo({
  //   onWindowClose: () => {
  //     signStarknetMessageInteractionStore.rejectAll();
  //   },
  // });

  return (
    <React.Fragment>
      {/* CosmosTxView의 주석을 꼭 읽으셈 */}
      <Splash />
    </React.Fragment>
  );
});
