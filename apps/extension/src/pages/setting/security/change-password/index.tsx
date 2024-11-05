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
import { useIntl } from "react-intl";

interface FormData {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const SettingSecurityChangePasswordPage: FunctionComponent = observer(
  () => {
    const { keyRingStore } = useStore();
    const intl = useIntl();

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
        title={intl.formatMessage({
          id: "page.setting.security.change-password-title",
        })}
        left={<BackButton />}
        bottomButtons={[
          {
            text: intl.formatMessage({
              id: "button.next",
            }),
            color: "secondary",
            size: "large",
            type: "submit",
            isLoading,
          },
        ]}
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
              {
                type: "custom",
                message: intl.formatMessage({ id: "error.invalid-password" }),
              },
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
              label={intl.formatMessage({
                id: "page.setting.security.change-password.current-password-label",
              })}
              type="password"
              {...form.register("password", {
                required: true,
              })}
              error={form.formState.errors.password?.message}
            />

            <TextInput
              label={intl.formatMessage({
                id: "page.setting.security.change-password.new-password-label",
              })}
              type="password"
              {...form.register("newPassword", {
                required: true,
                validate: (password: string): string | undefined => {
                  if (password.length < 8) {
                    return intl.formatMessage({
                      id: "error.password-too-short",
                    });
                  }
                },
              })}
              error={form.formState.errors.newPassword?.message}
            />

            <TextInput
              label={intl.formatMessage({
                id: "page.setting.security.change-password.confirm-password-label",
              })}
              type="password"
              {...form.register("confirmNewPassword", {
                required: true,
                validate: (confirmPassword: string): string | undefined => {
                  if (confirmPassword !== form.getValues("newPassword")) {
                    return intl.formatMessage({
                      id: "error.password-should-match",
                    });
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
