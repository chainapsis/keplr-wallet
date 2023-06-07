import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { Stack } from "../../../components/stack";
import { PageButton } from "../components";
import { RightArrowIcon } from "../../../components/icon";
import { useNavigate } from "react-router";
import { Box } from "../../../components/box";
import { Toggle } from "../../../components/toggle";

export const SettingSecurityPage: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <HeaderLayout title="Security & Privacy" left={<BackButton />}>
      <Box padding="0.75rem" paddingTop="0">
        <Stack gutter="1rem">
          <PageButton
            title="Connected Websites"
            paragraph="Websites that can view your address and make requests for signing"
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security/permission")}
          />

          <PageButton
            title="Auto-Lock"
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security/auto-lock")}
          />

          <PageButton
            title="Change Password"
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security/change-password")}
          />

          <PageButton
            title="Using Analytics"
            paragraph="Help us improve the extension by sending anonymous usage data"
            endIcon={
              <Toggle
                isOpen={localStorage.getItem("using-analytics") !== "false"}
                setIsOpen={() => {
                  localStorage.setItem(
                    "using-analytics",
                    localStorage.getItem("using-analytics") !== "false"
                      ? "false"
                      : "true"
                  );

                  window.location.reload();
                }}
              />
            }
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
};
