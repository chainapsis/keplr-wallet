import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { Stack } from "../../../components/stack";
import { PageButton } from "../components";
import { RightArrowIcon } from "../../../components/icon";
import { useNavigate } from "react-router";
import { Box } from "../../../components/box";
import { useIntl } from "react-intl";
import { Toggle } from "../../../components/toggle";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { SetDisableAnalyticsMsg } from "@keplr-wallet/background";

export const SettingSecurityPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <HeaderLayout title="Security & Privacy" left={<BackButton />}>
      <Box padding="0.75rem" paddingTop="0">
        <Stack gutter="1rem">
          <PageButton
            title={intl.formatMessage({
              id: "page.setting.security.connected-websites-title",
            })}
            paragraph={intl.formatMessage({
              id: "page.setting.security.connected-websites-paragraph",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security/permission")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.security.auto-lock-title",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security/auto-lock")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.security.change-password-title",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security/change-password")}
          />

          <PageButton
            title="Share anonymous data"
            paragraph="Help us improve the performance and quality of Keplr"
            endIcon={
              <Box marginLeft="0.5rem">
                <Toggle
                  isOpen={localStorage.getItem("disable-analytics") !== "true"}
                  setIsOpen={() => {
                    const disableAnalytics =
                      localStorage.getItem("disable-analytics") === "true";

                    new InExtensionMessageRequester()
                      .sendMessage(
                        BACKGROUND_PORT,
                        new SetDisableAnalyticsMsg(!disableAnalytics)
                      )
                      .then((analyticsDisabled) => {
                        localStorage.setItem(
                          "disable-analytics",
                          analyticsDisabled ? "true" : "false"
                        );

                        window.location.reload();
                      });
                  }}
                />
              </Box>
            }
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
};
