import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Stack } from "../../../components/stack";
import { ColorPalette } from "../../../styles";
import { Subtitle2, Subtitle3 } from "../../../components/typography";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { TextInput } from "../../../components/input";
import { useForm } from "react-hook-form";
import { useStore } from "../../../stores";
import { useSearchParams } from "react-router-dom";
import { Box } from "../../../components/box";
import { YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";

const Styles = {
  Container: styled(Stack)`
    height: 100%;

    padding: 0.75rem;
  `,
  Flex1: styled.div`
    flex: 1;
  `,
  Paragraph: styled(Subtitle3)`
    text-align: center;
    color: ${ColorPalette["gray-200"]};
    padding: 0 0.5rem;
  `,
  RecoveryPhrase: styled(Subtitle2)`
    color: ${ColorPalette["gray-50"]};
    background-color: ${ColorPalette["gray-600"]};

    padding: 1.25rem 1.875rem;
    border-radius: 0.5rem;

    text-align: center;
  `,
};

interface FormData {
  password: string;
}

export const WalletRecoveryPhrasePage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const [searchParams] = useSearchParams();

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

  const [keyRing, setKeyRing] = useState("");

  useEffect(() => {
    setFocus("password");
  }, [setFocus]);

  return (
    <HeaderLayout
      title="View Recovery Phrase"
      left={<BackButton />}
      fixedHeight={true}
      bottomButton={
        keyRing === ""
          ? {
              color: "secondary",
              text: "Confirm",
              size: "large",
              type: "submit",
            }
          : undefined
      }
      onSubmit={
        keyRing === ""
          ? handleSubmit(async (data) => {
              try {
                if (vaultId) {
                  const result = await keyRingStore.showKeyRing(
                    vaultId,
                    data.password
                  );
                  setKeyRing(result);
                }
              } catch (e) {
                console.log("Fail to decrypt: " + e.message);
                setError("password", {
                  type: "custom",
                  message: "Invalid password",
                });
              }
            })
          : undefined
      }
    >
      {keyRing === "" ? (
        <Styles.Container>
          <Gutter size="5.875rem" />

          <YAxis alignX="center">
            <Box
              width="8.5rem"
              height="8.5rem"
              backgroundColor={ColorPalette["gray-200"]}
            />
          </YAxis>

          <Gutter size="2rem" />

          <Styles.Paragraph>
            Please type in your password to proceed
          </Styles.Paragraph>

          <Styles.Flex1 />

          <TextInput
            label="Password"
            type="password"
            error={errors.password && errors.password.message}
            {...register("password", { required: true })}
          />
        </Styles.Container>
      ) : (
        <Styles.RecoveryPhrase>{keyRing}</Styles.RecoveryPhrase>
      )}
    </HeaderLayout>
  );
});
