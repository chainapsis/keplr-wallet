import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { TextInput } from "../../../../components/input";
import { Button } from "../../../../components/button";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../../../stores";
import { useAddressBookConfig } from "@keplr-wallet/hooks";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { useNavigate } from "react-router";
import { ColorPalette } from "../../../../styles";
import { useForm } from "react-hook-form";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
  BottomButton: styled.div`
    padding: 0.75rem;

    height: 4.75rem;

    background-color: ${ColorPalette["gray-700"]};

    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
  `,
};

interface FormData {
  name: string;
  address: string;
  memo: string | null;
}

export const SettingContactsAdd: FunctionComponent = observer(() => {
  const { chainStore } = useStore();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const chainId = searchParams.get("chainId");
  const index = searchParams.get("index");
  const isAdd =
    searchParams.get("name") === null &&
    searchParams.get("address") === null &&
    index === null;

  if (chainId === null) {
    navigate(-1);
    return null;
  }

  const { handleSubmit, register, setFocus } = useForm<FormData>({
    defaultValues: {
      name: searchParams.get("name") ?? "",
      address: searchParams.get("address") ?? "",
      memo: searchParams.get("memo"),
    },
  });

  console.log(searchParams);

  useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  const addressBookConfig = useAddressBookConfig(
    new ExtensionKVStore("address-book"),
    chainStore,
    chainId,
    {
      setRecipient: (): void => {
        // noop
      },
      setMemo: (): void => {
        // noop
      },
    }
  );

  return (
    <HeaderLayout
      title={`${isAdd ? "Add" : "Edit"} Address`}
      left={<BackButton />}
    >
      <form
        onSubmit={handleSubmit(async (data) => {
          if (isAdd) {
            await addressBookConfig.addAddressBook({
              name: data.name,
              address: data.address,
              memo: data.memo ?? "",
            });
          } else {
            if (index) {
              await addressBookConfig.editAddressBookAt(Number(index), {
                name: data.name,
                address: data.address,
                memo: data.memo ?? "",
              });
            }
          }
          navigate(-1);
        })}
      >
        <Styles.Container gutter="1rem">
          <TextInput
            label="Name"
            {...register("name", {
              required: true,
            })}
          />
          <TextInput
            label="Address"
            {...register("address", {
              required: true,
            })}
          />
          <TextInput label="Memo(Option)" {...register("memo")} />
        </Styles.Container>

        <Styles.BottomButton>
          <Button text="Confirm" color="secondary" size="large" />
        </Styles.BottomButton>
      </form>
    </HeaderLayout>
  );
});
