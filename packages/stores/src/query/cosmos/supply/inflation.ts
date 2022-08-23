import { computed, makeObservable } from "mobx";
import { Dec, DecUtils, Int, IntPretty } from "@keplr-wallet/unit";
import { ObservableQuerySupplyTotal } from "./supply";
import { MintingInflation } from "./types";
import { ObservableChainQuery } from "../../chain-query";
import { ChainGetter } from "../../../common";
import { ObservableQueryIrisMintingInfation } from "./iris-minting";
import { ObservableQuerySifchainLiquidityAPY } from "./sifchain";
import {
  ObservableQueryOsmosisEpochProvisions,
  ObservableQueryOsmosisEpochs,
  ObservableQueryOsmosisMintParmas,
} from "./osmosis";
import { ObservableQueryDistributionParams } from "../distribution";
import { ObservableQueryStakingPool } from "../staking";
import { ObservableQueryJunoAnnualProvisions } from "./juno/annual-provisions";

export class ObservableQueryInflation {
  constructor(
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly _queryMint: ObservableChainQuery<MintingInflation>,
    protected readonly _queryPool: ObservableQueryStakingPool,
    protected readonly _querySupplyTotal: ObservableQuerySupplyTotal,
    protected readonly _queryIrisMint: ObservableQueryIrisMintingInfation,
    protected readonly _querySifchainAPY: ObservableQuerySifchainLiquidityAPY,
    protected readonly _queryOsmosisEpochs: ObservableQueryOsmosisEpochs,
    protected readonly _queryOsmosisEpochProvisions: ObservableQueryOsmosisEpochProvisions,
    protected readonly _queryOsmosisMintParams: ObservableQueryOsmosisMintParmas,
    protected readonly _queryJunoAnnualProvisions: ObservableQueryJunoAnnualProvisions,
    protected readonly _queryDistributionParams: ObservableQueryDistributionParams
  ) {
    makeObservable(this);
  }

  get error() {
    return (
      this._queryMint.error ??
      this._queryPool.error ??
      this._querySupplyTotal.getQueryStakeDenom().error
    );
  }

  get isFetching() {
    return (
      this._queryMint.isFetching ||
      this._queryPool.isFetching ||
      this._querySupplyTotal.getQueryStakeDenom().isFetching
    );
  }

  // Return an inflation as `IntPrety`.
  // If the staking pool info is fetched, this will consider this info for calculating the more accurate value.
  @computed
  get inflation(): IntPretty {
    // TODO: Use `RatePretty`

    try {
      let dec: Dec | undefined;

      // XXX: Hard coded part for the iris hub and sifchain.
      // TODO: Remove this part.
      const chainInfo = this.chainGetter.getChain(this.chainId);
      if (chainInfo.chainId.startsWith("irishub")) {
        dec = new Dec(
          this._queryIrisMint.response?.data.result.inflation ?? "0"
        ).mul(DecUtils.getPrecisionDec(2));
      } else if (chainInfo.chainId.startsWith("sifchain")) {
        return new IntPretty(
          new Dec(this._querySifchainAPY.liquidityAPY.toString())
        );
      } else if (chainInfo.chainId.startsWith("osmosis")) {
        /*
          XXX: Temporary and unfinished implementation for the osmosis staking APY.
               Osmosis has different minting method.
               It mints the fixed token per epoch with deduction feature on the range of epoch.
               And, it actually doesn't mint the token, it has the locked token that will be inflated.
               So, currently, using the result of `supply total` to calculate the APY is actually not valid
               because it included the locked token that is not yet inflated.
               So, for now, just assume that the curreny supply is 100,000,000.
         */
        const mintParams = this._queryOsmosisMintParams;
        if (mintParams.epochIdentifier) {
          const epochDuration = this._queryOsmosisEpochs.getEpoch(
            mintParams.epochIdentifier
          ).duration;
          if (epochDuration) {
            const epochProvision = this._queryOsmosisEpochProvisions
              .epochProvisions;
            if (
              epochProvision &&
              this._querySupplyTotal.getQueryStakeDenom().response
            ) {
              const mintingEpochProvision = new Dec(
                epochProvision
                  .toDec()
                  .mul(mintParams.distributionProportions.staking)
                  .truncate()
                  .toString()
              );
              const yearMintingProvision = mintingEpochProvision.mul(
                new Dec(((365 * 24 * 3600) / epochDuration).toString())
              );
              const total = DecUtils.getPrecisionDec(8);
              dec = yearMintingProvision
                .quo(total)
                .mul(DecUtils.getPrecisionDec(2));
            }
          }
        }
      } else if (chainInfo.chainId.startsWith("juno")) {
        // In juno, the actual supply on chain and the supply recognized by the community are different.
        // I don't know why, but it's annoying to deal with this problem.
        if (
          this._queryJunoAnnualProvisions.annualProvisionsRaw &&
          this._queryPool.response
        ) {
          const bondedToken = new Dec(
            this._queryPool.response.data.pool.bonded_tokens
          );

          const dec = this._queryJunoAnnualProvisions.annualProvisionsRaw
            .quo(bondedToken)
            .mul(
              new Dec(1).sub(this._queryDistributionParams.communityTax.toDec())
            )
            .mul(DecUtils.getTenExponentN(2));

          return new IntPretty(dec);
        }
      } else {
        dec = new Dec(this._queryMint.response?.data.inflation ?? "0").mul(
          DecUtils.getPrecisionDec(2)
        );
      }

      if (!dec || dec.equals(new Dec(0))) {
        return new IntPretty(new Int(0)).ready(false);
      }

      if (
        this._queryPool.response &&
        this._querySupplyTotal.getQueryStakeDenom().response
      ) {
        const bondedToken = new Dec(
          this._queryPool.response.data.pool.bonded_tokens
        );

        const totalStr = (() => {
          if (chainInfo.chainId.startsWith("osmosis")) {
            // For osmosis, for now, just assume that the current supply is 100,000,000 with 6 decimals.
            return DecUtils.getPrecisionDec(8 + 6).toString();
          }

          return this._querySupplyTotal.getQueryStakeDenom().response!.data
            .amount.amount;
        })();
        const total = new Dec(totalStr);
        if (total.gt(new Dec(0))) {
          // staking APR is calculated as:
          //   new_coins_per_year = inflation_pct * total_supply * (1 - community_pool_tax)
          //   apr = new_coins_per_year / total_bonded_tokens

          const ratio = bondedToken.quo(total);
          dec = dec
            .mul(
              new Dec(1).sub(this._queryDistributionParams.communityTax.toDec())
            )
            .quo(ratio);
          // TODO: Rounding?
        }
      }

      return new IntPretty(dec);
    } catch (e) {
      console.log(e);
      // XXX: There have been reported errors regarding Sifchain.
      // However, I wasn’t able to reproduce the error so exact cause haven’t been identified.
      // For now, use try-catch on suspect parts to resolve the issue. Will be on a lookout for a more permanent solution in the future.

      return new IntPretty(new Int(0)).ready(false);
    }
  }
}
