import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Stack } from "../../components/stack";
import { PageButton } from "./components";
import {
  SettingIcon,
  RightArrowIcon,
  RocketLaunchIcon,
  KeyIcon,
} from "../../components/icon";
import { useNavigate } from "react-router";
import { Box } from "../../components/box";
import { FormattedMessage, useIntl } from "react-intl";
import { MainHeaderLayout } from "../main/layouts/header";
import { H3 } from "../../components/typography";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import { Gutter } from "../../components/gutter";

export const SettingPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();

  const theme = useTheme();

  return (
    <MainHeaderLayout>
      <Box padding="0.75rem" paddingTop="0">
        <Box paddingY="1.15rem" alignX="center" alignY="center">
          <H3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette.white
            }
          >
            <FormattedMessage id="page.setting.title" />
          </H3>
        </Box>
        <Gutter size="0.5rem" />
        <Stack gutter="0.5rem">
          <PageButton
            title={intl.formatMessage({ id: "page.setting.general-title" })}
            paragraph={intl.formatMessage({
              id: "page.setting.general-paragraph",
            })}
            startIcon={<SettingIcon width="1rem" height="1rem" />}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general")}
          />

          <PageButton
            title={intl.formatMessage({ id: "page.setting.advanced-title" })}
            paragraph={intl.formatMessage({
              id: "page.setting.advanced-paragraph",
            })}
            startIcon={<RocketLaunchIcon width="1rem" height="1rem" />}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/advanced")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.security-privacy-title",
            })}
            paragraph={intl.formatMessage({
              id: "page.setting.security-privacy-paragraph",
            })}
            startIcon={<KeyIcon width="1rem" height="1rem" />}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.manage-token-list-title",
            })}
            paragraph={intl.formatMessage({
              id: "page.setting.manage-token-list-paragraph",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/token/list")}
          />
        </Stack>
      </Box>
    </MainHeaderLayout>
  );
});
