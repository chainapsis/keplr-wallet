import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { Box } from "../../../../components/box";
import { Body2 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { TextInput } from "../../../../components/input";
import { Stack } from "../../../../components/stack";
import { Gutter } from "../../../../components/gutter";
import { useForm } from "react-hook-form";
import { useStore } from "../../../../stores";
import { useNavigate } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";

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
          id: "pages.setting.security.change-password.header",
        })}
        left={<BackButton />}
        bottomButton={{
          text: intl.formatMessage({
            id: "pages.setting.security.change-password.bottom-button",
          }),
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
          <Body2
            color={ColorPalette["gray-200"]}
            style={{
              textAlign: "center",
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
            }}
          >
            <FormattedMessage id="pages.setting.security.change-password.content" />
            {intl.formatMessage({
              id: "pages.setting.security.change-password.header",
            })}
          </Body2>
          <Gutter size="1.75rem" />

          <Stack gutter="1rem">
            <TextInput
              label={intl.formatMessage({
                id: "pages.setting.security.change-password.password-input-text",
              })}
              type="password"
              {...form.register("password", {
                required: true,
              })}
              error={form.formState.errors.password?.message}
            />

            <TextInput
              label={intl.formatMessage({
                id: "pages.setting.security.change-password.new-password-input-text",
              })}
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
              label={intl.formatMessage({
                id: "pages.setting.security.change-password.confirm-new-password-input-text",
              })}
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
