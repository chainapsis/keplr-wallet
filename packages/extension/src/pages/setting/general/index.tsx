import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { Stack } from "../../../components/stack";
import { PageButton } from "../components";
import { RightArrowIcon } from "../../../components/icon";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

export const SettingGeneralPage: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();

  const navigate = useNavigate();

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
          paragraph={(() => {
            const fiatCurrency = uiConfigStore.fiatCurrency;
            if (fiatCurrency.isAutomatic) {
              return `Automatic (${fiatCurrency.currency.toUpperCase()})`;
            }

            return uiConfigStore.fiatCurrency.currency.toUpperCase();
          })()}
          endIcon={<RightArrowIcon />}
          onClick={() => navigate("/setting/general/fiat")}
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
});
