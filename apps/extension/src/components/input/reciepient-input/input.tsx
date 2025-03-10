import React from "react";
import { TextInput } from "../text-input";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  IMemoConfig,
  IRecipientConfig,
  IRecipientConfigWithNameServices,
} from "@keplr-wallet/hooks";
import { ProfileIcon } from "../../icon";
import { Box } from "../../box";
import { AddressBookModal } from "../../address-book-modal";
import { IconButton } from "../../icon-button";
import { ColorPalette } from "../../../styles";
import { useStore } from "../../../stores";
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { AppCurrency } from "@keplr-wallet/types";

export interface RecipientInputWithAddressBookProps {
  historyType: string;
  recipientConfig: IRecipientConfig | IRecipientConfigWithNameServices;
  memoConfig: IMemoConfig;
  currency: AppCurrency;

  permitAddressBookSelfKeyInfo?: boolean;
}

export interface RecipientInputWithoutAddressBookProps {
  recipientConfig: IRecipientConfig | IRecipientConfigWithNameServices;
  memoConfig?: undefined;

  hideAddressBookButton: true;
}

export type RecipientInputProps = (
  | RecipientInputWithAddressBookProps
  | RecipientInputWithoutAddressBookProps
) & {
  bottom?: React.ReactNode;
};

export const RecipientInput = observer<RecipientInputProps, HTMLInputElement>(
  (props, ref) => {
    const { analyticsStore } = useStore();
    const intl = useIntl();
    const theme = useTheme();
    const { recipientConfig, memoConfig } = props;

    const [isAddressBookModalOpen, setIsAddressBookModalOpen] =
      React.useState(false);

    const isFetching = (() => {
      if ("getNameServices" in recipientConfig) {
        return recipientConfig
          .getNameServices()
          .some((ns) => ns.isEnabled && ns.isFetching);
      }

      return false;
    })();

    return (
      <Box>
        <TextInput
          ref={ref}
          label={intl.formatMessage({
            id: (() => {
              if ("getNameService" in recipientConfig) {
                const icns = recipientConfig.getNameService("icns");
                const ens = recipientConfig.getNameService("ens");
                if (icns?.isEnabled && ens?.isEnabled) {
                  return "components.input.recipient-input.wallet-address-label-icns-ens";
                }
                if (ens?.isEnabled) {
                  return "components.input.recipient-input.wallet-address-label-ens";
                }
              }
              return "components.input.recipient-input.wallet-address-label";
            })(),
          })}
          value={recipientConfig.value}
          textSuffix={(() => {
            if ("nameServiceResult" in recipientConfig) {
              const r = recipientConfig.nameServiceResult;
              if (r.length > 0) {
                if (!recipientConfig.value.endsWith("." + r[0].suffix)) {
                  return "." + r[0].suffix;
                }
              }
            }
          })()}
          autoComplete="off"
          onChange={(e) => {
            recipientConfig.setValue(e.target.value);

            e.preventDefault();
          }}
          right={
            memoConfig ? (
              <IconButton
                onClick={() => {
                  analyticsStore.logEvent("click_addressBookButton");
                  setIsAddressBookModalOpen(true);
                }}
                hoverColor={
                  theme.mode === "light"
                    ? ColorPalette["gray-50"]
                    : ColorPalette["gray-500"]
                }
                padding="0.25rem"
              >
                <ProfileIcon width="1.5rem" height="1.5rem" />
              </IconButton>
            ) : null
          }
          isLoading={isFetching}
          paragraph={(() => {
            if ("nameServiceResult" in recipientConfig) {
              const r = recipientConfig.nameServiceResult;
              if (r.length > 0) {
                return r[0].address;
              }
            }
          })()}
          bottom={props.bottom}
          error={(() => {
            const uiProperties = recipientConfig.uiProperties;

            const err = uiProperties.error || uiProperties.warning;

            if (err instanceof EmptyAddressError) {
              return;
            }

            if (err) {
              return err.message || err.toString();
            }
          })()}
        />

        {memoConfig ? (
          <AddressBookModal
            isOpen={isAddressBookModalOpen}
            close={() => setIsAddressBookModalOpen(false)}
            historyType={props.historyType}
            recipientConfig={recipientConfig}
            memoConfig={memoConfig}
            currency={props.currency}
            permitSelfKeyInfo={props.permitAddressBookSelfKeyInfo}
          />
        ) : null}
      </Box>
    );
  },
  {
    forwardRef: true,
  }
);
