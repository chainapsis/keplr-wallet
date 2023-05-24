import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { Stack } from "../../../components/stack";
import { PageButton } from "../components";
import { RightArrowIcon } from "../../../components/icon";
import { useNavigate } from "react-router";
import { Box } from "../../../components/box";
import { useIntl } from "react-intl";

export const SettingSecurityPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "pages.setting.security.header" })}
      left={<BackButton />}
    >
      <Box padding="0.75rem" paddingTop="0">
        <Stack gutter="1rem">
          <PageButton
            title={intl.formatMessage({
              id: "pages.setting.security.connect-website-button",
            })}
            paragraph="Websites that can view your address and make requests for signing"
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security/permission")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "pages.setting.security.lock-button",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security/auto-lock")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "pages.setting.security.change-password-button",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security/change-password")}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
};
