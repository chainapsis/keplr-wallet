/* eslint-disable import/no-extraneous-dependencies */
import { useNotification } from "@components/notification";
import React from "react";
import { Button } from "reactstrap";
import { useStore } from "../../../stores";
import { AxelarAssetTransfer } from "@axelar-network/axelarjs-sdk";

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
  const { accountStore, chainStore, analyticsStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const notification = useNotification();
  const assetsApi = new AxelarAssetTransfer({
    environment: fromChain.environment,
  });

  const getDepositAddress = async () => {
    try {
      analyticsStore.logEvent("get_deposit_address_click");
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
      analyticsStore.logEvent("get_deposit_address_txn_success", {
        chainId: chainStore.current.chainId,
        chainName: chainStore.current.chainName,
      });
    } catch (err) {
      analyticsStore.logEvent("get_deposit_address_txn_fail", {
        chainId: chainStore.current.chainId,
        chainName: chainStore.current.chainName,
        message: err?.message ?? "",
      });
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
    <Button
      type="submit"
      color="primary"
      style={{ width: "100%" }}
      onClick={getDepositAddress}
      disabled={
        !(transferToken && fromChain && toChain && recipentAddress) ||
        amountError !== ""
      }
    >
      Get Deposit Address
    </Button>
  );
};
