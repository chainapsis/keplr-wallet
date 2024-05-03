/* eslint-disable import/no-extraneous-dependencies */
import { useNotification } from "@components/notification";
import React from "react";
import { useStore } from "../../../stores";
import { AxelarAssetTransfer } from "@axelar-network/axelarjs-sdk";
import { ButtonV2 } from "@components-v2/buttons/button";

interface GetDepositAddressProps {
  setDepositAddress: any;
  fromChain: any;
  toChain: any;
  recipentAddress: string;
  setIsFetchingAddress: any;
  transferToken: any;
  amountError: string;
}

export const GetDepositAddress: React.FC<GetDepositAddressProps> = ({
  setDepositAddress,
  fromChain,
  toChain,
  recipentAddress,
  setIsFetchingAddress,
  transferToken,

  amountError,
}) => {
  const { accountStore, chainStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const notification = useNotification();
  const assetsApi = new AxelarAssetTransfer({
    environment: fromChain.environment,
  });

  const getDepositAddress = async () => {
    try {
      setIsFetchingAddress(true);
      const address = await assetsApi.getDepositAddress({
        fromChain: fromChain.id,
        toChain: toChain.id,
        destinationAddress: recipentAddress,
        asset: transferToken.common_key,
        options: { refundAddress: accountInfo.bech32Address },
      });
      setDepositAddress(address);
      setIsFetchingAddress(false);
    } catch (err) {
      console.log("Error", err);
      notification.push({
        placement: "top-center",
        type: "warning",
        duration: 5,
        content: `Error fetching deposit address: ${err.message}`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
      setIsFetchingAddress(false);
    }
  };
  return (
    <ButtonV2
      text="Get Deposit Address"
      gradientText=""
      onClick={getDepositAddress}
      disabled={
        !(transferToken && fromChain && toChain && recipentAddress) ||
        amountError !== ""
      }
    />
  );
};
