import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Page } from "../../components/page";
import { AllValidators } from "./all-validators";
import { TempStakeInfoView } from "./temp-stake-info-view";

export const StakeScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  return (
    <Page>
      <TempStakeInfoView chainId={chainStore.current.chainId} />
      <AllValidators chainId={chainStore.current.chainId} />
    </Page>
  );
});
