import React, { FunctionComponent } from "react";
import { GuideBox } from "../../../../components/guide-box";

export const BitcoinGuideBox: FunctionComponent<{
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
    ? "Partial Signing"
    : "None of the inputs belong to this wallet";

  // TODO: intl 적용 필요, unable to get utxos 오류 메시지 적절하게 변경 필요
  const paragraph = isUnableToGetUTXOs
    ? "Temporary error. Please try again later."
    : isPartialSign
    ? "You are signing part of the transaction. Only the inputs from this wallet will be signed."
    : "For security reasons, signing is allowed only if an input belongs to this wallet.";

  return (
    <GuideBox
      color={isUnableToGetUTXOs ? "warning" : "default"}
      title={title}
      paragraph={paragraph}
    />
  );
};
