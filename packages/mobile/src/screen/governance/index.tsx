import React, {FunctionComponent, useMemo, useRef} from 'react';
import {observer} from 'mobx-react-lite';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {Platform, StyleSheet, Text, ViewStyle} from 'react-native';
import {useStore} from '../../stores';
import {Dec} from '@keplr-wallet/unit';
import {ViewToken} from '../../components/token-view';
import {Gutter} from '../../components/gutter';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../navigation';
import {TextButton} from '../../components/text-button';
import {ArrowRightIcon} from '../../components/icon/arrow-right';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Modal} from '../../components/modal';
import {
  GovSelectChainModal,
  SelectModalItem,
} from './components/select-modal-gov';
import {RectButton} from '../../components/rect-button';
import {Column, Columns} from '../../components/column';
import {ChainImageFallback} from '../../components/image';
import {Stack} from '../../components/stack';
import {XAxis} from '../../components/axis';
import {
  GovernanceV1ChainIdentifiers,
  NoDashboardLinkIdentifiers,
} from '../../config';
import {ChainIdHelper} from '@keplr-wallet/cosmos';

export const GovernanceScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const {hugeQueriesStore, queriesStore, scamProposalStore} = useStore();
  const selectChainModalRef = useRef<BottomSheetModal>(null);
  const navigation = useNavigation<StackNavProp>();

  const delegations: ViewToken[] = useMemo(
    () =>
      hugeQueriesStore.delegations.filter(token => {
        return token.token.toDec().gt(new Dec(0));
      }),
    [hugeQueriesStore.delegations],
  );
  const modalItems: SelectModalItem[] = useMemo(() => {
    return hugeQueriesStore.stakables
      .filter(
        viewToken =>
          !NoDashboardLinkIdentifiers.includes(
            ChainIdHelper.parse(viewToken.chainInfo.chainId).identifier,
          ),
      )
      .map(viewToken => {
        return {
          key: viewToken.chainInfo.chainId,
          label: viewToken.chainInfo.chainName,
          imageUrl: viewToken.chainInfo.chainSymbolImageUrl,
        } as SelectModalItem;
      });
  }, [hugeQueriesStore.stakables]);

  const viewItems = delegations
    .filter(
      viewToken =>
        !NoDashboardLinkIdentifiers.includes(
          ChainIdHelper.parse(viewToken.chainInfo.chainId).identifier,
        ),
    )
    .map(delegation => {
      const isGovV1Supported =
        GovernanceV1ChainIdentifiers.includes(
          ChainIdHelper.parse(delegation.chainInfo.chainId).identifier,
        ) ||
        !(
          //NOTE gov/v1이 구현되어있지 않을때 error code 12가 반환되서 일단 이렇게 검증함
          (
            (
              queriesStore
                .get(delegation.chainInfo.chainId)
                .governanceV1.queryGovernance.getQueryGovernance({
                  status: 'PROPOSAL_STATUS_VOTING_PERIOD',
                  'pagination.limit': 3000,
                }).error?.data as {code: number}
            )?.code === 12
          )
        );

      return isGovV1Supported
        ? {
            isGovV1Supported,
            proposalLen: queriesStore
              .get(delegation.chainInfo.chainId)
              .governanceV1.queryGovernance.getQueryGovernance({
                status: 'PROPOSAL_STATUS_VOTING_PERIOD',
                'pagination.limit': 3000,
              })
              .proposals.filter(
                proposal =>
                  !scamProposalStore.isScamProposal(
                    delegation.chainInfo.chainId,
                    proposal.id,
                  ),
              ).length,
            chainId: delegation.chainInfo.chainId,
            imageUrl: delegation.chainInfo.chainSymbolImageUrl,
            chainName: delegation.chainInfo.chainName,
          }
        : {
            isGovV1Supported,
            proposalLen: queriesStore
              .get(delegation.chainInfo.chainId)
              .governance.queryGovernance.getQueryGovernance({
                status: 'PROPOSAL_STATUS_VOTING_PERIOD',
              })
              .proposals.filter(
                proposal =>
                  !scamProposalStore.isScamProposal(
                    delegation.chainInfo.chainId,
                    proposal.id,
                  ),
              ).length,
            chainId: delegation.chainInfo.chainId,
            imageUrl: delegation.chainInfo.chainSymbolImageUrl,
            chainName: delegation.chainInfo.chainName,
          };
    });

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      style={style.flatten(['padding-x-12'])}>
      <TextButton
        text="전체 체인의 프로포절들 보기"
        size="large"
        color="faint"
        containerStyle={style.flatten(['padding-x-12', 'padding-y-6'])}
        onPress={() => {
          selectChainModalRef.current?.present();
        }}
        rightIcon={
          <ArrowRightIcon size={18} color={style.get('color-text-low').color} />
        }
      />
      <Gutter size={12} />
      {viewItems.map(item => {
        return (
          <React.Fragment key={item.chainId}>
            <ChainItem
              chainName={item.chainName}
              imageUrl={item.imageUrl}
              proposalLen={item.proposalLen}
              key={item.chainId}
              onClick={() => {
                navigation.navigate('Governance', {
                  screen: 'Governance.list',
                  params: {
                    chainId: item.chainId,
                    isGovV1Supported: item.isGovV1Supported,
                  },
                });
              }}
            />
            <Gutter size={12} />
          </React.Fragment>
        );
      })}
      <Modal
        ref={selectChainModalRef} //NOTE BottomSheetTextInput가 안드로이드일때 올바르게 동작 하지 않고
        //같은 50% 일때 키보드가 있을시 모달 크기가 작아서 안드로이드 일때만 70% 으로 설정
        snapPoints={Platform.OS === 'android' ? ['70%'] : ['50%']}>
        <GovSelectChainModal
          items={modalItems}
          placeholder="search for chain"
          onSelect={({key}) => {
            navigation.navigate('Governance', {
              screen: 'Governance.list',
              params: {
                chainId: key,
                isGovV1Supported: viewItems.find(viewItem => {
                  return viewItem.chainId === key;
                })?.isGovV1Supported,
              },
            });
          }}
        />
      </Modal>
    </PageWithScrollView>
  );
});

