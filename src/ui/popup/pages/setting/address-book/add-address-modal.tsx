import React, { FunctionComponent, useEffect } from "react";
import { HeaderLayout } from "../../../layouts/header-layout";
import { Input, TextArea } from "../../../../components/form";
import { Button } from "reactstrap";
import useForm from "react-hook-form";
import { AddressBookData } from "./types";
import { AddressBookKVStore } from "./kvStore";
import { ChainInfo } from "../../../../../background/chains";

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
  const form = useForm<AddressBookData>({
    defaultValues: {
      name: "",
      address: "",
      memo: ""
    }
  });

  const { register, handleSubmit, errors, setValue } = form;

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
      alternativeTitle={index >= 0 ? "Edit Address" : "Add Address"}
      onBackButton={closeModal}
    >
      <form
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
        onSubmit={e => {
          return handleSubmit(data => {
            addAddressBook(data);
          })(e);
        }}
      >
        <Input
          type="text"
          label="Name"
          name="name"
          error={errors.name?.message}
          ref={register({ required: "Name is required" })}
          autoComplete="off"
        />
        <Input
          type="text"
          label="Address"
          name="address"
          error={errors.address?.message}
          ref={register({ required: "Address is required" })}
          autoComplete="off"
        />
        <TextArea
          label="Default Memo (Optional)"
          name="memo"
          error={errors.memo?.message}
          ref={register({ required: false })}
          autoComplete="off"
        />
        <div style={{ flex: 1 }} />
        <Button type="submit" color="primary">
          Save
        </Button>
      </form>
    </HeaderLayout>
  );
};
