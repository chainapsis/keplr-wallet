import React, { FunctionComponent, useMemo } from "react";
import { GovernanceCardBody } from "./card";
import { observer } from "mobx-react-lite";
import { PageWithSectionList, PageWithView } from "../../components/page";
import { useStore } from "../../stores";
import {
  ObservableQueryProposal,
  ObservableQueryProposalV1,
} from "@keplr-wallet/stores";
import { Card, CardDivider } from "../../components/card";
import { useStyle } from "../../styles";
import { ProposalStatus } from "@keplr-wallet/stores/build/query/cosmos/governance/types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { GovernanceV1ChainIdentifiers } from "../../config";
import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export const GovernanceScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, scamProposalStore } = useStore();

  const style = useStyle();
  const queries = queriesStore.get(chainStore.current.chainId);

  const sections = useMemo(() => {
    const isGovernanceV1 = GovernanceV1ChainIdentifiers.includes(
      ChainIdHelper.parse(chainStore.current.chainId).identifier
    );

    // proposalQuery 의 형식은 _DeepReadonlyArray<ObservableQueryProposal> | _DeepReadonlyArray<ObservableQueryProposalV1>이다
    // _DeepReadonlyArray를 유니온 한 타입은 filter를 사용했을 때 타입이 제대로 유추되지 않는다. any로 추론된다.
    const proposals = (isGovernanceV1
      ? queries.cosmos.queryGovernanceV1.proposals
      : queries.cosmos.queryGovernance.proposals
    )
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .filter(
        (proposal: ObservableQueryProposal | ObservableQueryProposalV1) =>
          !scamProposalStore.isScamProposal(
            chainStore.current.chainId,
            proposal.id
          )
      );

    return [
      {
        data: proposals.filter(
          (p: ObservableQueryProposal | ObservableQueryProposalV1) =>
            p.proposalStatus !== ProposalStatus.DEPOSIT_PERIOD
        ),
      },
    ];
  }, [
    queries.cosmos.queryGovernance.proposals,
    queries.cosmos.queryGovernanceV1.proposals,
  ]);

  const isEmpty = (() => {
    if (sections.length === 0) {
      return true;
    }

    for (const section of sections) {
      if (section.data.length > 0) {
        return false;
      }
    }

    return true;
  })();

  if (isEmpty) {
    return (
      <PageWithView backgroundMode="gradient">
        <View style={style.flatten(["padding-page", "items-center"])}>
          <View style={style.flatten(["height-144"])} />
          <EmptyIcon
            size={72}
            color={
              style.flatten(["color-gray-200", "dark:color-platinum-400"]).color
            }
          />
          <View style={style.flatten(["height-12"])} />
          <Text
            style={style.flatten([
              "subtitle3",
              "color-gray-200",
              "dark:color-platinum-400",
              "width-half",
              "text-center",
            ])}
          >
            No records of past or ongoing proposals found.
          </Text>
        </View>
      </PageWithView>
    );
  }

  return (
    <PageWithSectionList
      backgroundMode="gradient"
      sections={sections}
      keyExtractor={(item: ObservableQueryProposal) => {
        return item.id;
      }}
      renderItem={({
        item,
        index,
        section,
      }: {
        item: ObservableQueryProposal;
        index: number;
        section: { data: unknown[] };
      }) => {
        return (
          <React.Fragment>
            <Card
              style={style.flatten(
                [],
                [
                  index === 0 && "margin-top-card-gap",
                  index === section.data.length - 1 && "margin-bottom-card-gap",
                ]
              )}
            >
              <GovernanceCardBody proposalId={item.id} />
              {index === section.data.length - 1 ? null : <CardDivider />}
            </Card>
          </React.Fragment>
        );
      }}
    />
  );
});

const EmptyIcon: FunctionComponent<{ size: number; color: string }> = ({
  size = 72,
  color,
}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 72 72">
      <Path
        d="M45 40.5H27M39.182 18.932L32.818 12.568C31.9741 11.7241 30.8295 11.25 29.636 11.25H13.5C9.77208 11.25 6.75 14.2721 6.75 18V54C6.75 57.7279 9.77208 60.75 13.5 60.75H58.5C62.2279 60.75 65.25 57.7279 65.25 54V27C65.25 23.2721 62.2279 20.25 58.5 20.25H42.364C41.1705 20.25 40.0259 19.7759 39.182 18.932Z"
        stroke={color}
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export { GovernanceCardBody };
export * from "./details";
