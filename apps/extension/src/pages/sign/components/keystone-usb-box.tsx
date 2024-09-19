import React, { FunctionComponent } from "react";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { Gutter } from "../../../components/gutter";
import { GuideBox } from "../../../components/guide-box";
import { useIntl } from "react-intl";

export const KeystoneUSBBox: FunctionComponent<{
  isKeystoneInteracting: boolean;
  KeystoneInteractingError: Error | undefined;
}> = ({ isKeystoneInteracting, KeystoneInteractingError }) => {
  const intl = useIntl();
  return (
    <VerticalCollapseTransition
      collapsed={!isKeystoneInteracting && KeystoneInteractingError == null}
      transitionAlign="bottom"
    >
      <Gutter size="0.75rem" />
      {(() => {
        if (KeystoneInteractingError) {
          return (
            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: "page.sign.components.ledger-guide.box.unknown-error-title",
              })}
              paragraph={
                KeystoneInteractingError.message ||
                KeystoneInteractingError.toString()
              }
            />
          );
        }

        return (
          <GuideBox
            color="default"
            title={intl.formatMessage({
              id: "page.sign.components.ledger-guide.box.sign-on-ledger-title",
            })}
            paragraph={intl.formatMessage({
              id: "page.sign.components.ledger-guide.box.sign-on-ledger-paragraph",
            })}
          />
        );
      })()}
    </VerticalCollapseTransition>
  );
};
