import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../layouts/header/components";
import { HeaderLayout } from "../../layouts/header";
import { Stack } from "../../components/stack";
import { PageButton } from "./components";
import { SettingIcon, RightArrowIcon } from "../../components/icon";
import { useNavigate } from "react-router";
import { XAxis } from "../../components/axis";

export const SettingPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();

  return (
    <HeaderLayout title="Setting" left={<BackButton />}>
      <Stack gutter="2rem">
        <PageButton
          title={
            <XAxis alignY="center">
              <SettingIcon width={16} height={16} />
              General
            </XAxis>
          }
          paragraph="Language, Currency.."
          endIcon={<RightArrowIcon />}
          onClick={() => navigate("/setting/general")}
        />

        <PageButton
          title="Advanced"
          paragraph="Language, Currency.."
          endIcon={<RightArrowIcon />}
        />

        <PageButton
          title="Security & Privacy"
          paragraph="Language, Currency.."
          endIcon={<RightArrowIcon />}
          onClick={() => navigate("/setting/security")}
        />
      </Stack>
    </HeaderLayout>
  );
});
