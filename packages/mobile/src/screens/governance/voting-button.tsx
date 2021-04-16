import React, { FunctionComponent, useEffect, useState } from "react";
import { Button, Text, useTheme } from "react-native-elements";

import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useStore } from "../../stores";
import { Governance } from "@keplr-wallet/stores";
import { WhiteButton, DefaultButton } from "../../components/buttons";

type VoteType = "Yes" | "Abstain" | "No" | "No With Veto";

export const VotingButton: FunctionComponent<{
  proposalId: string;
}> = observer(({ proposalId }) => {
  const [isOpenVoteModal, setOpenVoteModal] = useState(false);
  const [voteActive, setVoteActive] = useState<VoteType | undefined>();

  const { accountStore, queriesStore, chainStore } = useStore();

  const proposal = queriesStore
    .get(chainStore.current.chainId)
    .getQueryGovernance()
    .getProposal(proposalId);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  useEffect(() => {
    if (!isOpenVoteModal) {
      setVoteActive(undefined);
    }
  }, [isOpenVoteModal]);

  const sendGovVoteMsg = async () => {
    if (!voteActive || !accountInfo.isReadyToSendMsgs) {
      return;
    }

    try {
      await accountInfo.sendGovVoteMsg(proposalId, voteActive, "");
    } catch (e) {}
  };

  const isProposalLoaded = proposal != null;
  const isProposalInVotingPeriod =
    proposal != null &&
    proposal.proposalStatus === Governance.ProposalStatus.VOTING_PERIOD;

  const handleCloseModal = () => {
    setOpenVoteModal(false);
  };

  const statusText = (() => {
    if (!proposal) {
      return "Not Loaded";
    }

    switch (proposal.proposalStatus) {
      case Governance.ProposalStatus.DEPOSIT_PERIOD:
        return "Voting Not Started ";
      case Governance.ProposalStatus.VOTING_PERIOD:
        return "Vote";
      default:
        return "Voting Ended";
    }
  })();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 10,
        left: 0,
        width: "100%",
        paddingHorizontal: 10,
      }}
    >
      {isOpenVoteModal === false ? (
        <Button
          title={statusText}
          onPress={() => {
            setOpenVoteModal(true);
          }}
          disabled={
            !isProposalLoaded ||
            !isProposalInVotingPeriod ||
            !accountInfo.isReadyToSendMsgs
          }
        />
      ) : (
        <View style={{ borderRadius: 10, backgroundColor: "#fff" }}>
          <VoteOptionGroup
            active={voteActive}
            handleSetActive={setVoteActive}
          />
          <View style={{ flexDirection: "row" }}>
            <WhiteButton
              title="Cancel"
              color="warning"
              onPress={() => handleCloseModal()}
            />
            <DefaultButton
              title="Confirm"
              onPress={async (e) => {
                await sendGovVoteMsg();
              }}
              loading={accountInfo.isSendingMsg === "govVote"}
              disabled={!voteActive || !accountInfo.isReadyToSendMsgs}
            />
          </View>
        </View>
      )}
    </View>
  );
});

interface VoteOtionsGroupProps {
  active?: VoteType;
  handleSetActive: (selected: VoteType) => void;
}

const VoteOptionGroup: FunctionComponent<VoteOtionsGroupProps> = ({
  active,
  handleSetActive,
}) => {
  const [options] = useState<VoteType[]>([
    "Yes",
    "No",
    "No With Veto",
    "Abstain",
  ]);

  const selectVote = (selected: VoteType) => {
    handleSetActive(selected);
  };

  return (
    <View>
      {options.map((v) => (
        <RectButton rippleColor="#AAAAAA" key={v} onPress={() => selectVote(v)}>
          <VoteCheckbox active={v === active} optionText={v} />
        </RectButton>
      ))}
    </View>
  );
};

const VoteCheckbox: FunctionComponent<{
  active: boolean;
  optionText: string;
}> = ({ active, optionText }) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderColor: theme.colors?.greyOutline,
      }}
    >
      <View
        style={{
          width: 25,
          height: 25,
          borderRadius: 100,
          backgroundColor: active ? theme.colors?.primary : theme.colors?.grey3,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 100,
            backgroundColor: "#fff",
          }}
        />
      </View>
      <Text style={{ fontSize: 14, fontWeight: "700" }}>{optionText}</Text>
    </View>
  );
};
