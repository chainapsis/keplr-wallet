import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../layouts/header/components";
import { HeaderLayout } from "../../layouts/header";
import { Stack } from "../../components/stack";
import { PageButton } from "./components";
import {
  SettingIcon,
  RightArrowIcon,
  RocketLaunchIcon,
  KeyIcon,
} from "../../components/icon";
import { useNavigate } from "react-router";
import { XAxis } from "../../components/axis";
import { Box } from "../../components/box";
import { FormattedMessage, useIntl } from "react-intl";

export const SettingPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <HeaderLayout title="Setting" left={<BackButton />}>
      <Box padding="0.75rem" paddingTop="0">
        <Stack gutter="0.5rem">
          <PageButton
            title={
              <XAxis alignY="center">
                <FormattedMessage id="pages.setting.general-button" />
              </XAxis>
            }
            paragraph={intl.formatMessage({
              id: "pages.setting.general-paragraph",
            })}
            startIcon={<SettingIcon width="1rem" height="1rem" />}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general")}
          />

          <PageButton
            title={intl.formatMessage({ id: "pages.setting.advanced-button" })}
            paragraph={intl.formatMessage({
              id: "pages.setting.advanced-paragraph",
            })}
            startIcon={<RocketLaunchIcon width="1rem" height="1rem" />}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/advanced")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "pages.setting.security-button",
            })}
            paragraph={intl.formatMessage({
              id: "pages.setting.security-paragraph",
            })}
            startIcon={<KeyIcon width="1rem" height="1rem" />}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "pages.setting.manage-token-button",
            })}
            paragraph={intl.formatMessage({
              id: "pages.setting.manage-token-paragraph",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/token/list")}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
