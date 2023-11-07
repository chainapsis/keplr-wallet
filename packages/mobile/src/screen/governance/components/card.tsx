import React, {FunctionComponent, useState} from 'react';
import {observer} from 'mobx-react-lite';

import {Text, View} from 'react-native';
// import {LoadingSpinner} from '../../components/spinner';
// import {useStore} from '../../../stores';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';
import {SVGLoadingIcon} from '../../../components/spinner';
import {RectButton} from '../../../components/rect-button';
import {Stack} from '../../../components/stack';
import {Column, Columns} from '../../../components/column';
import {useStore} from '../../../stores';
import {ProposalStatus} from '../../../stores/governance/types';
import {useIntl} from 'react-intl';
import {dateToLocalString} from '../utils';
import {ObservableQueryProposal} from '../../../stores/governance';
import {ObservableQueryProposalV1} from '../../../stores/governance/v1';
import {Chip} from '../../../components/chip';
// import {dateToLocalString} from '../utils';
// import {useIntl} from 'react-intl';

export const GovernanceProposalStatusChip: FunctionComponent<{
  status: ProposalStatus;
}> = ({status}) => {
  switch (status) {
    case ProposalStatus.DEPOSIT_PERIOD:
      return <Chip text="Deposit period" color="primary" mode="outline" />;
    case ProposalStatus.VOTING_PERIOD:
      return <Chip text="Voting period" color="primary" mode="fill" />;
    case ProposalStatus.PASSED:
      return <Chip text="Passed" color="primary" mode="light" />;
    case ProposalStatus.REJECTED:
      return <Chip text="Rejected" color="danger" mode="light" />;
    case ProposalStatus.FAILED:
      return <Chip text="Failed" color="danger" mode="fill" />;
    default:
      return <Chip text="Unspecified" color="danger" mode="fill" />;
  }
};

export const GovernanceCardBody: FunctionComponent<{
  proposalId: string;
  chainId: string;
  isV1: boolean;
}> = observer(({proposalId, chainId, isV1}) => {
  const {queriesStore} = useStore();

  const style = useStyle();
  // const intl = useIntl();
  // const queries = queriesStore.get(chainStore.current.chainId);
  const queryGovernance = isV1
    ? queriesStore.get(chainId).governanceV1.queryGovernance
    : queriesStore.get(chainId).governance.queryGovernance;
  const proposal = queryGovernance.getProposal(proposalId);
  const intl = useIntl();
  const renderProposalDateString = (
    proposal: ObservableQueryProposal | ObservableQueryProposalV1,
  ) => {
    switch (proposal.proposalStatus) {
      case ProposalStatus.DEPOSIT_PERIOD:
        return `Voting ends: ${dateToLocalString(
          intl,
          proposal.raw.deposit_end_time,
        )}`;
      case ProposalStatus.VOTING_PERIOD:
      case ProposalStatus.FAILED:
      case ProposalStatus.PASSED:
      case ProposalStatus.REJECTED:
      case ProposalStatus.UNSPECIFIED:
        return `Voting ends: ${dateToLocalString(
          intl,
          proposal.raw.voting_end_time,
        )}`;
    }
  };

  const [current] = useState(() => new Date().getTime());

  // Relative time is not between the end time and actual current time.
  // Relative time is between the end time and "the time that the component is mounted."
  const proposalRelativeEndTimeString = (() => {
    if (!proposal) {
      return '';
    }

    switch (proposal.proposalStatus) {
      case ProposalStatus.DEPOSIT_PERIOD:
        const relativeDepositEndTime =
          (new Date(proposal.raw.deposit_end_time).getTime() - current) / 1000;
        const relativeDepositEndTimeDays = Math.floor(
          relativeDepositEndTime / (3600 * 24),
        );
        const relativeDepositEndTimeHours = Math.ceil(
          relativeDepositEndTime / 3600,
        );

        if (relativeDepositEndTimeDays) {
          return (
            intl
              .formatRelativeTime(relativeDepositEndTimeDays, 'days', {
                numeric: 'always',
              })
              .replace('in ', '') + ' left'
          );
        } else if (relativeDepositEndTimeHours) {
          return (
            intl
              .formatRelativeTime(relativeDepositEndTimeHours, 'hours', {
                numeric: 'always',
              })
              .replace('in ', '') + ' left'
          );
        }
        return '';
      case ProposalStatus.VOTING_PERIOD:
        const relativeVotingEndTime =
          (new Date(proposal.raw.voting_end_time).getTime() - current) / 1000;
        const relativeVotingEndTimeDays = Math.floor(
          relativeVotingEndTime / (3600 * 24),
        );
        const relativeVotingEndTimeHours = Math.ceil(
          relativeVotingEndTime / 3600,
        );

        if (relativeVotingEndTimeDays) {
          return (
            intl
              .formatRelativeTime(relativeVotingEndTimeDays, 'days', {
                numeric: 'always',
              })
              .replace('in ', '') + ' left'
          );
        } else if (relativeVotingEndTimeHours) {
          return (
            intl
              .formatRelativeTime(relativeVotingEndTimeHours, 'hours', {
                numeric: 'always',
              })
              .replace('in ', '') + ' left'
          );
        }
        return '';
      case ProposalStatus.FAILED:
      case ProposalStatus.PASSED:
      case ProposalStatus.REJECTED:
      case ProposalStatus.UNSPECIFIED:
        return '';
    }
  })();

  return (
    <Box
      borderRadius={6}
      style={style.flatten(['overflow-hidden', 'background-color-gray-600'])}>
      {proposal ? (
        <RectButton
          style={style.flatten(['padding-16'])}
          onPress={() => {
            //TODO 웹으로 이동
          }}>
          <Stack gutter={9}>
            <Columns sum={1}>
              <Text style={style.flatten(['subtitle3', 'color-text-high'])}>
                {proposal.id}
              </Text>
              <Column weight={1} />
              <GovernanceProposalStatusChip status={proposal.proposalStatus} />
            </Columns>

            <View style={style.flatten(['margin-bottom-8'])}>
              <Text style={style.flatten(['subtitle3', 'color-text-high'])}>
                {proposal.title}
                title
              </Text>
            </View>
            <Columns sum={1}>
              <Text style={style.flatten(['body3', 'color-text-low'])}>
                {renderProposalDateString(proposal)}
                {}
              </Text>

              {proposalRelativeEndTimeString ? (
                <Text
                  style={style.flatten(['text-caption1', 'color-text-middle'])}>
                  {proposalRelativeEndTimeString}
                </Text>
              ) : null}
            </Columns>
          </Stack>
        </RectButton>
      ) : (
        <View
          style={style.flatten([
            'height-governance-card-body-placeholder',
            'justify-center',
            'items-center',
          ])}>
          <SVGLoadingIcon
            color={style.get('color-loading-spinner').color}
            size={22}
          />
        </View>
      )}
    </Box>
  );
});
