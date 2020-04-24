import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  FeeButtons,
  CoinInput,
  Input,
  TextArea,
  DefaultGasPriceStep
} from "../../../components/form";
import { RouteComponentProps } from "react-router-dom";
import { useStore } from "../../stores";

import { HeaderLayout } from "../../layouts";

import { PopupWalletProvider } from "../../wallet-provider";

import { MsgSend } from "@everett-protocol/cosmosjs/x/bank";
import { AccAddress } from "@everett-protocol/cosmosjs/common/address";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";

import bigInteger from "big-integer";
import useForm, { FormContext } from "react-hook-form";
import { observer } from "mobx-react";

import { useCosmosJS } from "../../../hooks";
import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";
import {
  getCurrencies,
  getCurrency,
  getCurrencyFromDenom,
  getFiatCurrencyFromLanguage
} from "../../../../common/currency";

import style from "./style.module.scss";
import { CoinUtils } from "../../../../common/coin-utils";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { useNotification } from "../../../components/notification";
import { Int } from "@everett-protocol/cosmosjs/common/int";

import { useIntl } from "react-intl";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody
} from "reactstrap";

import {
  ENSUnsupportedError,
  InvalidENSNameError,
  isValidENS,
  useENS
} from "../../../hooks/use-ens";
import { useLanguage } from "../../language";
import { AddressBookData, AddressBookPage } from "../setting/address-book";
import { EmbedIBCPathInfo } from "../../../../config";
import { ChainInfo } from "../../../../background/chains";
import { MsgTransfer } from "@everett-protocol/cosmosjs/x/ibc";

interface FormData {
  recipient: string;
  amount: string;
  denom: string;
  memo: string;
  fee: Coin | undefined;
}