interface ChainItemProps {
  onClick?: () => void;
  imageUrl?: string;
  chainName: string;
  proposalLen: number;
}
export const ChainItem: FunctionComponent<ChainItemProps> = observer(
  ({chainName, imageUrl, proposalLen, onClick}) => {
    const style = useStyle();

    const containerStyle: ViewStyle = {
      backgroundColor: style.get('color-gray-600').color,
      paddingVertical: 18,
      paddingLeft: 16,
      paddingRight: 8,
      borderRadius: 6,
    };

    return (
      <RectButton
        style={StyleSheet.flatten([containerStyle])}
        rippleColor={style.get('color-gray-550').color}
        underlayColor={style.get('color-gray-550').color}
        activeOpacity={1}
        onPress={() => {
          if (onClick) {
            onClick();
          }
        }}>
        <Columns sum={1} gutter={8} alignY="center">
          <ChainImageFallback
            style={{
              width: 32,
              height: 32,
            }}
            src={imageUrl}
            alt={chainName}
          />

          <Gutter size={12} />

          <XAxis alignY="center">
            <Text
              style={style.flatten([
                'flex-row',
                'flex-wrap',
                'subtitle3',
                'color-text-high',
              ])}>
              {chainName}
            </Text>
          </XAxis>

          <Column weight={1} />

          <Columns sum={1} gutter={2} alignY="center">
            <Stack gutter={2} alignX="right">
              <Text style={style.flatten(['body2', 'color-text-low'])}>
                {proposalLen} Proposals
              </Text>
            </Stack>

            <ArrowRightIcon
              size={24}
              color={style.get('color-text-low').color}
            />
          </Columns>
        </Columns>
      </RectButton>
    );
  },
);
