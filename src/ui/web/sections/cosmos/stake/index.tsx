import React, { FunctionComponent, useCallback, useMemo } from "react";

import { Card } from "../../../components/card";

import Modal from "react-modal";

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
import { Button } from "../../../../components/button";
import { Msg } from "@everett-protocol/cosmosjs/core/tx";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { Int } from "@everett-protocol/cosmosjs/common/int";
import {
  AccAddress,
  useBech32Config,
  ValAddress
} from "@everett-protocol/cosmosjs/common/address";
import { MsgWithdrawDelegatorReward } from "@everett-protocol/cosmosjs/x/distribution";
import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";
import bigInteger from "big-integer";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { useNotification } from "../../../../components/notification";

import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";
import { StakeModal } from "./stake-modal";
import { UnbondModal } from "./unbond-modal";

export const StakeSection: FunctionComponent = observer(() => {
  const history = useHistory();
  const location = useLocation();
  const query = queryString.parse(location?.search ?? "");

  const dialog = query.dialog;
  const isModal =
    (dialog === "stake" || dialog === "unbond") &&
    query.validator != null &&
    query.validator !== "";

  const onRequestCloseModal = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    history.push(location.pathname);
  }, [history, location.pathname]);

  const { chainStore } = useStore();

  const cosmosJS = useCosmosJS(
    chainStore.chainInfo,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    window.cosmosJSWalletProvider!,
    {
      useBackgroundTx: true
    }
  );

  const validator = useValidator(chainStore.chainInfo.rest);

  const queryValidator = useMemo(() => {
    for (const val of validator.validators) {
      if (val.operator_address === query.validator) {
        return val;
      }
    }
    return undefined;
  }, [query.validator, validator.validators]);

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

  const notification = useNotification();

  const rewardExist = useMemo(() => {
    if (rewards.length > 0 && cosmosJS.addresses.length > 0) {
      for (const r of rewards) {
        if (r.reward) {
          for (const reward of r.reward) {
            const dec = new Dec(reward.amount);
            if (dec.truncate().gt(new Int(0))) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }, [cosmosJS.addresses.length, rewards]);

  const withdrawAllRewards = useCallback(() => {
    if (rewards.length > 0 && cosmosJS.addresses.length > 0) {
      const msgs: Msg[] = [];

      for (const r of rewards) {
        let rewardExist = false;
        if (r.reward) {
          for (const reward of r.reward) {
            const dec = new Dec(reward.amount);
            if (dec.truncate().gt(new Int(0))) {
              rewardExist = true;
              break;
            }
          }
        }

        if (rewardExist) {
          // This is not react hooks.
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useBech32Config(chainStore.chainInfo.bech32Config, () => {
            const msg = new MsgWithdrawDelegatorReward(
              AccAddress.fromBech32(cosmosJS.addresses[0]),
              ValAddress.fromBech32(r.validator_address)
            );

            msgs.push(msg);
          });
        }
      }

      if (msgs.length > 0) {
        if (cosmosJS.sendMsgs) {
          const config: TxBuilderConfig = {
            gas: bigInteger(140000 * msgs.length),
            memo: "",
            fee: new Coin(nativeCurrency.coinMinimalDenom, new Int("1000"))
          };

          cosmosJS.sendMsgs(
            msgs,
            config,
            () => {},
            (e: Error) => {
              notification.push({
                type: "danger",
                content: e.toString(),
                duration: 5,
                canDelete: true,
                placement: "top-right",
                transition: {
                  duration: 0.25
                }
              });
            },
            "commit"
          );
        }
      }
    }
  }, [
    chainStore.chainInfo.bech32Config,
    cosmosJS,
    nativeCurrency.coinMinimalDenom,
    notification,
    rewards
  ]);

  const cosmosJSInited = cosmosJS.sendMsgs && cosmosJS.addresses.length > 0;

  return (
    <div className={style.container}>
      <Modal isOpen={isModal} onRequestClose={onRequestCloseModal}>
        {cosmosJS && cosmosJSInited && queryValidator ? (
          dialog === "stake" ? (
            <StakeModal cosmosJS={cosmosJS} validator={queryValidator} />
          ) : (
            <UnbondModal cosmosJS={cosmosJS} validator={queryValidator} />
          )
        ) : (
          <div>Loading...</div>
        )}
      </Modal>
      {delegateInfos.length > 0 ||
      unbondInfos.length > 0 ||
      rewards.length > 0 ? (
        <Card>
          <div className={style.title}>
            My validators
            <div style={{ float: "right" }}>
              <Button
                className={style.button}
                color="primary"
                loading={cosmosJS.loading}
                disabled={!cosmosJSInited || !rewardExist}
                onClick={withdrawAllRewards}
              >
                CLAIM ALL REWARD
              </Button>
            </div>
          </div>
          <Delegations
            validators={validator.validators}
            delegations={delegateInfos}
            unbondingDelegations={unbondInfos}
            rewards={rewards}
            currency={nativeCurrency}
          />
        </Card>
      ) : null}
      <Card>
        <div className={style.title}>Validators</div>
        <TopValidators
          validators={validator.validators}
          currency={nativeCurrency}
        />
      </Card>
    </div>
  );
});
