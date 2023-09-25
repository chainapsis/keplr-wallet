import activeStake from "@assets/icon/activeStake.png";
import { useNotification } from "@components/notification";
import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
  useUndelegateTxConfig,
} from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { Button, FormGroup, Input, Label } from "reactstrap";
import { useStore } from "../../stores";
import style from "./style.module.scss";

export const Unstake: FunctionComponent<{
  validatorAddress: string;
}> = observer(({ validatorAddress }) => {
  const navigate = useNavigate();
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);

  const sendConfigs = useUndelegateTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    validatorAddress
  );
  const { amountConfig, memoConfig, feeConfig } = sendConfigs;

  const intl = useIntl();
  const error = amountConfig.error;

  const balance = queriesStore
    .get(amountConfig.chainId)
    .cosmos.queryDelegations.getQueryBech32Address(amountConfig.sender)
    .getDelegationTo(validatorAddress);

  const errorText: string | undefined = useMemo(() => {
    if (error) {
      switch (error.constructor) {
        case EmptyAmountError:
          // No need to show the error to user.
          return;
        case InvalidNumberAmountError:
          return intl.formatMessage({
            id: "input.amount.error.invalid-number",
          });
        case ZeroAmountError:
          return intl.formatMessage({
            id: "input.amount.error.is-zero",
          });
        case NegativeAmountError:
          return intl.formatMessage({
            id: "input.amount.error.is-negative",
          });
        case InsufficientAmountError:
          return intl.formatMessage({
            id: "input.amount.error.insufficient",
          });
        default:
          return intl.formatMessage({ id: "input.amount.error.unknown" });
      }
    }
  }, [intl, error]);

  const notification = useNotification();

  const txnResult = {
    onBroadcasted: () => {
      notification.push({
        type: "primary",
        placement: "top-center",
        duration: 2,
        content: `Transaction broadcasted`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });

      analyticsStore.logEvent("Unstake tx broadcasted", {
        chainId: chainStore.current.chainId,
        chainName: chainStore.current.chainName,
      });
    },
    onFulfill: (tx: any) => {
      const istxnSuccess = tx.code ? false : true;
      notification.push({
        type: istxnSuccess ? "success" : "danger",
        placement: "top-center",
        duration: 5,
        content: istxnSuccess
          ? `Transaction Completed`
          : `Transaction Failed: ${tx.log}`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    },
  };

  const stakeClicked = async () => {
    try {
      await account.cosmos
        .makeUndelegateTx(amountConfig.amount, validatorAddress)
        .send(feeConfig.toStdFee(), memoConfig.memo, undefined, txnResult);
    } catch (e) {
      notification.push({
        type: "danger",
        placement: "top-center",
        duration: 5,
        content: `Transaction Failed`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <React.Fragment>
      <FormGroup style={{ borderRadius: "0%", marginBottom: "2px" }}>
        <Label className="form-control-label" style={{ width: "100%" }}>
          <div
            className={style["balance"]}
            onClick={(e) => {
              e.preventDefault();

              amountConfig.toggleIsMax();
            }}
          >{`Staked: ${balance.trim(true).maxDecimals(6).toString()}`}</div>
        </Label>
        <Input
          className="form-control-alternative"
          type="number"
          value={amountConfig.amount}
          placeholder="0 FET"
          onChange={(e) => {
            e.preventDefault();
            amountConfig.setAmount(e.target.value);
          }}
          style={{ borderRadius: "0%" }}
          min={0}
          autoComplete="off"
        />
        {errorText != null ? (
          <div className={style["errorText"]}>{errorText}</div>
        ) : null}
        <Label className="form-control-label" style={{ fontSize: "12px" }}>
          Your tokens will go through a 21-day unstaking process
        </Label>
        <Button
          type="submit"
          color="primary"
          block
          disabled={errorText != null || !amountConfig.amount}
          style={{ alignItems: "end", marginTop: "10px" }}
          onClick={stakeClicked}
        >
          <img
            src={activeStake}
            alt=""
            style={{
              marginRight: "5px",
              height: "15px",
            }}
          />
          Unstake
        </Button>
      </FormGroup>
    </React.Fragment>
  );
});
