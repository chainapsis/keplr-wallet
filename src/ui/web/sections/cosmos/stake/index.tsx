import React, { FunctionComponent } from "react";

import { Card } from "../../../components/card";

import style from "./style.module.scss";
import { observer } from "mobx-react";
import { useStore } from "../../../stores";
import { Currency } from "../../../../../chain-info";
import { getCurrency } from "../../../../../common/currency";
import { useValidator } from "../../../../hooks/use-validator";

import { useDelegatingInfos } from "../../../../hooks/use-delegating-info";
import { useCosmosJS } from "../../../../hooks";
import { TopValidators } from "./top-validators";
import { Delegations } from "./delegations";
import { useUnbondingInfos } from "../../../../hooks/use-unbonding-info";
import { useReward } from "../../../../hooks/use-reward";

export const StakeSection: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const cosmosJS = useCosmosJS(
    chainStore.chainInfo,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    window.cosmosJSWalletProvider!
  );

  const validator = useValidator(chainStore.chainInfo.rest);
  const { delegateInfos } = useDelegatingInfos(
    chainStore.chainInfo.rest,
    cosmosJS.addresses.length > 0 ? cosmosJS.addresses[0] : ""
  );
  const { unbondInfos } = useUnbondingInfos(
    chainStore.chainInfo.rest,
    cosmosJS.addresses.length > 0 ? cosmosJS.addresses[0] : ""
  );
  const { rewards } = useReward(
    chainStore.chainInfo.rest,
    cosmosJS.addresses.length > 0 ? cosmosJS.addresses[0] : ""
  );

  const nativeCurrency = getCurrency(
    chainStore.chainInfo.nativeCurrency
  ) as Currency;

  return (
    <div className={style.container}>
      {delegateInfos.length > 0 ? (
        <Card>
          <div className={style.title}>My validators</div>
          <Delegations
            validators={validator.validators}
            delegations={delegateInfos}
            unbondingDelegations={unbondInfos}
            rewards={rewards}
            currency={nativeCurrency}
            cosmosJS={cosmosJS}
          />
        </Card>
      ) : null}
      <Card>
        <div className={style.title}>Validators</div>
        <TopValidators
          validators={validator.validators}
          currency={nativeCurrency}
          cosmosJS={cosmosJS}
        />
      </Card>
    </div>
  );
});
