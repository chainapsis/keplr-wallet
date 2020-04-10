import React, { FunctionComponent, useEffect } from "react";
import { HeaderLayout } from "../../../layouts/header-layout";
import { Input, TextArea } from "../../../../components/form";
import { Button } from "reactstrap";
import useForm from "react-hook-form";
import { AddressBookData } from "./types";
import { AddressBookKVStore } from "./kvStore";
import { ChainInfo } from "../../../../../background/chains";
import { AccAddress } from "@everett-protocol/cosmosjs/common/address";
import {
  ENSUnsupportedError,
  InvalidENSNameError,
  isValidENS,
  useENS
} from "../../../../hooks/use-ens";
import { FormattedMessage, useIntl } from "react-intl";

/**
 *
 * @param closeModal
 * @param addAddressBook
 * @param chainInfo
 * @param index If index is lesser than 0, it is considered as adding address book. If index is equal or greater than 0, it is considered as editing address book.
 * @param addressBookKVStore
 * @constructor
 */
export const AddAddressModal: FunctionComponent<{
  closeModal: () => void;
  addAddressBook: (data: AddressBookData) => void;
  chainInfo: ChainInfo;
  index: number;
  addressBookKVStore: AddressBookKVStore;
}> = ({ closeModal, addAddressBook, chainInfo, index, addressBookKVStore }) => {
  const intl = useIntl();
  const form = useForm<AddressBookData>({
    defaultValues: {
      name: "",
      address: "",
      memo: ""
    }
  });

  const {
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
    triggerValidation
  } = form;

  const address = watch("address");
  const ens = useENS(chainInfo, address);

  useEffect(() => {
    if (isValidENS(address)) {
      triggerValidation({ name: "address" });
    }
  }, [ens, address, triggerValidation]);

  const switchENSErrorToIntl = (e: Error) => {
    if (e instanceof InvalidENSNameError) {
      return intl.formatMessage({
        id: "send.input.recipient.error.ens-invalid-name"
      });
    } else if (e.message.includes("ENS name not found")) {
      return intl.formatMessage({
        id: "send.input.recipient.error.ens-not-found"
      });
    } else if (e instanceof ENSUnsupportedError) {
      return intl.formatMessage({
        id: "send.input.recipient.error.ens-not-supported"
      });
    } else {
      return intl.formatMessage({
        id: "sned.input.recipient.error.ens-unknown-error"
      });
    }
  };

  useEffect(() => {
    if (index >= 0) {
      addressBookKVStore.getAddressBook(chainInfo).then(datas => {
        const data = datas[index];
        setValue("name", data.name);
        setValue("address", data.address);
        setValue("memo", data.memo);
      });
    }
  }, [addressBookKVStore, chainInfo, index, setValue]);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={
        index >= 0
          ? intl.formatMessage({
              id: "setting.address-book.edit-address.title"
            })
          : intl.formatMessage({
              id: "setting.address-book.add-address.title"
            })
      }
      onBackButton={closeModal}
    >
      <form
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
        onSubmit={e => {
          // If recipient is ENS name and ENS is loading,
          // don't send the assets before ENS is fully loaded.
          if (isValidENS(address) && ens.loading) {
            e.preventDefault();
            return;
          }

          return handleSubmit(data => {
            addAddressBook(data);
          })(e);
        }}
      >
        <Input
          type="text"
          label={intl.formatMessage({ id: "setting.address-book.name" })}
          name="name"
          error={errors.name?.message}
          ref={register({
            required: intl.formatMessage({
              id: "setting.address-book.name.error.required"
            })
          })}
          autoComplete="off"
        />
        <Input
          type="text"
          label={intl.formatMessage({ id: "setting.address-book.address" })}
          name="address"
          text={
            isValidENS(address) ? (
              ens.loading ? (
                <i className="fas fa-spinner fa-spin" />
              ) : (
                ens.bech32Address
              )
            ) : (
              undefined
            )
          }
          error={
            (isValidENS(address) &&
              ens.error &&
              switchENSErrorToIntl(ens.error)) ||
            (errors.address && errors.address.message)
          }
          ref={register({
            required: intl.formatMessage({
              id: "setting.address-book.address.error.required"
            }),
            validate: (value: string) => {
              if (!isValidENS(value)) {
                try {
                  AccAddress.fromBech32(
                    value,
                    chainInfo.bech32Config.bech32PrefixAccAddr
                  );
                } catch (e) {
                  return intl.formatMessage({
                    id: "setting.address-book.address.error.invalid"
                  });
                }
              } else {
                if (ens.error) {
                  return ens.error.message;
                }
              }
            }
          })}
          autoComplete="off"
        />
        <TextArea
          label={intl.formatMessage({ id: "setting.address-book.memo" })}
          name="memo"
          error={errors.memo?.message}
          ref={register({ required: false })}
          autoComplete="off"
        />
        <div style={{ flex: 1 }} />
        <Button type="submit" color="primary">
          <FormattedMessage id={"setting.address-book.button.save"} />
        </Button>
      </form>
    </HeaderLayout>
  );
};
