import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { Stack } from "../../../components/stack";
import { PageButton } from "../components";
import { RightArrowIcon } from "../../../components/icon";
import { useNavigate } from "react-router";

export const SettingSecurityPage: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <HeaderLayout title="General" left={<BackButton />}>
      <Stack gutter="2rem">
        <PageButton
          title="Permissions"
          paragraph="Websites that can access address/signing"
          endIcon={<RightArrowIcon />}
          onClick={() => navigate("/setting/security/permission")}
        />
      </Stack>
    </HeaderLayout>
  );
};
