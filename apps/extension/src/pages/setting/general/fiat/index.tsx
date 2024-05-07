import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../../layouts/header";
import { BackButton } from "../../../../layouts/header/components";
import { Stack } from "../../../../components/stack";
import { PageButton } from "../../components";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useNavigate } from "react-router";
import { Box } from "../../../../components/box";
import { CheckIcon } from "../../../../components/icon";
import { useIntl } from "react-intl";

export const SettingGeneralFiatPage: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();

  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.setting.general.currency-title" })}
      left={<BackButton />}
    >
      <Box paddingX="0.75rem" paddingBottom="0.75rem">
        <Stack gutter="0.5rem">
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
                  endIcon={
                    fiatCurrency.currency ===
                    uiConfigStore.fiatCurrency.currency ? (
                      <CheckIcon width="1.25rem" height="1.25rem" />
                    ) : null
                  }
                />
              );
            }
          )}
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
