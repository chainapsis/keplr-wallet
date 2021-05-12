import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { SafeAreaFixedPage } from "../../components/page";
import { AllValidators } from "./all-validators";
import { TempStakeInfoView } from "./temp-stake-info-view";

export const StakeScreen: FunctionComponent = observer(() => {
  return (
    <SafeAreaFixedPage>
      <TempStakeInfoView />
      <AllValidators />
    </SafeAreaFixedPage>
  );
});
