import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts/header-layout";
import { Input, TextArea } from "../../../../components/form";
import { Button } from "reactstrap";
import useForm from "react-hook-form";
import { AddressBookData } from "./types";

export const AddAddressModal: FunctionComponent<{
  closeModal: () => void;
  addAddressBook: (data: AddressBookData) => void;
}> = ({ closeModal, addAddressBook }) => {
  const form = useForm<AddressBookData>({
    defaultValues: {
      name: "",
      address: "",
      memo: ""
    }
  });

  const { register, handleSubmit, errors } = form;

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle="Add Address"
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
