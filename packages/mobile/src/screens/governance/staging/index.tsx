import React, { FunctionComponent } from "react";
import { GovernanceCardBody } from "./card";
import { observer } from "mobx-react-lite";
import { PageWithSectionList } from "../../../components/staging/page";
import { useStore } from "../../../stores";
import { ObservableQueryProposal } from "@keplr-wallet/stores";
import { Card, CardDivider } from "../../../components/staging/card";

export const GovernanceScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const sections = (() => {
    const proposals = queries.cosmos.queryGovernance.proposals;

    return [{ data: proposals }];
  })();

  return (
    <PageWithSectionList
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
            <Card>
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
