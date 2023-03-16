import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { Stack } from "../../../components/stack";
import { PageButton } from "../components";
import { RightArrowIcon } from "../../../components/icon";

export const GeneralPage: FunctionComponent = () => {
  return (
    <HeaderLayout title="General" left={<BackButton />}>
      <Stack gutter="2rem">
        <PageButton
          title="Language"
          paragraph="Korean"
          endIcon={<RightArrowIcon />}
        />

        <PageButton
          title="Currency"
          paragraph="KRW"
          endIcon={<RightArrowIcon />}
        />

        <PageButton
          title="AuthZ"
          paragraph="3 delegation"
          endIcon={<RightArrowIcon />}
        />

        <PageButton title="Link Keplr Mobile" endIcon={<RightArrowIcon />} />
      </Stack>
    </HeaderLayout>
  );
};
