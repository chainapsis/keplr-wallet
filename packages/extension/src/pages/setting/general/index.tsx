import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { Stack } from "../../../components/stack";
import { PageButton } from "../components";
import { RightArrowIcon } from "../../../components/icon";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Box } from "../../../components/box";
import { useLanguage } from "../../../languages";

export const SettingGeneralPage: FunctionComponent = observer(() => {
  const { keyRingStore, uiConfigStore } = useStore();

  const language = useLanguage();

  const navigate = useNavigate();

  return (
    <HeaderLayout title="General" left={<BackButton />}>
      <Box padding="0.75rem" paddingTop="0">
        <Stack gutter="0.5rem">
          <PageButton
            title="Language"
            paragraph={language.languageFullName}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/language")}
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
            title="Contacts"
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/contacts/list")}
          />

          <PageButton
            title="Manage AuthZ"
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/authz")}
          />

          <PageButton
            title="Link Keplr Mobile"
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/link-keplr-mobile")}
          />

          <PageButton
            title="Manage Suggest Chains"
            paragraph="Add or remove chains that are suggested and managed by our community repo"
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/delete-suggest-chain")}
          />

          <PageButton
            title="Manage Chain Visibility"
            paragraph="Add or remove chains that are natively integrated with Keplr"
            endIcon={<RightArrowIcon />}
            onClick={() => {
              if (keyRingStore.selectedKeyInfo) {
                browser.tabs
                  .create({
                    url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}&skipWelcome=true`,
                  })
                  .then(() => {
                    window.close();
                  });
              }
            }}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
