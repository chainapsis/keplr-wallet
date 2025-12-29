import React from "react";
import { TextInput } from "../../../../../components/input";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  IRecipientConfig,
  IRecipientConfigWithNameServices,
} from "@keplr-wallet/hooks-starknet";
import { ProfileIcon } from "../../../../../components/icon";
import { Box } from "../../../../../components/box";
import { AddressBookModal } from "../../address-book-modal";
import { IconButton } from "../../../../../components/icon-button";
import { ColorPalette } from "../../../../../styles";
import { useStore } from "../../../../../stores";
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";

export interface RecipientInputWithAddressBookProps {
  historyType: string;
  recipientConfig: IRecipientConfig | IRecipientConfigWithNameServices;

  permitAddressBookSelfKeyInfo?: boolean;
}

export interface RecipientInputWithoutAddressBookProps {
  recipientConfig: IRecipientConfig;

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
    const { recipientConfig } = props;

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

    const isStarknetIDEnabled: boolean = (() => {
      if ("getNameService" in recipientConfig) {
        const starknetId = recipientConfig.getNameService("starknet-id");
        if (starknetId?.isEnabled) {
          return true;
        }
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
            id: isStarknetIDEnabled
              ? "components.input.recipient-input.wallet-address-label-starknet.id"
              : "components.input.recipient-input.wallet-address-only-label",
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
                    // User just typed ".", complete with suffix (e.g., "stark." -> "stark.stark")
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
            "historyType" in props ? (
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

        {"historyType" in props ? (
          <AddressBookModal
            isOpen={isAddressBookModalOpen}
            close={() => setIsAddressBookModalOpen(false)}
            historyType={props.historyType}
            recipientConfig={recipientConfig}
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
