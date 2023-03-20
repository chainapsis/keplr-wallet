import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../../layouts/header";
import { BackButton } from "../../../../layouts/header/components";
import { Stack } from "../../../../components/stack";
import { PageButton } from "../../components";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useNavigate } from "react-router";

export const SettingGeneralFiatPage: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();

  const navigate = useNavigate();

  return (
    <HeaderLayout title="General" left={<BackButton />}>
      <Stack gutter="2rem">
        <PageButton
          title="Automatic"
          onClick={() => {
            uiConfigStore.selectFiatCurrency(undefined);

            navigate("/");
          }}
        />
        {Object.entries(uiConfigStore.supportedFiatCurrencies).map(
          ([fiat, fiatCurrency]) => {
            if (!fiatCurrency) {
              // Can't be happened
              return null;
            }

            return (
              <PageButton
                key={fiat}
                title={`${fiatCurrency.currency.toUpperCase()} (${
                  fiatCurrency.symbol
                })`}
                onClick={() => {
                  uiConfigStore.selectFiatCurrency(fiat);

                  navigate("/");
                }}
              />
            );
          }
        )}
      </Stack>
    </HeaderLayout>
  );
});
