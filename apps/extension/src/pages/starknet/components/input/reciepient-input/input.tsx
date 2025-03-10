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
