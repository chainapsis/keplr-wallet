import React, { FunctionComponent, useCallback, useState } from "react";

import { Card } from "../../../components/card";
import { Button } from "../../../../components/button";

import style from "./style.module.scss";
import { observer } from "mobx-react";
import { useStore } from "../../../stores";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { Currency, getCurrency } from "../../../../../chain-info";
import { useValidator, Validator } from "../../../../hooks/use-validator";

import Modal from "react-modal";

import classnames from "classnames";
import { StakeModal } from "./modal";

export const ValidatorDetail: FunctionComponent<{
  validator: Validator;
  onStakeRequest: (validator: Validator) => void;
}> = ({ validator, onStakeRequest }) => {
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
          size="medium"
          color="primary"
          onClick={() => onStakeRequest(validator)}
        >
          Stake
        </Button>
      </div>
    </div>
  );
};

export const StakeSection: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const [detailOpened, setDetailOpened] = useState(-1);
  const [requestStake, setRequestStake] = useState<Validator | undefined>();
  const validator = useValidator(chainStore.chainInfo.rest);

  const nativeCurrency = getCurrency(
    chainStore.chainInfo.nativeCurrency
  ) as Currency;
  let precision = new Dec(1);
  for (let i = 0; i < nativeCurrency.coinDecimals; i++) {
    precision = precision.mul(new Dec(10));
  }

  const onStakeRequest = useCallback<(validator: Validator) => void>(
    validator => {
      setRequestStake(validator);
    },
    []
  );

  return (
    <div className={style.container}>
      <Modal
        isOpen={requestStake !== undefined}
        onRequestClose={() => {
          setRequestStake(undefined);
        }}
      >
        {requestStake ? <StakeModal validator={requestStake} /> : null}
      </Modal>
      <Card style={{ overflowX: "auto" }}>
        <div className={style.rowTop}>
          <div className={style.col} id="rank">
            Rank
          </div>
          <div className={style.col} id="validator">
            Validator
          </div>
          <div className={style.col} id="voting-power">
            Voting Power
          </div>
          <div className={style.col} id="commission">
            Commission
          </div>
        </div>
        {validator.validators.map((validator, i) => (
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
              <div className={style.col} id="rank">
                {(i + 1).toString()}
              </div>
              <div className={style.col} id="validator">
                <img
                  src={validator.thumbnail ? validator.thumbnail : ""}
                  className={style.thumbnail}
                />
                <div>{validator.description.moniker}</div>
              </div>
              <div className={style.col} id="voting-power">
                {parseInt(
                  new Dec(validator.delegator_shares)
                    .quoTruncate(precision)
                    .truncate()
                    .toString()
                ).toLocaleString()}
              </div>
              <div className={style.col} id="commission">
                {new Dec(validator.commission.rate)
                  .mulTruncate(new Dec(100))
                  .truncate()
                  .toString() + "%"}
              </div>
            </div>
            <div
              className={classnames(style.collapse, {
                open: i === detailOpened
              })}
            >
              <ValidatorDetail
                validator={validator}
                onStakeRequest={onStakeRequest}
              />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
});
