import { observer } from "mobx-react-lite";
import React, {
  Fragment,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { FormattedMessage } from "react-intl";
import { ToolTip } from "@components/tooltip";
import { useLanguage } from "../../languages";
import { useStore } from "../../stores";
import styleAsset from "./asset.module.scss";
import { TxButtonView } from "./tx-button";
import walletIcon from "@assets/icon/wallet.png";
import buyIcon from "@assets/icon/buy.png";
import { DepositView } from "./deposit";
import { DepositModal } from "./qr-code";
import { useNotification } from "@components/notification";
import { useIntl } from "react-intl";
import { WalletStatus } from "@keplr-wallet/stores";
import { store } from "@chatStore/index";
import { setHasFET } from "@chatStore/user-slice";
import { AppCurrency } from "@keplr-wallet/types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { BuySupportServiceInfo, useBuy } from "@hooks/use-buy";
import Modal from "react-modal";

import styleTxButton from "./tx-button.module.scss";
import classNames from "classnames";

export const ProgressBar = ({
  width,
  data,
}: {
  width: number;
  data: number[];
}) => {
  const [values, setValues] = useState([0, 0]);

  useEffect(() => {
    const total = data[0] + data[1] + data[2];
    const percentageAvailable = data[0] / total;
    const percentageStake = data[1] / total;
    setValues([percentageAvailable * width, percentageStake * width]);
  }, [width, data]);

  return (
    <div>
      <div className={styleAsset["progressDiv"]} style={{ width }}>
        <div
          style={{ width: `${values[0]}px` }}
          className={styleAsset["progressAvailable"]}
        />
        <div
          style={{ width: `${values[0] + values[1]}px` }}
          className={styleAsset["progressStake"]}
        />
      </div>
    </div>
  );
};

const EmptyState = ({
  chainName,
  chainId,
  denom,
}: {
  chainName: string;
  denom: string;
  chainId: string;
}) => {
  const { chainStore, accountStore } = useStore();
  // const [pubKey, setPubKey] = useState("");
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [bech32Address, setBech32Address] = useState("");
  const [walletStatus, setWalletStatus] = useState<WalletStatus>();
  // const [loading, setLoading] = useState(true);
  useEffect(() => {
    const accountInfo = accountStore.getAccount(chainId);
    setWalletStatus(accountInfo.walletStatus);
    setBech32Address(accountInfo.bech32Address);
  }, [chainId, accountStore, chainStore]);

  // TODO(!!!): Commented out this code, seems like the handling here needs a bit
  //            of work
  // useEffect(() => {
  //   const getPubKey = async () => {
  //     setLoading(true);
  //     const value = await fetchPublicKey(bech32Address);
  //     setPubKey(value || "");
  //     setLoading(false);
  //   };
  //   getPubKey();
  // }, [bech32Address]);

  const intl = useIntl();

  const notification = useNotification();

  const copyAddress = useCallback(
    async (address: string) => {
      if (walletStatus === WalletStatus.Loaded) {
        await navigator.clipboard.writeText(address);
        notification.push({
          placement: "top-center",
          type: "success",
          duration: 2,
          content: intl.formatMessage({
            id: "main.address.copied",
          }),
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
      }
    },
    [walletStatus, notification, intl]
  );

  const { buySupportServiceInfos } = useBuy();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  return (
    <div className={styleAsset["emptyState"]}>
      <DepositModal
        chainName={chainName}
        bech32Address={bech32Address}
        isDepositOpen={isDepositOpen}
        setIsDepositOpen={setIsDepositOpen}
      />

      <h1 className={styleAsset["title"]}>No funds added</h1>
      <img draggable={false} src={walletIcon} alt="no fund" />
      <p className={styleAsset["desc"]}>
        That’s okay, you can deposit tokens to your address or buy some.
      </p>
      <button
        onClick={async (e) => {
          e.preventDefault();
          await copyAddress(bech32Address);
          setIsDepositOpen(true);
        }}
      >
        Deposit {denom}
      </button>

      {/* isBuySupportChain || */}
      {chainId == "fetchhub-4" && (
        <button
          className={styleAsset["buyButton"]}
          onClick={(e) => {
            e.preventDefault();
            if (chainId == "fetchhub-4") {
              window.open("https://fetch.ai/get-fet/", "_blank");
            }
            /// It will enable buy support for other network chains
            /// Require necessary keys to support them
            // if (isBuySupportChain) {
            //   setIsBuyModalOpen(true);
            // }
          }}
        >
          <img draggable={false} src={buyIcon} alt="buy tokens" /> Buy Tokens
        </button>
      )}

      <Modal
        style={{
          content: {
            width: "330px",
            minWidth: "330px",
            minHeight: "unset",
            maxHeight: "unset",
          },
        }}
        isOpen={isBuyModalOpen}
        onRequestClose={() => {
          setIsBuyModalOpen(false);
        }}
      >
        <BuyModalContent buySupportServiceInfos={buySupportServiceInfos} />
      </Modal>
    </div>
  );
};

export const AssetView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const language = useLanguage();

  const fiatCurrency = language.fiatCurrency;

  const current = chainStore.current;

  const queries = queriesStore.get(current.chainId);

  const accountInfo = accountStore.getAccount(current.chainId);

  const balanceQuery = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );
  const balanceStakableQuery = balanceQuery.stakable;

  const isNoble =
    ChainIdHelper.parse(chainStore.current.chainId).identifier === "noble";
  const hasUSDC = chainStore.current.currencies.find(
    (currency: AppCurrency) => currency.coinMinimalDenom === "uusdc"
  );

  const stakable = (() => {
    if (isNoble && hasUSDC) {
      return balanceQuery.getBalanceFromCurrency(hasUSDC);
    }

    return balanceStakableQuery.balance;
  })();

  const delegated = queries.cosmos.queryDelegations
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const unbonding = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const stakableReward = rewards.stakableReward;

  const stakedSum = delegated.add(unbonding);

  const total = stakable.add(stakedSum).add(stakableReward);

  const stakablePrice = priceStore.calculatePrice(stakable, fiatCurrency);
  const stakedSumPrice = priceStore.calculatePrice(stakedSum, fiatCurrency);
  const stakableRewardPrice = priceStore.calculatePrice(
    stakableReward,
    fiatCurrency
  );

  const totalPrice = priceStore.calculatePrice(total, fiatCurrency);

  // If fiat value is fetched, show the value that is multiplied with amount and fiat value.
  // If not, just show the amount of asset.
  const data: number[] = [
    stakablePrice
      ? parseFloat(stakablePrice.toDec().toString())
      : parseFloat(stakable.toDec().toString()),
    stakedSumPrice
      ? parseFloat(stakedSumPrice.toDec().toString())
      : parseFloat(stakedSum.toDec().toString()),
    stakableRewardPrice
      ? parseFloat(stakableRewardPrice.toDec().toString())
      : parseFloat(stakableReward.toDec().toString()),
  ];

  const hasBalance = totalPrice
    ? !totalPrice.toDec().isZero()
    : !total.toDec().isZero();

  const hasStakableFET = stakablePrice
    ? !stakablePrice.toDec().isZero()
    : !stakable.toDec().isZero();

  store.dispatch(setHasFET(hasStakableFET));

  if (!hasBalance) {
    return (
      <EmptyState
        chainName={current.chainName}
        denom={chainStore.current.stakeCurrency.coinDenom}
        chainId={chainStore.current.chainId}
      />
    );
  }

  return (
    <Fragment>
      <div className={styleAsset["containerAsset"]}>
        <div className={styleAsset["containerChart"]}>
          <div className={styleAsset["centerText"]}>
            <div className={styleAsset["big"]}>
              <FormattedMessage id="main.account.chart.total-balance" />
            </div>
            <div
              className={styleAsset["small"]}
              style={{
                marginBottom: "20px",
              }}
            >
              {totalPrice
                ? totalPrice.toString()
                : total.shrink(true).trim(true).maxDecimals(6).toString()}
            </div>
            <div className={styleAsset["indicatorIcon"]}>
              <Fragment>
                {balanceStakableQuery.isFetching ? (
                  <i className="fas fa-spinner fa-spin" />
                ) : balanceStakableQuery.error ? (
                  <ToolTip
                    tooltip={
                      balanceStakableQuery.error?.message ||
                      balanceStakableQuery.error?.statusText
                    }
                    theme="dark"
                    trigger="hover"
                    options={{
                      placement: "top",
                    }}
                  >
                    <i className="fas fa-exclamation-triangle text-danger" />
                  </ToolTip>
                ) : null}
              </Fragment>
            </div>
          </div>
          <ProgressBar width={300} data={data} />
        </div>
        <div className={styleAsset["legendContainer"]}>
          <div className={styleAsset["legend"]}>
            <div className={styleAsset["label"]} style={{ color: "#3B82F6" }}>
              <FormattedMessage id="main.account.chart.available-balance" />
            </div>
            <div style={{ minWidth: "16px" }} />
            <div
              className={styleAsset["value"]}
              style={{
                color: "#525f7f",
              }}
            >
              {stakable.shrink(true).maxDecimals(6).toString()}
            </div>
          </div>
          <div className={styleAsset["legend"]}>
            <div className={styleAsset["label"]} style={{ color: "#11cdef" }}>
              <FormattedMessage id="main.account.chart.staked-balance" />
            </div>
            <div style={{ minWidth: "16px" }} />
            <div
              className={styleAsset["value"]}
              style={{
                color: "#525f7f",
              }}
            >
              {stakedSum.shrink(true).maxDecimals(6).toString()}
            </div>
          </div>
          {isNoble && hasUSDC ? null : (
            <div className={styleAsset["legend"]}>
              <div className={styleAsset["label"]} style={{ color: "#D43BF6" }}>
                <FormattedMessage id="main.account.chart.reward-balance" />
              </div>
              <div style={{ minWidth: "16px" }} />
              <div
                className={styleAsset["value"]}
                style={{
                  color: "#525f7f",
                }}
              >
                {stakableReward.shrink(true).maxDecimals(6).toString()}
              </div>
            </div>
          )}
        </div>
      </div>
      <TxButtonView />
      <hr className={styleAsset["hr"]} />
      <DepositView />
    </Fragment>
  );
});

export const BuyModalContent: FunctionComponent<{
  buySupportServiceInfos: BuySupportServiceInfo[];
}> = ({ buySupportServiceInfos }) => {
  return (
    <div className={styleTxButton["modalContent"]}>
      <h1 style={{ marginBottom: 0 }}>Buy Crypto</h1>
      <div className={styleTxButton["buySupportServices"]}>
        {buySupportServiceInfos.map((serviceInfo) => (
          <a
            key={serviceInfo.serviceId}
            href={serviceInfo.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={classNames(styleTxButton["service"], {
              [styleTxButton["disabled"]]: !serviceInfo.buyUrl,
            })}
            onClick={(e) => !serviceInfo.buyUrl && e.preventDefault()}
          >
            <div className={styleTxButton["serviceLogoContainer"]}>
              <img
                src={require(`../../public/assets/img/fiat-on-ramp/${serviceInfo.serviceId}.svg`)}
              />
            </div>
            <div className={styleTxButton["serviceName"]}>
              {serviceInfo.serviceName}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
