import { Chip } from "@components/chips/topic-chip";
import { fetchTopics } from "@utils/fetch-notification";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { NotyphiTopic } from "@notificationTypes";
import { useStore } from "../../../../../stores";

import { useNavigate, useParams } from "react-router";
import style from "./style.module.scss";
import { FormattedMessage } from "react-intl";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { ButtonV2 } from "@components-v2/buttons/button";
import { Card } from "@components-v2/card";
const pageOptions = {
  edit: "edit",
  add: "add",
};

export const NotificationTopics: FunctionComponent = () => {
  const navigate = useNavigate();
  const [inputVal, setInputVal] = useState("");
  const { chainStore, accountStore, analyticsStore } = useStore();
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
      analyticsStore.logEvent("update_notification_preferences_click", {
        pageName: "Topics",
      });
      navigate(-1);
      return;
    }
    navigate("/notification/review");
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
      showTopMenu={true}
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"Topics"}
      showBottomMenu={false}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", { pageName: "Topics" });
        navigate(-1);
      }}
    >
      <Card
        style={{
          background: "rgba(255,255,255,0.1)",
          marginBottom: "24px",
          padding: "12px 18px",
        }}
        heading={
          <input
            className={style["searchInput"]}
            type="text"
            id="searchInput"
            placeholder="Search"
            value={inputVal}
            onKeyUp={handleSearch}
            onChange={(e) => setInputVal(e.target.value)}
          />
        }
        rightContent={require("@assets/svg/wireframe/search.svg")}
      />
      <div className={style["topicsContainer"]}>
        {isLoading ? (
          <div className={style["isLoading"]}>
            <i
              className="fa fa-spinner fa-spin fa-2x fa-fw"
              style={{ color: "white" }}
            />
          </div>
        ) : (
          <div className={style["topicChipsContainer"]}>
            {!topicsList.length && (
              <div className={style["resultText"]}>
                <p>
                  <FormattedMessage id="search.no-result-found" />
                  {inputVal !== "" && (
                    <React.Fragment>
                      <br />
                      <FormattedMessage id="search.refine.search" />
                    </React.Fragment>
                  )}
                </p>
              </div>
            )}
            {topicsList.map((topic: NotyphiTopic, index: number) => (
              <Chip
                key={topic.name}
                topic={topic}
                checked={
                  !!selectedTopics.find((item) => item.name === topic.name)
                }
                handleCheck={(isChecked) => handleCheck(isChecked, index)}
              />
            ))}
          </div>
        )}

        <p className={style["selectedTopics"]}>
          {selectedTopics.length} notification types selected
        </p>

        <div className={style["topicButton"]}>
          <ButtonV2
            text={type === pageOptions.add ? "Finish" : "Save"}
            onClick={handleNextPage}
            disabled={type === pageOptions.edit && disabled}
            styleProps={{
              height: "56px",
            }}
          />
        </div>
      </div>
    </HeaderLayout>
  );
};
