import React, { FunctionComponent, useMemo } from "react";
import { HeaderLayout } from "../../../layouts";
import { PageButton } from "../page-button";

import style from "../style.module.scss";
import { useHistory } from "react-router";
import { useIntl } from "react-intl";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useLanguage } from "../../../languages";

export const SettingFiatPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const language = useLanguage();

  const { priceStore } = useStore();

  const selectedIcon = useMemo(
    () => [<i key="selected" className="fas fa-check" />],
    []
  );

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.fiat",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        <PageButton
          title={intl.formatMessage({
            id: "setting.fiat.automatic",
          })}
          onClick={() => {
            language.setFiatCurrency(null);
            history.push({
              pathname: "/",
            });
          }}
          icons={language.isFiatCurrencyAutomatic ? selectedIcon : undefined}
        />
        {Object.keys(priceStore.supportedVsCurrencies).map((currency) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const fiatCurrency = priceStore.supportedVsCurrencies[currency]!;

          return (
            <PageButton
              key={fiatCurrency.currency}
              title={`${fiatCurrency.currency.toUpperCase()} (${
                fiatCurrency.symbol
              })`}
              onClick={() => {
                language.setFiatCurrency(fiatCurrency.currency);
                history.push({
                  pathname: "/",
                });
              }}
              icons={
                !language.isFiatCurrencyAutomatic
                  ? language.fiatCurrency === fiatCurrency.currency
                    ? selectedIcon
                    : undefined
                  : undefined
              }
            />
          );
        })}
      </div>
    </HeaderLayout>
  );
});
