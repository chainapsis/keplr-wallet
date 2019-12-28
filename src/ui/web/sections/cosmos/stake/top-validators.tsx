import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState
} from "react";

import { StakeModal } from "./stake-modal";

import { Validator } from "../../../../hooks/use-validator";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { Currency } from "../../../../../chain-info";
import { Button } from "../../../../components/button";

import style from "./style.module.scss";
import styleTopValidators from "./top-validators.module.scss";
import classnames from "classnames";

import Modal from "react-modal";
import { CosmosJsHook } from "../../../../hooks";
import { DecUtils } from "../../../../../common/dec-utils";

export const TopValidators: FunctionComponent<{
  validators: Validator[];
  currency: Currency;
  cosmosJS: CosmosJsHook;
}> = ({ validators, currency, cosmosJS }) => {
  const [detailOpened, setDetailOpened] = useState(-1);

  const [requestStake, setRequestStake] = useState<Validator | undefined>();

  const precision = useMemo(() => {
    let precision = new Dec(1);
    for (let i = 0; i < currency.coinDecimals; i++) {
      precision = precision.mul(new Dec(10));
    }
    return precision;
  }, [currency.coinDecimals]);

  const onStakeRequest = useCallback<(validator: Validator) => void>(
    validator => {
      setRequestStake(validator);
    },
    []
  );

  return (
    <div>
      <Modal
        isOpen={requestStake !== undefined}
        onRequestClose={() => {
          setRequestStake(undefined);
        }}
      >
        {requestStake ? (
          <StakeModal validator={requestStake} cosmosJS={cosmosJS} />
        ) : null}
      </Modal>
      <div className={style.rowTop}>
        <div className={classnames(style.col, style.validator)}>Validator</div>
        <div className={classnames(style.col, styleTopValidators.votingPower)}>
          Voting Power
        </div>
        <div className={classnames(style.col, styleTopValidators.commission)}>
          Commission
        </div>
      </div>
      {validators.map((validator, i) => {
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
                <div className={styleTopValidators.rankOuter}>
                  <img
                    src={
                      validator.thumbnail
                        ? validator.thumbnail
                        : require("../../../public/assets/user-circle-solid.svg")
                    }
                    className={style.thumbnail}
                  />
                  <div className={styleTopValidators.rank}>
                    {(i + 1).toString()}
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  {validator.description.moniker}
                </div>
              </div>
              <div
                className={classnames(
                  style.col,
                  styleTopValidators.votingPower
                )}
              >
                {parseInt(
                  new Dec(validator.delegator_shares)
                    .quoTruncate(precision)
                    .truncate()
                    .toString()
                ).toLocaleString()}
              </div>
              <div
                className={classnames(style.col, styleTopValidators.commission)}
              >
                {DecUtils.decToStrWithoutTrailingZeros(
                  new Dec(
                    new Dec(validator.commission.commission_rates.rate)
                      .mulTruncate(new Dec(1000))
                      .truncate()
                  ).quoTruncate(new Dec(10))
                ) + "%"}
              </div>
            </div>
            <div
              className={classnames(style.collapse, {
                open: i === detailOpened
              })}
            >
              <ValidatorStakeDetail
                validator={validator}
                onStakeRequest={onStakeRequest}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ValidatorStakeDetail: FunctionComponent<{
  validator: Validator;
  onStakeRequest: (validator: Validator) => void;
}> = ({ validator, onStakeRequest }) => {
  const stakeOnClick = useCallback(() => {
    onStakeRequest(validator);
  }, [validator, onStakeRequest]);

  return (
    <div className={style.detail}>
      <div className={style.item}>
        <div className={style.label}>Website</div>
        <div>
          <a
            href={
              validator.description.website.indexOf("http") !== 0
                ? "https://" + validator.description.website
                : validator.description.website
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {validator.description.website}
          </a>
        </div>
      </div>
      <div className={style.item}>
        <div className={style.label}>Details</div>
        <div>{validator.description.details}</div>
      </div>
      <div className={style.buttons}>
        <Button
          className={style.button}
          size="medium"
          color="primary"
          onClick={stakeOnClick}
        >
          STAKE
        </Button>
      </div>
    </div>
  );
};
