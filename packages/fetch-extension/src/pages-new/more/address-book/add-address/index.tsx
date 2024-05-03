import React, { FunctionComponent, useEffect, useState } from "react";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { AddressInput, Input, MemoInput } from "@components-v2/form";
import { Label } from "reactstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { observer } from "mobx-react-lite";
import {
  AddressBookConfig,
  MemoConfig,
  RecipientConfig,
} from "@keplr-wallet/hooks";
import { useLocation } from "react-router";
import { chatSectionParams, defaultParamValues } from "../index";
import { useNotification } from "@components/notification";
import { validateAgentAddress } from "@utils/validate-agent";
import style from "../style.module.scss";
import { ButtonV2 } from "@components-v2/buttons/button";
/**
 *
 * @param closeModal
 * @param addAddressBook
 * @param chainInfo
 * @param index If index is lesser than 0, it is considered as adding address book. If index is equal or greater than 0, it is considered as editing address book.
 * @param addressBookKVStore
 * @constructor
 */
export const AddAddress: FunctionComponent<{
  closeModal: () => void;
  recipientConfig: RecipientConfig;
  memoConfig: MemoConfig;
  addressBookConfig: AddressBookConfig;
  index: number;
  chainId: string;
}> = observer(
  ({ closeModal, recipientConfig, memoConfig, addressBookConfig, index }) => {
    const intl = useIntl();
    const [name, setName] = useState("");
    const location = useLocation();
    const notification = useNotification();

    const chatSectionParams =
      (location.state as chatSectionParams) || defaultParamValues;
    useEffect(() => {
      if (index >= 0) {
        const data = addressBookConfig.addressBookDatas[index];
        setName(data.name);
        recipientConfig.setRawRecipient(data.address);
        memoConfig.setMemo(data.memo);
      }
    }, [
      addressBookConfig.addressBookDatas,
      index,
      memoConfig,
      recipientConfig,
    ]);

    return (
      <HeaderLayout
        smallTitle={true}
        showTopMenu={true}
        showBottomMenu={true}
        showChainName={false}
        canChangeChainInfo={false}
        alternativeTitle={
          index >= 0
            ? intl.formatMessage({
                id: "setting.address-book.edit-address.title",
              })
            : intl.formatMessage({
                id: "setting.address-book.add-address.title",
              })
        }
        onBackButton={() => {
          // Clear the recipient and memo before closing
          recipientConfig.setRawRecipient("");
          memoConfig.setMemo("");
          closeModal();
        }}
      >
        <form className={style["form"]}>
          <Label className={style["label"]}>
            {intl.formatMessage({ id: "setting.address-book.name" })}
          </Label>
          <Input
            placeholder="Wallet Name"
            className={style["input"]}
            type="text"
            autoComplete="off"
            value={name}
            onChange={(e) => {
              setName(e.target.value.substring(0, 30));
            }}
          />
          <AddressInput
            recipientConfig={recipientConfig}
            label={intl.formatMessage({ id: "setting.address-book.address" })}
            disableAddressBook={true}
            value={chatSectionParams.addressInputValue}
          />
          <MemoInput
            memoConfig={memoConfig}
            label={intl.formatMessage({ id: "setting.address-book.memo" })}
          />
          <div style={{ flex: 1 }} />
          <ButtonV2
            disabled={
              !name ||
              name.trim() === "" ||
              (recipientConfig.error != null &&
                validateAgentAddress(recipientConfig.rawRecipient)) ||
              memoConfig.error != null
            }
            onClick={async (e: any) => {
              e.preventDefault();
              e.stopPropagation();

              if (!recipientConfig.recipient) {
                throw new Error("Invalid address");
              }

              /// return -1 if address not matched
              const addressIndex = addressBookConfig.addressBookDatas.findIndex(
                (element) => element.address === recipientConfig.recipient
              );

              /// Validating a new address is unique in the address book
              if (index < 0 && addressIndex < 0) {
                addressBookConfig.addAddressBook({
                  name: name.trim(),
                  address: recipientConfig.recipient,
                  memo: memoConfig.memo,
                });
              } else if (
                index >= 0 &&
                (index === addressIndex || addressIndex === -1)
              ) {
                /// Validating edit case and address is already added in the address book
                /// [addressIndex === -1] replacing old address to unique address
                /// [index === addressIndex] if the index and address index is same that means we are dealing with unique address
                addressBookConfig.editAddressBookAt(index, {
                  name: name.trim(),
                  address: recipientConfig.recipient,
                  memo: memoConfig.memo,
                });
              } else {
                notification.push({
                  placement: "top-center",
                  type: "warning",
                  duration: 2,
                  content: intl.formatMessage({
                    id: "main.menu.address-available",
                  }),
                  canDelete: true,
                  transition: {
                    duration: 0.25,
                  },
                });
                return;
              }
              // Clear the recipient and memo before closing
              recipientConfig.setRawRecipient("");
              memoConfig.setMemo("");
              closeModal();
            }}
            text={""}
          >
            <FormattedMessage id={"setting.address-book.button.save"} />
          </ButtonV2>
        </form>
      </HeaderLayout>
    );
  }
);
