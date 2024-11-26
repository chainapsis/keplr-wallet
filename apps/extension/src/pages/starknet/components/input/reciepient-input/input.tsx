import React from "react";
import { TextInput } from "../../../../../components/input";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  IRecipientConfig,
  IRecipientConfigWithStarknetID,
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
  recipientConfig: IRecipientConfig | IRecipientConfigWithStarknetID;

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

function numOfCharacter(str: string, c: string): number {
  return str.split(c).length - 1;
}

export const RecipientInput = observer<RecipientInputProps, HTMLInputElement>(
  (props, ref) => {
    const { analyticsStore } = useStore();
    const intl = useIntl();
    const theme = useTheme();
    const { recipientConfig } = props;

    const [isAddressBookModalOpen, setIsAddressBookModalOpen] =
      React.useState(false);

    const isStarknetIDEnabled: boolean = (() => {
      if ("isStarknetIDEnabled" in recipientConfig) {
        return recipientConfig.isStarknetIDEnabled;
      }

      return false;
    })();

    const isStarknetID: boolean = (() => {
      if ("isStarknetID" in recipientConfig) {
        return recipientConfig.isStarknetID;
      }

      return false;
    })();

    const isStarknetIDFetching: boolean = (() => {
      if ("isStarknetIDFetching" in recipientConfig) {
        return recipientConfig.isStarknetIDFetching;
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
          autoComplete="off"
          onChange={(e) => {
            let value = e.target.value;

            if (
              "isStarknetIDEnabled" in recipientConfig &&
              isStarknetIDEnabled &&
              value.length > 0 &&
              value[value.length - 1] === "." &&
              numOfCharacter(value, ".") === 1 &&
              numOfCharacter(recipientConfig.value, ".") === 0
            ) {
              value = value + recipientConfig.starknetExpectedDomain;
            }

            recipientConfig.setValue(value);

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
          isLoading={isStarknetIDFetching}
          paragraph={(() => {
            if (isStarknetID && !recipientConfig.uiProperties.error) {
              return recipientConfig.recipient;
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
