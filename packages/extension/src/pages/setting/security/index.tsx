import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { Stack } from "../../../components/stack";
import { PageButton } from "../components";
import { RightArrowIcon } from "../../../components/icon";
import { useNavigate } from "react-router";
import { Box } from "../../../components/box";

export const SettingSecurityPage: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <HeaderLayout title="Security&Privacy" left={<BackButton />}>
      <Box paddingX="0.75rem">
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
        </Stack>
      </Box>
    </HeaderLayout>
  );
};
