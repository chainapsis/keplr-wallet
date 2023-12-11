import React, {FunctionComponent, useEffect} from 'react';
import {observer} from 'mobx-react-lite';

import {Text, View} from 'react-native';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';
import {SVGLoadingIcon} from '../../../components/spinner';
import {RectButton} from '../../../components/rect-button';
import {Stack} from '../../../components/stack';
import {Column, Columns} from '../../../components/column';
import {useStore} from '../../../stores';
import {ProposalStatus, ViewProposal} from '../../../stores/governance/types';
import {useIntl} from 'react-intl';
import {dateToLocalString} from '../utils';
import {Chip} from '../../../components/chip';
import {CheckCircleIcon} from '../../../components/icon';
import {Gutter} from '../../../components/gutter';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../navigation';
import {DASHBOARD_URL} from '../../../config';
import {formatRelativeTimeString} from '../../../utils/format';

export const GovernanceProposalStatusChip: FunctionComponent<{
  status: ProposalStatus;
}> = ({status}) => {
  const style = useStyle();
  switch (status) {
    case ProposalStatus.VOTING_PERIOD:
      return (
        <Chip
          text={
            <Columns sum={1} gutter={4} alignY="center" columnAlign="center">
              <Text style={style.flatten(['color-text-high', 'text-caption1'])}>
                Voting period
              </Text>
              <Box
                alignX="center"
                alignY="center"
                width={6}
                height={6}
                borderRadius={64}
                backgroundColor={style.get('color-blue-300').color}
              />
            </Columns>
          }
        />
      );

    case ProposalStatus.PASSED:
      return <Chip text="Passed" color="success" />;
    case ProposalStatus.REJECTED:
      return <Chip text="Rejected" color="danger" />;
    case ProposalStatus.FAILED:
      return <Chip text="Failed" color="danger" />;
    default:
      return <Chip text="Unspecified" color="danger" />;
  }
};

export const GovernanceCardBody: FunctionComponent<{
  proposal: ViewProposal;
  chainId: string;
  isGovV1Supported?: boolean;
  refreshing: number;
}> = observer(({proposal, chainId, isGovV1Supported, refreshing}) => {
  const {chainStore, queriesStore, accountStore} = useStore();

  const style = useStyle();
  const gov = (() => {
    return isGovV1Supported
      ? queriesStore
          .get(chainId)
          .governanceV1.queryVotes.getVote(
            proposal.id,
            accountStore.getAccount(chainId).bech32Address,
          )
      : queriesStore
          .get(chainId)
          .governance.queryVotes.getVote(
            proposal.id,
            accountStore.getAccount(chainId).bech32Address,
          );
  })();

  const intl = useIntl();
  useEffect(() => {
    if (refreshing > 0) {
      gov.refetch();
    }
  }, [gov, refreshing]);

  const navigation = useNavigation<StackNavProp>();
  const isVoted = gov.vote !== 'Unspecified';

  const renderProposalDateString = (proposal: ViewProposal) => {
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

  // Relative time is not between the end time and actual current time.
  // Relative time is between the end time and "the time that the component is mounted."
  const proposalRelativeEndTimeString = (() => {
    if (!proposal) {
      return '';
    }

    switch (proposal.proposalStatus) {
      case ProposalStatus.DEPOSIT_PERIOD:
        return formatRelativeTimeString(intl, proposal.raw.deposit_end_time, {
          numeric: 'always',
        });

      case ProposalStatus.VOTING_PERIOD:
        return formatRelativeTimeString(intl, proposal.raw.voting_end_time, {
          numeric: 'always',
        });
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
      style={style.flatten([
        'overflow-hidden',
        'background-color-card-default',
      ])}>
      {proposal ? (
        <RectButton
          style={style.flatten(['padding-16'])}
          onPress={() => {
            //NOTE cronose pos 같은 공백이 있는 체인이름 대시보드애서
            // cronose-pos으로 연결해서 공백이 있는경우 -으로 join 함
            const url = `${DASHBOARD_URL}/chains/${chainStore
              .getChain(chainId)
              .chainName.toLowerCase()
              .split(' ')
              .join('-')}/proposals/${[proposal.id]}`;

            if (url) {
              navigation.navigate('Web', {
                url,
                isExternal: true,
              });
            }
          }}>
          <Stack gutter={9}>
            <Columns sum={1}>
              <Text style={style.flatten(['subtitle3', 'color-text-high'])}>
                {proposal.id}
              </Text>
              <Column weight={1} />
              {isVoted ? (
                <React.Fragment>
                  <Chip
                    backgroundStyle={style.flatten([
                      'background-color-gray-400',
                    ])}
                    text={
                      <Box alignX="center" alignY="center">
                        <Columns sum={1} gutter={2}>
                          <Text
                            style={style.flatten([
                              'color-text-middle',
                              'text-caption1',
                            ])}>
                            Voted
                          </Text>
                          <CheckCircleIcon
                            size={16}
                            color={style.get('color-text-middle').color}
                          />
                        </Columns>
                      </Box>
                    }
                  />
                  <Gutter size={4} />
                </React.Fragment>
              ) : null}
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
              <Column weight={1} />
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
