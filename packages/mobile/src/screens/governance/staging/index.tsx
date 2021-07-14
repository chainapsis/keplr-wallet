import React, { FunctionComponent } from "react";
import { GovernanceCardBody } from "./card";
import { observer } from "mobx-react-lite";
import { PageWithSectionList } from "../../../components/staging/page";
import { useStore } from "../../../stores";
import { ObservableQueryProposal } from "@keplr-wallet/stores";
import { Card } from "../../../components/staging/card";
import { useStyle } from "../../../styles";

export const GovernanceScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore } = useStore();

  const style = useStyle();

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
      renderItem={({ item }: { item: ObservableQueryProposal }) => {
        return (
          <Card style={style.flatten(["margin-bottom-12"])}>
            <GovernanceCardBody proposalId={item.id} />
          </Card>
        );
      }}
    />
  );
});

export { GovernanceCardBody };
export * from "./details";
