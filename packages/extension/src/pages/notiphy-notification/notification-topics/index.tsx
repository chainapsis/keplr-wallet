import { NotificationSearchInput } from "@components/notification-search-input";
import { Chip } from "@components/select-notifications/topic-chip";
import { HeaderLayout } from "@layouts/header-layout";
import { fetchTopics } from "@utils/fetch-notification";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { NotyphiTopic } from "@notificationTypes";
import { useStore } from "../../../stores";

import { useHistory, useParams } from "react-router";
import { Button } from "reactstrap";
import style from "./style.module.scss";
import { FormattedMessage } from "react-intl";

const pageOptions = {
  edit: "edit",
  add: "add",
};

export const NotificationTopics: FunctionComponent = () => {
  const history = useHistory();
  const [inputVal, setInputVal] = useState("");
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const [topicsList, setTopicsList] = useState<NotyphiTopic[]>([]);
  const [mainTopicsList, setMainTopicsList] = useState<NotyphiTopic[]>([]);
  const followUnfollowTopicsObj = useRef<NotyphiTopic[]>(
    JSON.parse(
      localStorage.getItem(`topics-${accountInfo.bech32Address}`) ||
        JSON.stringify([])
    ).sort((a: any, b: any) => (a.name > b.name ? 1 : -1))
  );

  const [selectedTopics, setSelectedTopics] = useState<NotyphiTopic[]>(
    followUnfollowTopicsObj.current
  );

  const [isLoading, setIsLoading] = useState(true);
  const { type } = useParams<{ type?: string }>();

  useEffect(() => {
    fetchTopics().then((res) => {
      setTopicsList(res.items);
      setMainTopicsList(res.items);
      setIsLoading(false);
    });
  }, []);

  const handleNextPage = () => {
    localStorage.setItem(
      `topics-${accountInfo.bech32Address}`,
      JSON.stringify(selectedTopics)
    );
    if (type === pageOptions.edit) {
      history.goBack();
      return;
    }

    history.push("/notification/review");
  };

  const handleSearch = () => {
    const searchString = inputVal.trim();

    if (searchString.length == 0) {
      setTopicsList(mainTopicsList);
    } else {
      const filteredOrg: NotyphiTopic[] = mainTopicsList.filter(
        (org: NotyphiTopic) =>
          org.name.toLowerCase().includes(searchString.toLowerCase())
      );
      setTopicsList(filteredOrg);
    }
  };

  const handleCheck = (isChecked: boolean, index: number) => {
    const item = topicsList[index];

    if (isChecked) {
      setSelectedTopics([...selectedTopics, item]);
    } else {
      setSelectedTopics(
        selectedTopics.filter((element) => element.name != item.name)
      );
    }
  };

  selectedTopics.sort((a, b) => (a.name > b.name ? 1 : -1));
  const disabled =
    JSON.stringify(selectedTopics) ==
    JSON.stringify(followUnfollowTopicsObj.current);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"Topics"}
      showBottomMenu={false}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.topicsContainer}>
        <div className={style.heading}>
          <FormattedMessage id="notification.topic.header-message" />
        </div>
        <NotificationSearchInput
          inputVal={inputVal}
          handleSearch={handleSearch}
          setInputVal={setInputVal}
        />
        {isLoading ? (
          <div className={style.isLoading}>
            <i className="fa fa-spinner fa-spin fa-2x fa-fw" />
          </div>
        ) : (
          <div className={style.topicChipsContainer}>
            {!topicsList.length && (
              <div className={style.resultText}>
                <p>
                  No results found. <br />
                  Please refine your search.
                </p>
              </div>
            )}
            {topicsList.map((topic: NotyphiTopic, index: number) => (
              <Chip
                key={topic.name}
                topic={topic}
                checked={
                  selectedTopics.find((item) => item.name === topic.name)
                    ? true
                    : false
                }
                handleCheck={(isChecked) => handleCheck(isChecked, index)}
              />
            ))}
          </div>
        )}

        <p className={style.selectedTopics}>
          {selectedTopics.length} notification types selected
        </p>

        <div className={style.topicButton}>
          <Button
            className={style.button}
            color="primary"
            onClick={handleNextPage}
            disabled={type === pageOptions.edit && disabled}
          >
            {type === pageOptions.add
              ? "Finish"
              : "Update Notification Preferences"}
          </Button>
        </div>
      </div>
    </HeaderLayout>
  );
};
