import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { GuideBox } from "../../../components/guide-box";
import { Subtitle3, Subtitle4 } from "../../../components/typography";
import styled from "styled-components";
import { Stack } from "../../../components/stack";
import { ColorPalette } from "../../../styles";
import { TextInput } from "../../../components/input";
import { Button } from "../../../components/button";
import { useStore } from "../../../stores";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";

const Styles = {
  Container: styled(Stack)`
    height: 100%;

    padding: 0.75rem;
  `,
  Flex1: styled.div`
    flex: 1;
  `,
  BackUp: styled(Subtitle4)`
    color: ${ColorPalette["yellow-400"]};
    text-decoration: underline;
  `,
  Paragraph: styled(Subtitle3)`
    color: ${ColorPalette["gray-200"]};
    text-align: center;

    padding: 0 0.5rem;
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
  password: string;
}

export const WalletDeletePage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const vaultId = searchParams.get("id");

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    setFocus("password");
  }, [setFocus]);

  return (
    <HeaderLayout title="Delete Wallet" left={<BackButton />}>
      <form
        onSubmit={handleSubmit(async (data) => {
          try {
            if (vaultId) {
              await keyRingStore.deleteKeyRing(vaultId, data.password);

              navigate(-1);
            }
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
            setError("password", {
              type: "custom",
              message: "Invalid password",
            });
          }
        })}
      >
        <Styles.Container>
          <GuideBox
            color="warning"
            title="Alert"
            paragraph="Make sure that you’ve backed up your recovery phrase and private key."
            bottom={<Styles.BackUp>Back Up My Wallet</Styles.BackUp>}
          />

          <Styles.Paragraph>
            After deletion, you will be required to import your wallet to
            restore your access to it.
          </Styles.Paragraph>

          <Styles.Flex1 />

          <TextInput
            label="Password"
            type="password"
            error={errors.password && errors.password.message}
            {...register("password", { required: true })}
          />
        </Styles.Container>

        <Styles.BottomButton>
          <Button text="Confirm" color="secondary" />
        </Styles.BottomButton>
      </form>
    </HeaderLayout>
  );
});
