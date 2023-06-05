import activeStake from "@assets/icon/activeStake.png";
import { useNotification } from "@components/notification";
import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
  useDelegateTxConfig,
} from "@keplr-wallet/hooks";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import { Button, FormGroup, Input, Label } from "reactstrap";
import { useStore } from "../../stores";
import style from "./style.module.scss";

export const Stake: FunctionComponent<{ validatorAddress: string }> = observer(
  ({ validatorAddress }) => {
    const history = useHistory();
    const { chainStore, accountStore, queriesStore } = useStore();
    const account = accountStore.getAccount(chainStore.current.chainId);

    const sendConfigs = useDelegateTxConfig(
      chainStore,
      queriesStore,
      accountStore,
      chainStore.current.chainId,
      account.bech32Address
    );
    const { amountConfig, memoConfig, feeConfig } = sendConfigs;

    const intl = useIntl();
    const error = amountConfig.error;

    const queryBalances = queriesStore
      .get(amountConfig.chainId)
      .queryBalances.getQueryBech32Address(amountConfig.sender);

    const queryBalance = queryBalances.balances.find(
      (bal) =>
        amountConfig.sendCurrency.coinMinimalDenom ===
        bal.currency.coinMinimalDenom
    );
    const balance = queryBalance
      ? queryBalance.balance
      : new CoinPretty(amountConfig.sendCurrency, new Int(0));

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
    const stakeClicked = async () => {
      try {
        await account.cosmos.sendDelegateMsg(
          amountConfig.amount,
          validatorAddress,
          memoConfig.memo,
          feeConfig.toStdFee(),
          undefined,
          {
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
            },
            onFulfill: () => {
              notification.push({
                type: "success",
                placement: "top-center",
                duration: 5,
                content: `Transaction Completed`,
                canDelete: true,
                transition: {
                  duration: 0.25,
                },
              });
              history.push("/stake-complete/" + validatorAddress);
            },
          }
        );
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
        history.replace("/");
      }
    };

    return (
      <React.Fragment>
        <FormGroup style={{ borderRadius: "0%", marginBottom: "2px" }}>
          <Label className="form-control-label" style={{ width: "100%" }}>
            <div
              className={style.balance}
              onClick={(e) => {
                e.preventDefault();
                amountConfig.toggleIsMax();
              }}
            >{`Balance: ${balance.trim(true).maxDecimals(6).toString()}`}</div>
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
            <div className={style["error-text"]}>{errorText}</div>
          ) : null}
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
            Stake
          </Button>
        </FormGroup>
      </React.Fragment>
    );
  }
);
