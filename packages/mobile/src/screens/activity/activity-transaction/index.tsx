import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  View,
  Text,
  ViewStyle,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { fetchTransactions } from "../../../graphQL/activity-api";
import moment from "moment";
import { useStore } from "stores/index";
import { useStyle } from "styles/index";
import { CardDivider } from "components/card";
import { FilterItem } from "screens/activity";
import { activityFilterOptions, ActivityFilterView } from "./activity-filter";
import { ActivityRow } from "./activity-row";
import { observer } from "mobx-react-lite";
import { NoActivityView } from "screens/activity/activity-transaction/no-activity-view";

const processFilters = (filters: string[]) => {
  let result: any[] = [];
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
export const ActivityNativeTab: FunctionComponent<{
  latestBlock: any;
  isOpenModal: boolean;
  setIsOpenModal: any;
}> = observer(({ latestBlock, isOpenModal, setIsOpenModal }) => {
  const style = useStyle();
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const [_date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [fetchedData, setFetchedData] = useState<any>();

  const [pageInfo, setPageInfo] = useState<any>();
  const [nodes, setNodes] = useState({});
  const [filters, setFilters] = useState<FilterItem[]>(activityFilterOptions);

  const filter = useCallback(
    () =>
      filters
        .filter((filter) => filter.isSelected)
        .map((option) => option.value),
    [filters]
  )();

  const fetchNodes = debounce(async (cursor: any) => {
    setIsLoading(true);
    const data = await fetchTransactions(
      current.chainId,
      cursor,
      accountInfo.bech32Address,
      processFilters(filter)
    );
    setFetchedData(data?.nodes);
    if (!pageInfo || cursor != "") setPageInfo(data?.pageInfo);
    setIsLoading(false);
  }, 1000);

  useEffect(() => {
    fetchNodes("");
  }, []);

  useEffect(() => {
    fetchNodes("");
  }, [latestBlock, filters]);

  useEffect(() => {
    /// Execute bloc after 1.5 sec
    setTimeout(() => {
      setIsLoading(true);
      setPageInfo(undefined);
      setNodes({});
      fetchNodes("");
    }, 1500);
  }, [chainStore.current.chainId]);

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

  const handleFilterChange = (selectedFilters: FilterItem[]) => {
    setIsLoading(true);
    setPageInfo(undefined);
    setNodes({});
    setFilters(selectedFilters);
    setIsOpenModal(false);
  };

  const handleLoadMore = () => {
    if (!loadingRequest) {
      setLoadingRequest(true);
      fetchNodes(pageInfo?.endCursor);
    }
  };

  const renderFooter = () => {
    //it will show indicator at the bottom of the list when data is loading otherwise it returns null
    if (!pageInfo?.hasNextPage) return null;
    return (
      <React.Fragment>
        <ActivityIndicator
          size="large"
          color={style.get("color-white").color}
        />
        <View style={style.get("height-page-pad") as ViewStyle} />
      </React.Fragment>
    );
  };

  const renderList = (nodes: { [s: string]: unknown } | ArrayLike<unknown>) => {
    return (
      <FlatList
        data={Object.values(nodes)}
        scrollEnabled={false}
        renderItem={({ item, index }: { item: any; index: number }) => {
          const isLastPos = index == Object.values(nodes).length - 1;
          const currentDate = moment(item.block.timestamp)
            .utc()
            .format("MMMM DD, YYYY");
          const previousNode: any =
            index > 0 ? Object.values(nodes)[index - 1] : null;
          const previousDate = previousNode
            ? moment(previousNode.block.timestamp).utc().format("MMMM DD, YYYY")
            : null;
          const shouldDisplayDate = currentDate !== previousDate;

          return (
            <React.Fragment key={index}>
              {!shouldDisplayDate && (
                <View style={style.flatten(["height-1"]) as ViewStyle} />
              )}
              {shouldDisplayDate && (
                <Text
                  style={
                    style.flatten([
                      "color-gray-300",
                      "margin-left-16",
                      "body3",
                      "margin-bottom-12",
                    ]) as ViewStyle
                  }
                >
                  {currentDate}
                </Text>
              )}
              <ActivityRow setDate={setDate} node={item} />
              {isLastPos && (
                <View style={style.get("height-page-pad") as ViewStyle} />
              )}
            </React.Fragment>
          );
        }}
        keyExtractor={(_item, index) => index.toString()}
        ItemSeparatorComponent={() => (
          <CardDivider style={style.flatten(["margin-y-16"]) as ViewStyle} />
        )}
        ListFooterComponent={() => renderFooter()}
        onEndReachedThreshold={0.4}
        onEndReached={() => handleLoadMore()}
      />
    );
  };

  const data = Object.values(nodes).filter((node: any) =>
    processFilters(filter).includes(node.transaction.messages.nodes[0].typeUrl)
  );

  return (
    <React.Fragment>
      {data.length > 0 && renderList(nodes)}
      {data.length == 0 && isLoading ? (
        <ActivityIndicator
          size="large"
          color={style.get("color-white").color}
        />
      ) : (
        data.length == 0 && <NoActivityView />
      )}
      <ActivityFilterView
        isOpen={isOpenModal}
        filters={filters}
        handleFilterChange={handleFilterChange}
        close={() => setIsOpenModal(false)}
      />
    </React.Fragment>
  );
});
