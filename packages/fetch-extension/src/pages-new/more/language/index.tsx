import { Card } from "@components-v2/card";
import { HeaderLayout } from "@layouts-v2/header-layout";
import React, { FunctionComponent, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { useLanguage } from "../../../languages";
import { useStore } from "../../../stores";
export const MoreLanguagePage: FunctionComponent = () => {
  const language = useLanguage();
  const navigate = useNavigate();
  const intl = useIntl();
  const { analyticsStore } = useStore();
  const selectedIcon = useMemo(
    () => [<i key="selected" className="fas fa-check" />],
    []
  );

  return (
    <HeaderLayout
      showTopMenu={true}
      showChainName={false}
      canChangeChainInfo={false}
      smallTitle={true}
      showBottomMenu={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.language",
      })}
      onBackButton={useCallback(() => {
        navigate(-1);
        analyticsStore.logEvent("back_click", { pageName: "Language" });
      }, [navigate])}
    >
      <Card
        isActive={language.automatic}
        heading={intl.formatMessage({
          id: "setting.language.automatic",
        })}
        onClick={useCallback(() => {
          language.clearLanguage();
          navigate("/");
        }, [navigate, language])}
        rightContent={language.automatic ? selectedIcon : undefined}
      />
      <Card
        isActive={!language.automatic && language.language == "en"}
        heading={intl.formatMessage({
          id: "setting.language.en",
        })}
        onClick={useCallback(() => {
          language.setLanguage("en");
          navigate("/");
        }, [navigate, language])}
        rightContent={
          !language.automatic && language.language == "en"
            ? selectedIcon
            : undefined
        }
      />
      {/* <Card
        isActive={language.language == "ko"}
        heading={intl.formatMessage({
          id: "setting.language.ko",
        })}
        onClick={useCallback(() => {
          language.setLanguage("ko");
          navigate("/");
        }, [navigate, language])}
        rightContent={
          !language.automatic && language.language == "ko"
            ? selectedIcon
            : undefined
        }
      /> */}
    </HeaderLayout>
  );
};
