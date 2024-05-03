import React, { FunctionComponent, useMemo } from "react";
import { Card } from "@components-v2/card";
import style from "../style.module.scss";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useLanguage } from "../../../languages";
import { HeaderLayout } from "@layouts-v2/header-layout";

export const CurrencyPge: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();

  const language = useLanguage();

  const { priceStore, analyticsStore } = useStore();

  const selectedIcon = useMemo(
    () => [<i key="selected" className="fas fa-check" />],
    []
  );

  return (
    <HeaderLayout
      showChainName={false}
      showTopMenu={true}
      canChangeChainInfo={false}
      smallTitle={true}
      alternativeTitle={intl.formatMessage({
        id: "setting.fiat",
      })}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", { pageName: "Currency" });
        navigate(-1);
      }}
    >
      <div className={style["container"]}>
        <Card
          style={
            language.isFiatCurrencyAutomatic
              ? {
                  background: "var(--Indigo---Fetch, #5F38FB)",
                  marginBottom: "5px",
                }
              : { marginBottom: "5px" }
          }
          heading={intl.formatMessage({
            id: "setting.fiat.automatic",
          })}
          onClick={() => {
            language.setFiatCurrency(null);
            navigate({
              pathname: "/",
            });
          }}
          rightContent={
            language.isFiatCurrencyAutomatic ? selectedIcon : undefined
          }
        />
        {Object.keys(priceStore.supportedVsCurrencies).map((currency) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const fiatCurrency = priceStore.supportedVsCurrencies[currency]!;

          return (
            <Card
              style={
                language.fiatCurrency === fiatCurrency.currency &&
                !language.isFiatCurrencyAutomatic
                  ? {
                      background: "var(--Indigo---Fetch, #5F38FB)",
                      marginBottom: "5px",
                    }
                  : { marginBottom: "5px" }
              }
              key={fiatCurrency.currency}
              heading={`${fiatCurrency.currency.toUpperCase()} (${
                fiatCurrency.symbol
              })`}
              onClick={() => {
                language.setFiatCurrency(fiatCurrency.currency);
                navigate({
                  pathname: "/",
                });
              }}
              rightContent={
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
