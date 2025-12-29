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
    const { analyticsStore, chainStore } = useStore();
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

    const displaySuffix: string | undefined = (() => {
      if ("nameServiceResult" in recipientConfig) {
        const r = recipientConfig.nameServiceResult;
        if (r.length > 0) {
          const currentValue = recipientConfig.value;
          const suffix = r[0].suffix;

          const i = currentValue.lastIndexOf(".");
          if (i >= 0) {
            const tld = currentValue.slice(i + 1);
            if (currentValue.endsWith("." + suffix)) {
              return undefined;
            }
            if (suffix.startsWith(tld) && suffix !== tld) {
              return suffix.replace(tld, "");
            }
            return undefined;
          }

          return "." + suffix;
        }
      }
      return undefined;
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
                if (
                  icns?.isEnabled &&
                  chainStore.getChain(recipientConfig.chainId).bech32Config !=
                    null &&
                  ens?.isEnabled &&
                  chainStore.isEvmChain(recipientConfig.chainId)
                ) {
                  return "components.input.recipient-input.wallet-address-label-icns-ens";
                }
                if (
                  ens?.isEnabled &&
                  chainStore.isEvmChain(recipientConfig.chainId)
                ) {
                  return "components.input.recipient-input.wallet-address-label-ens";
                }
              }
              return "components.input.recipient-input.wallet-address-label";
            })(),
          })}
          value={recipientConfig.value}
          suffix={displaySuffix}
          autoComplete="off"
          onChange={(e) => {
            const newValue = e.target.value;
            const previousValue = recipientConfig.value;

            const isDeleting = newValue.length < previousValue.length;

            if ("nameServiceResult" in recipientConfig) {
              const r = recipientConfig.nameServiceResult;

              if (isDeleting) {
                if (r.length > 0) {
                  const currentValue = recipientConfig.value;
                  const suffix = r[0].suffix;
                  const fullSuffix = "." + suffix;

                  if (currentValue.endsWith(fullSuffix)) {
                    // Only remove suffix if newValue doesn't end with "." + suffix
                    // This means user explicitly deleted the suffix
                    if (!newValue.endsWith(fullSuffix)) {
                      const baseValue = currentValue.slice(
                        0,
                        -fullSuffix.length
                      );
                      recipientConfig.setValue(baseValue);
                      return;
                    }
                    // If newValue still ends with "." + suffix, user deleted text before it
                    // Let the normal flow handle it (suffix will be preserved)
                  }
                }
              } else if (displaySuffix && !isDeleting) {
                if (r.length > 0) {
                  const suffix = r[0].suffix;

                  if (
                    !previousValue.includes(".") &&
                    newValue.endsWith(".") &&
                    newValue.length === previousValue.length + 1
                  ) {
                    // User just typed ".", complete with suffix (e.g., "alice." -> "alice.icns")
                    const completedValue = newValue + suffix;
                    recipientConfig.setValue(completedValue);
                    return;
                  }
                }
              }
            }

            recipientConfig.setValue(newValue);
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
