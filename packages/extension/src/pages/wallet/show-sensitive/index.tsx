import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { ColorPalette } from "../../../styles";
import { Subtitle3 } from "../../../components/typography";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { TextInput } from "../../../components/input";
import { useForm } from "react-hook-form";
import { useStore } from "../../../stores";
import { useSearchParams } from "react-router-dom";
import { Box } from "../../../components/box";
import { Gutter } from "../../../components/gutter";

interface FormData {
  password: string;
}

export const WalletShowSensitivePage: FunctionComponent = observer(() => {
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

  const [sensitive, setSensitive] = useState("");

  useEffect(() => {
    setFocus("password");
  }, [setFocus]);

  return (
    <HeaderLayout
      title={(() => {
        const keyInfo = keyRingStore.keyInfos.find(
          (keyInfo) => keyInfo.id === vaultId
        );
        if (keyInfo && keyInfo.type === "private-key") {
          return "View Private key";
        }

        return "View Recovery Phrase";
      })()}
      left={<BackButton />}
      fixedHeight={true}
      bottomButton={
        sensitive === ""
          ? {
              color: "secondary",
              text: "Confirm",
              size: "large",
              type: "submit",
            }
          : {
              color: "secondary",
              text: "Close",
              size: "large",
              type: "button",
              onClick: () => {
                window.close();
              },
            }
      }
      onSubmit={
        sensitive === ""
          ? handleSubmit(async (data) => {
              try {
                if (vaultId) {
                  const result = await keyRingStore.showKeyRing(
                    vaultId,
                    data.password
                  );
                  setSensitive(result);
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
      <Box
        padding="0.75rem"
        paddingTop="0.5rem"
        paddingBottom="0"
        height="100%"
      >
        {sensitive === "" ? (
          <React.Fragment>
            <Box alignX="center" alignY="center" style={{ flex: 1 }}>
              <Box
                width="8.5rem"
                height="8.5rem"
                backgroundColor={ColorPalette["gray-200"]}
              />

              <Gutter size="2rem" />

              <Subtitle3 color={ColorPalette["gray-200"]}>
                Please type in your password to proceed
              </Subtitle3>
            </Box>
            <TextInput
              label="Password"
              type="password"
              error={errors.password && errors.password.message}
              {...register("password", { required: true })}
            />
          </React.Fragment>
        ) : (
          <Box
            paddingX="1.75rem"
            paddingY="1.25rem"
            backgroundColor={ColorPalette["gray-600"]}
            borderRadius="0.5rem"
            minHeight="10.25rem"
            style={{
              textAlign: "center",
              lineBreak: sensitive.trim().includes(" ") ? "auto" : "anywhere",
            }}
          >
            <Subtitle3 color={ColorPalette["gray-50"]}>{sensitive}</Subtitle3>
          </Box>
        )}
      </Box>
    </HeaderLayout>
  );
});
