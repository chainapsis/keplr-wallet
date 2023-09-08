import { fetchTransactions } from "@graphQL/activity-api";
import React, { useEffect, useState } from "react";
import { Button } from "reactstrap";
import { useStore } from "../../../stores";
import { FilterActivities } from "../filter";
import { ActivityRow } from "./activity-row";
import style from "../style.module.scss";

const options = [
  { value: "/cosmos.bank.v1beta1.MsgSend", label: "Funds transfers" },
  {
    value: "/cosmos.staking.v1beta1.MsgDelegate",
    label: "Staked Funds",
  },
  {
    value: "/cosmos.staking.v1beta1.MsgUndelegate",
    label: "Unstaked Funds",
  },
  {
    value: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
    label: "Redelegate Funds",
  },
  {
    value:
      "/cosmos.authz.v1beta1.MsgExec,/cosmwasm.wasm.v1.MsgExecuteContract,/cosmos.authz.v1beta1.MsgRevoke",
    label: "Contract Interactions",
  },
  {
    value: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
    label: "Claim Rewards",
  },
  {
    value: "/ibc.applications.transfer.v1.MsgTransfer",
    label: "IBC transfers",
  },
];

const processFilters = (filters: string[]) => {
  let result: string[] = [];
  filters.map((value) => {
    result = result.concat(value.split(","));
  });
  return result;
};

function debounce(func: any, timeout = 500) {
  let timer: any;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(args);
    }, timeout);
  };
}

export const NativeTab = ({ latestBlock }: { latestBlock: any }) => {
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [fetchedData, setFetchedData] = useState<any>();
  const [nodes, setNodes] = useState<any>({});
  const [pageInfo, setPageInfo] = useState<any>();
  const [filter, setFilter] = useState<string[]>(
    options.map((option) => option.value)
  );

  const fetchNodes = debounce(async (cursor: any) => {
    setIsLoading(true);
    const data = await fetchTransactions(
      current.chainId,
      cursor,
      accountInfo.bech32Address,
      processFilters(filter)
    );
    setFetchedData(data?.nodes);
    if (!pageInfo || cursor != "") setPageInfo(data.pageInfo);
  }, 1000);

  useEffect(() => {
    fetchNodes("");
  }, [filter, latestBlock]);

  useEffect(() => {
    if (fetchedData) {
      const nodeMap: any = {};
      fetchedData.map((node: any) => {
        nodeMap[node.id] = node;
      });
      setNodes({ ...nodes, ...nodeMap });
      setIsLoading(false);
      setLoadingRequest(false);
    }
  }, [fetchedData]);

  const handleClick = () => {
    setLoadingRequest(true);
    fetchNodes(pageInfo.endCursor);
  };

  const handleFilterChange = (selectedFilter: string[]) => {
    setPageInfo(undefined);
    setNodes({});
    setFilter(selectedFilter);
  };

  return (
    <React.Fragment>
      <FilterActivities
        onFilterChange={handleFilterChange}
        options={options}
        selectedFilter={filter}
      />
      {Object.values(nodes).filter((node: any) =>
        processFilters(filter).includes(
          node.transaction.messages.nodes[0].typeUrl
        )
      ).length > 0 ? (
        <React.Fragment>
          {Object.values(nodes)
            .filter((node: any) =>
              processFilters(filter).includes(
                node.transaction.messages.nodes[0].typeUrl
              )
            )
            .map((node, index) => (
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
              {loadingRequest && <i className="fas fa-spinner fa-spin ml-2" />}
            </Button>
          )}
        </React.Fragment>
      ) : isLoading && filter.length > 0 ? (
        <div className={style["activityMessage"]}>Loading Activities...</div>
      ) : (
        <div className={style["activityMessage"]}>
          No activity available right now
        </div>
      )}
    </React.Fragment>
  );
};
