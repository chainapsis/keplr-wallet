import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { Stack } from "../../components/stack";
import { PageButton } from "./components";
import {
  SettingIcon,
  RightArrowIcon,
  RocketLaunchIcon,
  KeyIcon,
} from "../../components/icon";
import { useNavigate } from "react-router";
import { Box } from "../../components/box";
import { useIntl } from "react-intl";
import { MainHeaderLayout } from "../main/layouts/header";
import { Gutter } from "../../components/gutter";
import { SearchTextInput } from "../../components/input";
import { useFocusOnMount } from "../../hooks/use-focus-on-mount";

export const SettingPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();

  const searchRef = useFocusOnMount<HTMLInputElement>();
  const [search, setSearch] = useState("");

  const settingMenuList = [
    {
      titleId: "page.setting.general-title",
      paragraphId: "page.setting.general-paragraph",
      startIcon: <SettingIcon width="1rem" height="1rem" />,
      endIcon: <RightArrowIcon />,
      onClick: () => navigate("/setting/general"),
    },
    {
      titleId: "page.setting.advanced-title",
      paragraphId: "page.setting.advanced-paragraph",
      startIcon: <RocketLaunchIcon width="1rem" height="1rem" />,
      endIcon: <RightArrowIcon />,
      onClick: () => navigate("/setting/advanced"),
    },
    {
      titleId: "page.setting.security-privacy-title",
      paragraphId: "page.setting.security-privacy-paragraph",
      startIcon: <KeyIcon width="1rem" height="1rem" />,
      endIcon: <RightArrowIcon />,
      onClick: () => navigate("/setting/security"),
    },
    {
      titleId: "page.setting.manage-token-list-title",
      paragraphId: "page.setting.manage-token-list-paragraph",
      endIcon: <RightArrowIcon />,
      onClick: () => navigate("/setting/token/list"),
    },
  ];

  const filteredList = settingMenuList.filter((item) => {
    const title = intl.formatMessage({ id: item.titleId });
    const query = search.toLowerCase();
    return title.toLowerCase().includes(query);
  });

  return (
    <MainHeaderLayout>
      <Box padding="0.75rem" paddingTop="0">
        <SearchTextInput
          ref={searchRef}
          placeholder={intl.formatMessage({
            id: "page.setting.search-placeholder",
          })}
          value={search}
          onChange={(e) => {
            e.preventDefault();

            setSearch(e.target.value);
          }}
        />
        <Gutter size="0.75rem" />
        <Stack gutter="0.5rem">
          {filteredList.map((item) => (
            <PageButton
              title={intl.formatMessage({ id: item.titleId })}
              paragraph={intl.formatMessage({
                id: item.paragraphId,
              })}
              startIcon={item.startIcon}
              endIcon={item.endIcon}
              onClick={item.onClick}
              key={item.titleId}
            />
          ))}
        </Stack>
      </Box>
    </MainHeaderLayout>
  );
});
