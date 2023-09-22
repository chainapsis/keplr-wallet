import React, { FunctionComponent, useMemo } from "react";
import { GovernanceCardBody } from "./card";
import { observer } from "mobx-react-lite";
import { PageWithSectionList } from "../../components/page";
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

export const GovernanceScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, scamProposalStore } = useStore();

  const style = useStyle();

  const chainIdentifier = ChainIdHelper.parse(chainStore.current.chainId)
    .identifier;
  const queries = queriesStore.get(chainStore.current.chainId);

  const sections = useMemo(() => {
    const proposals = (GovernanceV1ChainIdentifiers.includes(chainIdentifier)
      ? queries.cosmos.queryGovernanceV1.proposals
      : queries.cosmos.queryGovernance.proposals
    ).filter(
      (proposal: ObservableQueryProposal | ObservableQueryProposalV1) =>
        !scamProposalStore.isScamProposal(
          chainStore.current.chainId,
          proposal.id
        )
    );

    return [
      {
        data: proposals.filter(
          (p) => p.proposalStatus !== ProposalStatus.DEPOSIT_PERIOD
        ),
      },
    ];
  }, [queries.cosmos.queryGovernance.proposals]);

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

export { GovernanceCardBody };
export * from "./details";
