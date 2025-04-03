import React, { FunctionComponent } from "react";
import { GuideBox } from "../../../../components/guide-box";
import { useIntl } from "react-intl";

export const BitcoinGuideBox: FunctionComponent<{
  isUnableToGetUTXOs?: boolean;
  isPartialSign?: boolean;
  isUnableToSign?: boolean;
  criticalValidationError?: Error;
}> = ({
  isUnableToGetUTXOs,
  isPartialSign,
  isUnableToSign,
  criticalValidationError,
}) => {
  const intl = useIntl();

  if (
    !isPartialSign &&
    !isUnableToSign &&
    !isUnableToGetUTXOs &&
    !criticalValidationError
  ) {
    return null;
  }

  const titleId = criticalValidationError
    ? "components.bitcoin-guide-box.title.critical-validation-error"
    : isUnableToGetUTXOs
    ? "components.bitcoin-guide-box.title.unable-to-get-utxos"
    : isUnableToSign
    ? "components.bitcoin-guide-box.title.none-of-the-inputs-belong-to-this-wallet"
    : "components.bitcoin-guide-box.title.partial-signing";

  const paragraphId = isUnableToGetUTXOs
    ? "components.bitcoin-guide-box.paragraph.unable-to-get-utxos"
    : isUnableToSign
    ? "components.bitcoin-guide-box.paragraph.none-of-the-inputs-belong-to-this-wallet"
    : "components.bitcoin-guide-box.paragraph.partial-signing";

  return (
    <GuideBox
      color={
        isUnableToGetUTXOs || criticalValidationError ? "warning" : "default"
      }
      title={intl.formatMessage({ id: titleId })}
      paragraph={
        criticalValidationError
          ? criticalValidationError.message
          : intl.formatMessage({ id: paragraphId })
      }
    />
  );
};