const CounterpartyChainSelector: FunctionComponent<{
  onSelect: (chainInfo: ChainInfo | undefined) => void;
}> = observer(({ onSelect }) => {
  const { chainStore } = useStore();

  const [selectedChain, setSelectedChain] = useState<ChainInfo | undefined>(
    undefined
  );

  const couterpartyChainInfos: ChainInfo[] = useMemo(() => {
    const ibcPathInfo = EmbedIBCPathInfo[chainStore.chainInfo.chainId];
    if (ibcPathInfo) {
      const chainInfos: ChainInfo[] = [];
      for (const chainId of Object.keys(ibcPathInfo)) {
        const chainInfo = chainStore.chainList.find(info => {
          return info.chainId === chainId;
        });

        if (chainInfo) {
          chainInfos.push(chainInfo);
        }
      }

      return chainInfos;
    } else {
      return [];
    }
  }, [chainStore.chainInfo.chainId, chainStore.chainList]);

  const selectChainCallback = useCallback(
    (e: React.MouseEvent) => {
      if (e.currentTarget) {
        const chainId = e.currentTarget.getAttribute("data-chain-id");
        const chainInfo = chainStore.chainList.find(chainInfo => {
          return chainInfo.chainId === chainId;
        });

        setSelectedChain(chainInfo);
        onSelect(chainInfo);
      } else {
        setSelectedChain(undefined);
        onSelect(undefined);
      }
    },
    [chainStore.chainList, onSelect]
  );

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen(prevState => !prevState);

  return (
    <Dropdown
      size="sm"
      style={{
        position: "absolute",
        right: 0,
        top: 0
      }}
      isOpen={dropdownOpen}
      toggle={toggle}
    >
      <DropdownToggle caret style={{ boxShadow: "none" }}>
        {selectedChain ? selectedChain.chainName : "Internal"}
      </DropdownToggle>
      <DropdownMenu right={true}>
        <DropdownItem onClick={selectChainCallback}>Internal</DropdownItem>
        {couterpartyChainInfos.map(chainInfo => {
          return (
            <DropdownItem
              key={chainInfo.chainId}
              data-chain-id={chainInfo.chainId}
              onClick={selectChainCallback}
            >
              {chainInfo.chainName}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
});

export const SendPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    const intl = useIntl();

    const formMethods = useForm<FormData>({
      defaultValues: {
        recipient: "",
        amount: "",
        denom: "",
        memo: ""
      }
    });
    const {
      register,
      handleSubmit,
      errors,
      setValue,
      watch,
      setError,
      clearError,
      triggerValidation
    } = formMethods;

    register(
      { name: "fee" },
      {
        required: intl.formatMessage({
          id: "send.input.fee.error.required"
        })
      }
    );

    const notification = useNotification();

    const { chainStore, accountStore, priceStore } = useStore();
    const [walletProvider] = useState(
      new PopupWalletProvider(undefined, {
        onRequestSignature: (id: string) => {
          history.push(`/sign/${id}`);
        }
      })
    );
    const cosmosJS = useCosmosJS(chainStore.chainInfo, walletProvider, {
      useBackgroundTx: true
    });
    const [counterpartyChainInfo, setCounterpartyChainInfo] = useState<
      ChainInfo | undefined
    >(undefined);

    const [gasForSendMsg] = useState(80000);

    const feeCurrency = useMemo(() => {
      return getCurrency(chainStore.chainInfo.feeCurrencies[0]);
    }, [chainStore.chainInfo.feeCurrencies]);

    const language = useLanguage();

    useEffect(() => {
      const fiatCurrency = getFiatCurrencyFromLanguage(language.language);

      const coinGeckoId = feeCurrency?.coinGeckoId;

      if (coinGeckoId && !priceStore.hasFiat(fiatCurrency.currency)) {
        priceStore.fetchValue([fiatCurrency.currency], [coinGeckoId]);
      }
    }, [feeCurrency?.coinGeckoId, language.language, priceStore]);

    const [allBalance, setAllBalance] = useState(false);

    const onChangeAllBalance = useCallback((allBalance: boolean) => {
      setAllBalance(allBalance);
    }, []);

    const fee = watch("fee");
    const amount = watch("amount");
    const denom = watch("denom");

    useEffect(() => {
      if (allBalance) {
        setValue("amount", "");

        const currency = getCurrencyFromDenom(denom);
        if (fee && denom && currency) {
          let allAmount = new Int(0);
          for (const balacne of accountStore.assets) {
            if (balacne.denom === currency.coinMinimalDenom) {
              allAmount = balacne.amount;
              break;
            }
          }

          if (allAmount.gte(fee.amount)) {
            allAmount = allAmount.sub(fee.amount);

            const dec = new Dec(allAmount);
            let precision = new Dec(1);
            for (let i = 0; i < currency.coinDecimals; i++) {
              precision = precision.mul(new Dec(10));
            }

            setValue(
              "amount",
              dec.quoTruncate(precision).toString(currency.coinDecimals)
            );
          }
        }
      }
    }, [fee, accountStore.assets, allBalance, setValue, denom]);

    useEffect(() => {
      const feeAmount = fee ? fee.amount : new Int(0);
      const currency = getCurrencyFromDenom(denom);
      try {
        if (currency && amount) {
          let find = false;
          for (const balacne of accountStore.assets) {
            if (balacne.denom === currency.coinMinimalDenom) {
              let precision = new Dec(1);
              for (let i = 0; i < currency.coinDecimals; i++) {
                precision = precision.mul(new Dec(10));
              }

              const amountInt = new Dec(amount).mul(precision).truncate();
              if (amountInt.add(feeAmount).gt(balacne.amount)) {
                setError(
                  "amount",
                  "not-enough-fund",
                  intl.formatMessage({
                    id: "send.input.amount.error.insufficient"
                  })
                );
              } else {
                clearError("amount");
              }
              find = true;
              break;
            }
          }

          if (!find) {
            setError(
              "amount",
              "not-enough-fund",
              intl.formatMessage({
                id: "send.input.amount.error.insufficient"
              })
            );
          }
        } else {
          clearError("amount");
        }
      } catch {
        clearError("amount");
      }
    }, [accountStore.assets, amount, clearError, denom, fee, intl, setError]);

    const recipient = watch("recipient");
    const ens = useENS(
      counterpartyChainInfo ? counterpartyChainInfo : chainStore.chainInfo,
      recipient
    );

    useEffect(() => {
      if (isValidENS(recipient)) {
        triggerValidation({ name: "recipient" });
      }
    }, [ens, recipient, triggerValidation]);

    const switchENSErrorToIntl = (e: Error) => {
      if (e instanceof InvalidENSNameError) {
        return intl.formatMessage({
          id: "send.input.recipient.error.ens-invalid-name"
        });
      } else if (e.message.includes("ENS name not found")) {
        return intl.formatMessage({
          id: "send.input.recipient.error.ens-not-found"
        });
      } else if (e instanceof ENSUnsupportedError) {
        return intl.formatMessage({
          id: "send.input.recipient.error.ens-not-supported"
        });
      } else {
        return intl.formatMessage({
          id: "sned.input.recipient.error.ens-unknown-error"
        });
      }
    };

    const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);

    const openAddressBook = useCallback(() => {
      setIsAddressBookOpen(true);
    }, []);

    const closeAddressBook = useCallback(() => {
      setIsAddressBookOpen(false);
    }, []);

    const onSelectAddressBook = useCallback(
      (data: AddressBookData) => {
        closeAddressBook();
        setValue("recipient", data.address);
        setValue("memo", data.memo);
      },
      [closeAddressBook, setValue]
    );

    return (
      <HeaderLayout
        showChainName
        canChangeChainInfo={false}
        onBackButton={() => {
          history.goBack();
        }}
      >
        <Modal
          isOpen={isAddressBookOpen}
          backdrop={false}
          className={style.fullModal}
          wrapClassName={style.fullModal}
          contentClassName={style.fullModal}
        >
          <ModalBody className={style.fullModal}>
            <AddressBookPage
              onBackButton={closeAddressBook}
              onSelect={onSelectAddressBook}
              hideChainDropdown={true}
            />
          </ModalBody>
        </Modal>
        <form
          className={style.formContainer}
          onSubmit={e => {
            // React form hook doesn't block submitting when error is delivered outside.
            // So, jsut check if errors exists manually, and if it exists, do nothing.
            if (errors.amount && errors.amount.message) {
              e.preventDefault();
              return;
            }

            // If recipient is ENS name and ENS is loading,
            // don't send the assets before ENS is fully loaded.
            if (isValidENS(recipient) && ens.loading) {
              e.preventDefault();
              return;
            }

            handleSubmit(async (data: FormData) => {
              const coin = CoinUtils.getCoinFromDecimals(
                data.amount,
                data.denom
              );

              const recipient = isValidENS(data.recipient)
                ? ens.bech32Address
                : data.recipient;
              if (!recipient) {
                throw new Error("Fail to fetch address from ENS");
              }
              const msg = (() => {
                if (counterpartyChainInfo) {
                  const ibcPathInfo =
                    EmbedIBCPathInfo[chainStore.chainInfo.chainId][
                      counterpartyChainInfo.chainId
                    ];
                  if (!ibcPathInfo) {
                    throw new Error("Can't find ibc path info");
                  }

                  const prefixedCoin = new Coin(
                    `${ibcPathInfo.dst.portId}/${ibcPathInfo.dst.channelId}/${coin.denom}`,
                    coin.amount
                  );
                  return new MsgTransfer(
                    ibcPathInfo.src.portId,
                    ibcPathInfo.src.channelId,
                    10000000,
                    [prefixedCoin],
                    AccAddress.fromBech32(
                      accountStore.bech32Address,
                      chainStore.chainInfo.bech32Config.bech32PrefixAccAddr
                    ),
                    recipient
                  );
                } else {
                  return new MsgSend(
                    AccAddress.fromBech32(
                      accountStore.bech32Address,
                      chainStore.chainInfo.bech32Config.bech32PrefixAccAddr
                    ),
                    AccAddress.fromBech32(
                      recipient,
                      chainStore.chainInfo.bech32Config.bech32PrefixAccAddr
                    ),
                    [coin]
                  );
                }
              })();

              const config: TxBuilderConfig = {
                gas: bigInteger(gasForSendMsg),
                memo: data.memo,
                fee: data.fee as Coin
              };

              if (cosmosJS.sendMsgs) {
                await cosmosJS.sendMsgs(
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  [msg!],
                  config,
                  () => {
                    history.replace("/");
                  },
                  e => {
                    history.replace("/");
                    notification.push({
                      type: "danger",
                      content: e.toString(),
                      duration: 5,
                      canDelete: true,
                      placement: "top-center",
                      transition: {
                        duration: 0.25
                      }
                    });
                  },
                  "commit"
                );
              }
            })(e);
          }}
        >
          <div className={style.formInnerContainer}>
            <div>
              <Input
                type="text"
                style={{ position: "relative" }}
                label={intl.formatMessage({ id: "send.input.recipient" })}
                labeldeco={
                  <CounterpartyChainSelector
                    onSelect={setCounterpartyChainInfo}
                  />
                }
                name="recipient"
                text={
                  isValidENS(recipient) ? (
                    ens.loading ? (
                      <i className="fas fa-spinner fa-spin" />
                    ) : (
                      ens.bech32Address
                    )
                  ) : (
                    undefined
                  )
                }
                error={
                  (isValidENS(recipient) &&
                    ens.error &&
                    switchENSErrorToIntl(ens.error)) ||
                  (errors.recipient && errors.recipient.message)
                }
                ref={register({
                  required: intl.formatMessage({
                    id: "send.input.recipient.error.required"
                  }),
                  validate: async (value: string) => {
                    if (!isValidENS(value)) {
                      try {
                        const chainInfo = counterpartyChainInfo
                          ? counterpartyChainInfo
                          : chainStore.chainInfo;

                        AccAddress.fromBech32(
                          value,
                          chainInfo.bech32Config.bech32PrefixAccAddr
                        );
                      } catch (e) {
                        return intl.formatMessage({
                          id: "send.input.recipient.error.invalid"
                        });
                      }
                    } else {
                      if (ens.error) {
                        return ens.error.message;
                      }
                    }
                  }
                })}
                autoComplete="off"
                append={
                  <Button
                    className={style.addressBookButton}
                    color="primary"
                    type="button"
                    outline
                    onClick={openAddressBook}
                  >
                    <i className="fas fa-address-book" />
                  </Button>
                }
              />
              <CoinInput
                currencies={getCurrencies(chainStore.chainInfo.currencies)}
                label={intl.formatMessage({ id: "send.input.amount" })}
                balances={accountStore.assets}
                balanceText={intl.formatMessage({
                  id: "send.input-button.balance"
                })}
                onChangeAllBanace={onChangeAllBalance}
                error={
                  (errors.amount && errors.amount.message) ||
                  (errors.denom && errors.denom.message)
                }
                input={{
                  name: "amount",
                  ref: register({
                    required: intl.formatMessage({
                      id: "send.input.amount.error.required"
                    }),
                    validate: () => {
                      // Without this, react-form-hooks clears the errors added manually when validating.
                      // So, re-validation per onChange will clear the errors related to amount.
                      // To avoid this problem, jsut return the previous error when validating.
                      // This is not good solution.
                      // TODO: Make the process that checks that a user has enough assets be better.
                      return errors?.amount?.message;
                    }
                  })
                }}
                select={{
                  name: "denom",
                  ref: register({
                    required: intl.formatMessage({
                      id: "send.input.amount.error.required"
                    })
                  })
                }}
              />
              <TextArea
                label={intl.formatMessage({ id: "send.input.memo" })}
                name="memo"
                rows={2}
                style={{ resize: "none" }}
                error={errors.memo && errors.memo.message}
                ref={register({ required: false })}
              />
              <FormContext {...formMethods}>
                <FeeButtons
                  label={intl.formatMessage({ id: "send.input.fee" })}
                  feeSelectLabels={{
                    low: intl.formatMessage({ id: "fee-buttons.select.low" }),
                    average: intl.formatMessage({
                      id: "fee-buttons.select.average"
                    }),
                    high: intl.formatMessage({ id: "fee-buttons.select.high" })
                  }}
                  name="fee"
                  error={errors.fee && errors.fee.message}
                  currency={feeCurrency!}
                  gasPriceStep={DefaultGasPriceStep}
                  gas={gasForSendMsg}
                />
              </FormContext>
            </div>
            <div style={{ flex: 1 }} />
            <Button
              type="submit"
              color="primary"
              block
              data-loading={cosmosJS.loading}
              disabled={cosmosJS.sendMsgs == null}
            >
              {intl.formatMessage({
                id: "send.button.send"
              })}
            </Button>
          </div>
        </form>
      </HeaderLayout>
    );
  }
);
