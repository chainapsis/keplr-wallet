import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { Box } from "../../../../components/box";
import { TextInput } from "../../../../components/input";
import { Stack } from "../../../../components/stack";
import { useForm } from "react-hook-form";
import { useStore } from "../../../../stores";
import { useNavigate } from "react-router";

interface FormData {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const SettingSecurityChangePasswordPage: FunctionComponent = observer(
  () => {
    const { keyRingStore } = useStore();

    const form = useForm<FormData>({
      defaultValues: {
        password: "",
        newPassword: "",
        confirmNewPassword: "",
      },
    });

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    return (
      <HeaderLayout
        title="Change Password"
        left={<BackButton />}
        bottomButton={{
          text: "Next",
          color: "secondary",
          size: "large",
          isLoading,
        }}
        onSubmit={form.handleSubmit(async (data) => {
          setIsLoading(true);

          try {
            await keyRingStore.changeUserPassword(
              data.password,
              data.newPassword
            );

            navigate("/");
          } catch (e) {
            console.log(e);

            form.setError(
              "password",
              { type: "custom", message: "Invalid password" },
              {
                shouldFocus: true,
              }
            );
          } finally {
            setIsLoading(false);
          }
        })}
      >
        <Box paddingX="0.75rem">
          <Stack gutter="1rem">
            <TextInput
              label="Current Keplr Password"
              type="password"
              {...form.register("password", {
                required: true,
              })}
              error={form.formState.errors.password?.message}
            />

            <TextInput
              label="New Keplr Password"
              type="password"
              {...form.register("newPassword", {
                required: true,
                validate: (password: string): string | undefined => {
                  if (password.length < 8) {
                    return "Too short password";
                  }
                },
              })}
              error={form.formState.errors.newPassword?.message}
            />

            <TextInput
              label="Confirm New Keplr Password"
              type="password"
              {...form.register("confirmNewPassword", {
                required: true,
                validate: (confirmPassword: string): string | undefined => {
                  if (confirmPassword !== form.getValues("newPassword")) {
                    return "Password should match";
                  }
                },
              })}
              error={form.formState.errors.confirmNewPassword?.message}
            />
          </Stack>
        </Box>
      </HeaderLayout>
    );
  }
);
