import { fetchGovProposalTransactions } from "@graphQL/activity-api";
import React, { useEffect, useState } from "react";
import { Button } from "reactstrap";
import { useStore } from "../../../stores";
import { FilterActivities } from "../filter";
import { ActivityRow } from "./activity-row";
import style from "../style.module.scss";
const options = [
  { value: "YES", label: "Voted Yes" },
  { value: "NO", label: "Voted No" },
  { value: "ABSTAIN", label: "Voted Abstain" },
  { value: "NO_WITH_VETO", label: "Voted No With Veto" },
];

export const GovProposalsTab = ({ latestBlock }: { latestBlock: any }) => {
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [nodes, setNodes] = useState<any>({});
  const [pageInfo, setPageInfo] = useState<any>();
  const [filter, setFilter] = useState<string[]>(
    options.map((option) => option.value)
  );

  const fetchNodes = async (cursor: any) => {
    setIsLoading(true);
    const fetchedData = await fetchGovProposalTransactions(
      current.chainId,
      cursor,
      accountInfo.bech32Address,
      filter
    );
    if (fetchedData) {
      const nodeMap: any = {};
      fetchedData.nodes.map((node: any) => {
        nodeMap[node.id] = node;
      });

      setPageInfo(fetchedData.pageInfo);
      setNodes({ ...nodes, ...nodeMap });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchNodes("");
  }, []);

  useEffect(() => {
    fetchNodes("");
  }, [filter, latestBlock]);

  const handleClick = async () => {
    setLoadingRequest(true);
    await fetchNodes(pageInfo.endCursor);
    setLoadingRequest(false);
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
      {Object.keys(nodes).length > 0 ? (
        <React.Fragment>
          {Object.values(nodes)
            .filter((node: any) => filter.includes(node.option))
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
      ) : isLoading ? (
        <div className={style["activityMessage"]}>Loading Activities...</div>
      ) : (
        <div className={style["activityMessage"]}>
          No activity available right now
        </div>
      )}
    </React.Fragment>
  );
};
