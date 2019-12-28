import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { DelegateInfo } from "../../../../hooks/use-delegating-info";
import { Currency } from "../../../../../chain-info";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { Validator } from "../../../../hooks/use-validator";

import { Button } from "../../../../components/button";
import { UnbondModal } from "./unbond-modal";
import Modal from "react-modal";

import { CosmosJsHook } from "../../../../hooks";

import style from "./style.module.scss";
import styleDelegations from "./delegations.module.scss";
import classnames from "classnames";
import { DelegatorReward } from "../../../../hooks/use-reward";
import { UnbondInfo } from "../../../../hooks/use-unbonding-info";
import { DecUtils } from "../../../../../common/dec-utils";
import Moment from "react-moment";
import { StakeModal } from "./stake-modal";

interface ValidatorDelegationInfo {
  validator: Validator;
  delegation?: DelegateInfo;
  unbonding?: UnbondInfo;
  reward?: DelegatorReward;
  totalReward: Dec;
}

export const Delegations: FunctionComponent<{
  validators: Validator[];
  delegations: DelegateInfo[];
  unbondingDelegations: UnbondInfo[];
  rewards: DelegatorReward[];
  currency: Currency;
  cosmosJS: CosmosJsHook;
}> = ({
  validators,
  delegations,
  unbondingDelegations,
  rewards,
  currency,
  cosmosJS
}) => {
  const [detailOpened, setDetailOpened] = useState(-1);

  const [validatorDelegations, setValidatorDelegations] = useState<
    ValidatorDelegationInfo[]
  >([]);
  const [requestStake, setRequestStake] = useState<Validator | undefined>();
  const [requestUnbond, setRequestUnbond] = useState<Validator | undefined>();

  const precision = useMemo(() => {
    return DecUtils.getPrecisionDec(currency.coinDecimals);
  }, [currency.coinDecimals]);

  useEffect(() => {
    const valDelInfoMap: Map<string, ValidatorDelegationInfo> = new Map();

    for (const delegation of delegations) {
      const validator = validators.find(v => {
        return v.operator_address === delegation.validator_address;
      });

      if (validator) {
        valDelInfoMap.set(validator.operator_address, {
          validator,
          delegation,
          totalReward: new Dec(0)
        });
      }
    }

    for (const unbondInfo of unbondingDelegations) {
      const validator = validators.find(v => {
        return v.operator_address === unbondInfo.validator_address;
      });

      if (validator) {
        valDelInfoMap.set(validator.operator_address, {
          ...valDelInfoMap.get(validator.operator_address),
          validator,
          unbonding: unbondInfo,
          totalReward: new Dec(0)
        });
      }
    }

    for (const reward of rewards) {
      const validator = validators.find(v => {
        return v.operator_address === reward.validator_address;
      });

      let totalReward = new Dec(0);
      const arrReward = reward.reward;
      if (arrReward) {
        for (const r of arrReward) {
          totalReward = totalReward.add(new Dec(r.amount));
        }
      }
      totalReward = new Dec(totalReward.truncate()).quoTruncate(precision);

      if (validator) {
        valDelInfoMap.set(validator.operator_address, {
          ...valDelInfoMap.get(validator.operator_address),
          validator,
          reward: reward,
          totalReward
        });
      }
    }

    const validatorDelegations: ValidatorDelegationInfo[] = [];
    valDelInfoMap.forEach(valDelInfo => {
      validatorDelegations.push(valDelInfo);
    });

    validatorDelegations.sort((valDelInfo1, valDelInfo2) => {
      if (!valDelInfo1.delegation) {
        return 1;
      }
      if (!valDelInfo2.delegation) {
        return -1;
      }
      return new Dec(valDelInfo1.delegation.shares).gt(
        new Dec(valDelInfo2.delegation.shares)
      )
        ? -1
        : 1;
    });

    setValidatorDelegations(validatorDelegations);
  }, [delegations, precision, rewards, unbondingDelegations, validators]);

  const onStakeRequest = useCallback<(validator: Validator) => void>(
    validator => {
      setRequestStake(validator);
    },
    []
  );

  const onUnbondRequest = useCallback<(validator: Validator) => void>(
    validator => {
      setRequestUnbond(validator);
    },
    []
  );

  return (
    <div>
      <Modal
        isOpen={requestStake !== undefined || requestUnbond !== undefined}
        onRequestClose={() => {
          setRequestStake(undefined);
          setRequestUnbond(undefined);
        }}
      >
        {requestStake ? (
          <StakeModal validator={requestStake} cosmosJS={cosmosJS} />
        ) : requestUnbond ? (
          <UnbondModal validator={requestUnbond} cosmosJS={cosmosJS} />
        ) : null}
      </Modal>
      <div className={style.rowTop}>
        <div className={classnames(style.col, style.validator)}>Validator</div>
        <div className={classnames(style.col, styleDelegations.delegated)}>
          Amount staked
        </div>
        <div className={classnames(style.col, styleDelegations.reward)}>
          Pending reward
        </div>
      </div>
      {validatorDelegations.map((valDelInfo, i) => {
        return (
          <div key={i.toString()}>
            <div
              className={style.row}
              onClick={() => {
                if (i === detailOpened) {
                  setDetailOpened(-1);
                } else {
                  setDetailOpened(i);
                }
              }}
            >
              <div className={classnames(style.col, style.validator)}>
                <img
                  src={
                    valDelInfo.validator.thumbnail
                      ? valDelInfo.validator.thumbnail
                      : require("../../../public/assets/user-circle-solid.svg")
                  }
                  className={style.thumbnail}
                />
                <div>{valDelInfo.validator.description.moniker}</div>
                {valDelInfo.unbonding ? (
                  <div className={styleDelegations.label}>Unstaking</div>
                ) : null}
              </div>
              <div
                className={classnames(style.col, styleDelegations.delegated)}
              >
                {valDelInfo.delegation
                  ? `${DecUtils.decToStrWithoutTrailingZeros(
                      new Dec(valDelInfo.delegation.shares).quoTruncate(
                        precision
                      )
                    )} ${currency.coinDenom}`
                  : `0 ${currency.coinDenom}`}
              </div>
              <div className={classnames(style.col, styleDelegations.reward)}>
                {`${DecUtils.decToStrWithoutTrailingZeros(
                  valDelInfo.totalReward
                )} ${currency.coinDenom}`}
              </div>
            </div>
            <div
              className={classnames(style.collapse, {
                open: i === detailOpened
              })}
            >
              <DelegationDetail
                validator={valDelInfo.validator}
                unbonding={valDelInfo.unbonding}
                currency={currency}
                onStakeRequest={onStakeRequest}
                onUnbondRequest={onUnbondRequest}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DelegationDetail: FunctionComponent<{
  validator: Validator;
  unbonding?: UnbondInfo;
  currency: Currency;
  onStakeRequest: (validator: Validator) => void;
  onUnbondRequest: (validator: Validator) => void;
}> = ({ validator, unbonding, currency, onStakeRequest, onUnbondRequest }) => {
  const precision = useMemo(() => {
    return DecUtils.getPrecisionDec(currency.coinDecimals);
  }, [currency.coinDecimals]);

  return (
    <div className={style.detail}>
      {unbonding
        ? unbonding.entries.map((entry, i) => {
            return (
              <React.Fragment key={i.toString()}>
                <div className={style.detailTitle}>
                  <div>{`Unstake #${i + 1}`}</div>
                </div>
                <div className={style.item}>
                  <div className={style.label}>Amount</div>
                  <div>{`${DecUtils.decToStrWithoutTrailingZeros(
                    new Dec(entry.balance).quoTruncate(precision)
                  )} ${currency.coinDenom}`}</div>
                </div>
                <div className={style.item}>
                  <div className={style.label}>Completion</div>
                  <Moment fromNow>{entry.completion_time}</Moment>
                  <Moment
                    style={{ marginLeft: "6px" }}
                    format="(MMM DD, YYYY HH:mm UTC Z)"
                  >
                    {entry.completion_time}
                  </Moment>
                </div>
              </React.Fragment>
            );
          })
        : null}

      <div className={style.buttons}>
        <Button
          className={style.button}
          size="medium"
          color="primary"
          onClick={useCallback(() => {
            onUnbondRequest(validator);
          }, [onUnbondRequest, validator])}
          style={{ marginRight: "12px" }}
        >
          UNSTAKE
        </Button>
        <Button
          className={style.button}
          size="medium"
          color="primary"
          onClick={useCallback(() => onStakeRequest(validator), [
            onStakeRequest,
            validator
          ])}
        >
          STAKE
        </Button>
      </div>
    </div>
  );
};
