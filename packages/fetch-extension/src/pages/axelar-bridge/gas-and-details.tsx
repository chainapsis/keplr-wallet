/* eslint-disable import/no-extraneous-dependencies */
import { AxelarQueryAPI } from "@axelar-network/axelarjs-sdk";
import { useNotification } from "@components/notification";
import { formatAmount } from "@utils/format";
import React, { useCallback, useEffect, useState } from "react";
import { TooltipForDomainNames } from "../fetch-name-service/domain-details";
import style from "./style.module.scss";

interface GasAndDetailsProps {
  transferChain: any;
  recieverChain: any;
  transferToken: any;
  depositAddress: any;
  estimatedWaitTime: number | undefined;
  relayerFee: string;
  setRelayerFee: any;
}

export const GasAndDetails: React.FC<GasAndDetailsProps> = ({
  transferChain,
  recieverChain,
  transferToken,
  depositAddress,
  estimatedWaitTime,
  relayerFee,
  setRelayerFee,
}) => {
  const notification = useNotification();
  const [maxTrsnferAmt, setMaxTrsnferAmt] = useState("");
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const axelarQuery = new AxelarQueryAPI({
    environment: transferChain.environment,
  });

  const copyAddress = useCallback(
    async (address: string) => {
      await navigator.clipboard.writeText(address);
      notification.push({
        placement: "top-center",
        type: "success",
        duration: 5,
        content: "deposit Tokens to the copied address or send from below",
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    },
    [notification]
  );
  //query max transfer amount
  const maxTransferAmount = async (
    fromChainId: string,
    toChainId: string,
    denom: string
  ) => {
    const amount = await axelarQuery.getTransferLimit({
      fromChainId,
      toChainId,
      denom,
    });
    if (!amount) setMaxTrsnferAmt("Not Provided");
    else {
      const amountString = (
        parseFloat(amount) /
        10 ** transferToken.decimals
      ).toFixed(4);
      setMaxTrsnferAmt(`${amountString} ${transferToken.assetSymbol}`);
    }
  };

  //query relayer fees
  const getTransferFee = async (
    currentChain: string,
    destinationChain: string,
    denom: string
  ) => {
    const fee = await axelarQuery.getTransferFee(
      currentChain,
      destinationChain,
      denom,
      0
    );
    const feeAmt: any = fee.fee?.amount || 0;
    if (!feeAmt) setRelayerFee("Not Provided");
    else {
      const amountString = (
        parseFloat(feeAmt) /
        10 ** transferToken.decimals
      ).toFixed(4);
      setRelayerFee(`${amountString} ${transferToken.assetSymbol}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        await maxTransferAmount(
          transferChain?.id,
          recieverChain?.id,
          transferToken.common_key
        );
        await getTransferFee(
          transferChain.id,
          recieverChain.id,
          transferToken.common_key
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [transferToken, recieverChain]);
  return (
    <div className={style["feeContainer"]}>
      <div className={style["entries"]}>
        <div>Relayer Gas fee</div>
        {isFetching ? (
          <div>
            <i className="fas fa-spinner fa-spin ml-2" />
          </div>
        ) : (
          <div>{relayerFee ? relayerFee : "Not Available"}</div>
        )}
      </div>

      <div className={style["entries"]}>
        <div>Estimated wait time</div>
        {isFetching ? (
          <div>
            <i className="fas fa-spinner fa-spin ml-2" />
          </div>
        ) : (
          <div>
            {estimatedWaitTime
              ? `~${estimatedWaitTime} Minutes`
              : " Not Available"}
          </div>
        )}
      </div>

      <div className={style["entries"]}>
        <div>Maximum Transfer Amount</div>
        {isFetching ? (
          <div>
            <i className="fas fa-spinner fa-spin ml-2" />
          </div>
        ) : (
          <div>
            {maxTrsnferAmt && maxTrsnferAmt !== "Not Provided"
              ? formatAmount(maxTrsnferAmt)
              : "Not Provided"}
          </div>
        )}
      </div>
      {depositAddress ? (
        <div className={style["entries"]}>
          <div>Deposit Address</div>
          <div
            style={{ cursor: "pointer" }}
            onClick={() => copyAddress(depositAddress)}
          >
            {<TooltipForDomainNames domainName={depositAddress} />}
          </div>
        </div>
      ) : null}
    </div>
  );
};
