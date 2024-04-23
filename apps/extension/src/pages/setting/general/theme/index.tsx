import React, { FunctionComponent } from "react";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { Stack } from "../../../../components/stack";
import { PageButton } from "../../components";
import { CheckIcon } from "../../../../components/icon";
import { Box } from "../../../../components/box";
import { useAppTheme } from "../../../../theme";

export const SettingGeneralThemePage: FunctionComponent = () => {
  const theme = useAppTheme();
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.setting.general.theme-title" })}
      left={<BackButton />}
    >
      <Box paddingX="0.75rem" paddingBottom="0.75rem">
        <Stack gutter="0.5rem">
          <PageButton
            title={intl.formatMessage({
              id: "page.setting.general.theme.dark-mode",
            })}
            endIcon={
              theme.option === "dark" ? (
                <CheckIcon width="1.25rem" height="1.25rem" />
              ) : null
            }
            onClick={() => {
              theme.setTheme("dark");
              navigate(-1);
            }}
          />
          <PageButton
            title={intl.formatMessage({
              id: "page.setting.general.theme.light-mode",
            })}
            endIcon={
              theme.option === "light" ? (
                <CheckIcon width="1.25rem" height="1.25rem" />
              ) : null
            }
            onClick={() => {
              theme.setTheme("light");
              navigate(-1);
            }}
          />
          <PageButton
            title={intl.formatMessage({
              id: "page.setting.general.theme.auto",
            })}
            endIcon={
              theme.option === "auto" ? (
                <CheckIcon width="1.25rem" height="1.25rem" />
              ) : null
            }
            onClick={() => {
              theme.setTheme("auto");
              navigate(-1);
            }}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
};
