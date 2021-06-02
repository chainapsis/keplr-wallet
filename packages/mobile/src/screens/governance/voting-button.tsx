import React, { FunctionComponent, useEffect, useState } from "react";
import { Text } from "react-native-elements";

import { observer } from "mobx-react-lite";
import { StyleProp, View, ViewProps } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useStore } from "../../stores";
import { Governance } from "@keplr-wallet/stores";
import { FlexWhiteButton, FlexButton } from "../../components/buttons";
import {
  alignItemsCenter,
  bgcWhite,
  justifyContentCenter,
  flexDirectionRow,
  mr4,
  sf,
  bgcGrey,
  px4,
  py4,
  bbw1,
  bcGrey,
  bgcPrimary,
  br2,
  buttonFont2,
} from "../../styles";

type VoteType = "Yes" | "Abstain" | "No" | "NoWithVeto";

export const VotingButton: FunctionComponent<{
  proposalId: string;
}> = observer(({ proposalId }) => {
  const [isOpenVoteModal, setOpenVoteModal] = useState(false);
  const [voteActive, setVoteActive] = useState<VoteType | undefined>();

  const { accountStore, queriesStore, chainStore } = useStore();

  const proposal = queriesStore
    .get(chainStore.current.chainId)
    .cosmos.queryGovernance.getProposal(proposalId);

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
      await accountInfo.cosmos.sendGovVoteMsg(proposalId, voteActive, "");
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
        left: 8,
        width: "100%",
      }}
    >
      {isOpenVoteModal === false ? (
        <FlexButton
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
        <View style={sf([br2, { backgroundColor: "#fff" }])}>
          <VoteOptionGroup
            active={voteActive}
            handleSetActive={setVoteActive}
          />
          <View style={flexDirectionRow}>
            <FlexWhiteButton
              title="Cancel"
              color="warning"
              onPress={() => handleCloseModal()}
            />
            <FlexButton
              title="Confirm"
              onPress={async () => {
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
    "NoWithVeto",
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
  const color: StyleProp<ViewProps> = active ? bgcPrimary : bgcGrey;

  return (
    <View
      accessible
      style={sf([flexDirectionRow, alignItemsCenter, px4, py4, bbw1, bcGrey])}
    >
      <View
        style={sf([
          {
            width: 25,
            height: 25,
            borderRadius: 100,
          },
          color,
          justifyContentCenter,
          alignItemsCenter,
          mr4,
        ])}
      >
        <View
          style={sf([
            {
              width: 10,
              height: 10,
              borderRadius: 100,
            },
            bgcWhite,
          ])}
        />
      </View>
      <Text style={buttonFont2}>{optionText}</Text>
    </View>
  );
};
