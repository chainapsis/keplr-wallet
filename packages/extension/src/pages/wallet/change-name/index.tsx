import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Stack } from "../../../components/stack";
import { BackButton } from "../../../layouts/header/components";
import { TextInput } from "../../../components/input";
import { HeaderLayout } from "../../../layouts/header";
import { useForm } from "react-hook-form";
import { useStore } from "../../../stores";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router";

const Styles = {
  Container: styled(Stack)`
    height: 100%;

    padding: 0.75rem;

    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  `,
};

interface FormData {
  name: string;
}

// Todo: Add window.changeName() to change the name of the wallet
export const WalletChangeNamePage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const vaultId = searchParams.get("id");
  const walletName = keyRingStore.keyInfos.find((info) => info.id === vaultId);

  const {
    handleSubmit,
    register,
    setFocus,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  return (
    <HeaderLayout
      title="Change Wallet Name"
      left={<BackButton />}
      bottomButton={{ text: "Save", color: "secondary", type: "submit" }}
      onSubmit={handleSubmit(async (data) => {
        console.log("submit: " + data.name);
        try {
          if (vaultId) {
            await keyRingStore.changeKeyRingName(vaultId, data.name);

            navigate(-1);
          }
        } catch (e) {
          console.log("Fail to decrypt: " + e.message);
          setError("name", {
            type: "custom",
            message: "Account name is required",
          });
        }
      })}
    >
      <Styles.Container>
        <TextInput
          label="Previous Wallet Name"
          disabled
          value={walletName?.name}
        />

        <TextInput
          label="New Wallet Name"
          error={errors.name && errors.name.message}
          {...register("name", { required: true })}
        />
      </Styles.Container>
    </HeaderLayout>
  );
});
