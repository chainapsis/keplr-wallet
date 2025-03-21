import React, { FunctionComponent } from "react";
import { GuideBox } from "../../../../components/guide-box";

export const WarningBox: FunctionComponent<{
  isUnableToGetUTXOs?: boolean;
  isPartialSign?: boolean;
  isUnableToSign?: boolean;
}> = ({ isUnableToGetUTXOs, isPartialSign, isUnableToSign }) => {
  if (!isPartialSign && !isUnableToSign && !isUnableToGetUTXOs) {
    return null;
  }

  const title = isUnableToGetUTXOs
    ? "Unable to get UTXOs"
    : isPartialSign
    ? "Not all inputs belong to this wallet"
    : "None of the inputs belong to this wallet";

  // TODO: intl 적용 필요, unable to get utxos 오류 메시지 적절하게 변경 필요
  const paragraph = isUnableToGetUTXOs
    ? "Temporary error. Please try again later."
    : isPartialSign
    ? "This transaction contains inputs from addresses that do not belong to this wallet. Only input belonging to this wallet will be signed."
    : "For security reasons, signing is allowed only if an input includes this wallet’s address. Contact the dApp team for assistance.";

  return <GuideBox color="warning" title={title} paragraph={paragraph} />;
};
