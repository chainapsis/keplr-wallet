import { fetchLatestBlock, fetchTransactions } from "@graphQL/activity-api";
import { HeaderLayout } from "@layouts/index";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import { Button } from "reactstrap";
import { ActivityRow } from "./activity-row";

export const ActivityPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const [latestBlock, setLatestBlock] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [blockIsLoading, setBlockIsLoading] = useState(true);
  const [nodes, setNodes] = useState<any>({});
  const [pageInfo, setPageInfo] = useState<any>();
  useEffect(() => {
    const initialize = async () => {
      setBlockIsLoading(true);
      const block = await fetchLatestBlock(current.chainId);
      if (latestBlock != block) setLatestBlock(block);
      setBlockIsLoading(false);
    };
    setInterval(() => initialize(), 5000);
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      const newActivities = await fetchTransactions(
        current.chainId,
        "",
        accountInfo.bech32Address
      );
      if (newActivities) {
        if (!pageInfo) setPageInfo(newActivities.pageInfo);
        const nodeMap: any = {};
        newActivities.nodes.map((node: any) => {
          nodeMap[node.id] = node;
        });
        setNodes({ ...nodes, ...nodeMap });
      }

      setIsLoading(false);
    };
    fetchActivities();
  }, [accountInfo.bech32Address, latestBlock]);

  const handleClick = async () => {
    setLoadingRequest(true);
    const newActivities = await fetchTransactions(
      current.chainId,
      pageInfo.endCursor,
      accountInfo.bech32Address
    );
    setPageInfo(newActivities.pageInfo);
    const nodeMap: any = {};
    newActivities.nodes.map((node: any) => {
      nodeMap[node.id] = node;
    });
    setNodes({ ...nodes, ...nodeMap });
    setLoadingRequest(false);
  };

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "main.menu.activity",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        <div className={style.title}>
          <FormattedMessage id="main.menu.activity" />
          <div className={style.block}>
            Latest Block: {latestBlock}{" "}
            {blockIsLoading && <i className="fas fa-spinner fa-spin ml-2" />}
          </div>
        </div>

        <React.Fragment>
          {Object.keys(nodes).length > 0 ? (
            <React.Fragment>
              {Object.values(nodes).map((node, index) => (
                <ActivityRow node={node} key={index} />
              ))}
              {pageInfo?.hasNextPage && (
                <Button
                  outline
                  color="primary"
                  size="sm"
                  block
                  disabled={!pageInfo?.hasNextPage || loadingRequest}
                  onClick={handleClick}
                  className="mt-2"
                >
                  Load more{" "}
                  {loadingRequest && (
                    <i className="fas fa-spinner fa-spin ml-2" />
                  )}
                </Button>
              )}
            </React.Fragment>
          ) : isLoading ? (
            <span style={{ color: "#808da0" }}>Loading Activities...</span>
          ) : (
            "No activity available right now"
          )}
        </React.Fragment>
      </div>
    </HeaderLayout>
  );
});
