import React, {FunctionComponent, useMemo, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {StyleSheet, Text, ViewStyle} from 'react-native';
import {useStore} from '../../stores';
import {Dec} from '@keplr-wallet/unit';
import {ViewToken} from '../../components/token-view';
import {Gutter} from '../../components/gutter';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../navigation';
import {TextButton} from '../../components/text-button';
import {ArrowRightIcon} from '../../components/icon/arrow-right';
import {RectButton} from '../../components/rect-button';
import {Column, Columns} from '../../components/column';
import {ChainImageFallback} from '../../components/image';
import {Stack} from '../../components/stack';
import {XAxis} from '../../components/axis';
import {
  EmbedChainInfos,
  GovernanceV1ChainIdentifiers,
  NoDashboardLinkIdentifiers,
} from '../../config';
import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {EmptyView, EmptyViewText} from '../../components/empty-view';
import {Box} from '../../components/box';
import {FormattedMessage, useIntl} from 'react-intl';
import {Skeleton} from '../../components/skeleton';
import {SelectChainModal, SelectModalItem} from '../../components/select-modal';
import {useEffectOnce} from '../../hooks';
import {InformationOutlinedIcon} from '../../components/icon/information-outlined';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {InformationModal} from '../../components/modal/infoModal';

const embedChainInfosIdentifiers = EmbedChainInfos.map(
  item => ChainIdHelper.parse(item.chainId).identifier,
);

export const GovernanceScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const {hugeQueriesStore, queriesStore, scamProposalStore} = useStore();
  const [isOpenSelectChainModal, setIsOpenSelectChainModal] = useState(false);
  const [isOpenInfoModal, setIsOpenInfoModal] = useState(false);
  const navigation = useNavigation<StackNavProp>();
  const intl = useIntl();
  const isFetching = useRef(true);

  useEffectOnce(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableWithoutFeedback
          style={style.flatten(['padding-right-20'])}
          onPress={() => {
            setIsOpenInfoModal(true);
          }}>
          <InformationOutlinedIcon
            size={28}
            color={style.get('color-gray-300').color}
          />
        </TouchableWithoutFeedback>
      ),
    });
  });
  const delegations: ViewToken[] = useMemo(
    () =>
      hugeQueriesStore.delegations
        .filter(viewToken =>
          embedChainInfosIdentifiers.includes(
            ChainIdHelper.parse(viewToken.chainInfo.chainId).identifier,
          ),
        )
        .filter(
          viewToken =>
            !NoDashboardLinkIdentifiers.includes(
              ChainIdHelper.parse(viewToken.chainInfo.chainId).identifier,
            ),
        )
        .filter(token => {
          return token.token.toDec().gt(new Dec(0));
        }),
    [hugeQueriesStore.delegations],
  );

  const modalItems: SelectModalItem[] = useMemo(() => {
    return hugeQueriesStore.stakables
      .filter(viewToken =>
        embedChainInfosIdentifiers.includes(
          ChainIdHelper.parse(viewToken.chainInfo.chainId).identifier,
        ),
      )
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

      const queryGovernance = isGovV1Supported
        ? queriesStore
            .get(delegation.chainInfo.chainId)
            .governanceV1.queryGovernance.getQueryGovernance({
              status: 'PROPOSAL_STATUS_VOTING_PERIOD',
              'pagination.limit': 3000,
            })
        : queriesStore
            .get(delegation.chainInfo.chainId)
            .governance.queryGovernance.getQueryGovernance({
              status: 'PROPOSAL_STATUS_VOTING_PERIOD',
            });

      //NOTE delegations중 하나라도 완료가 되면 isFetching을 false로 설정하고 변경하지 않음
      isFetching.current =
        !isFetching.current || !queryGovernance.isFetching ? false : true;

      return isGovV1Supported
        ? {
            isGovV1Supported,
            proposalLen: queryGovernance.proposals.filter(
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
            proposalLen: queryGovernance.proposals.filter(
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
    })
    .filter(viewItem => viewItem.proposalLen !== 0);

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      style={style.flatten(['padding-x-12'])}>
      <Gutter size={6} />
      <TextButton
        text="View All Proposals"
        size="large"
        color="faint"
        containerStyle={style.flatten(['padding-x-12', 'padding-y-6'])}
        onPress={() => {
          setIsOpenSelectChainModal(true);
        }}
        rightIcon={
          <ArrowRightIcon size={18} color={style.get('color-text-low').color} />
        }
      />
      <Gutter size={12} />

      {isFetching.current ? (
        <React.Fragment>
          <ChainItem
            chainName={''}
            imageUrl={''}
            proposalLen={0}
            isNotReady={!!isFetching.current}
            onClick={() => {}}
          />
          <Gutter size={12} />
          <ChainItem
            chainName={''}
            imageUrl={''}
            proposalLen={0}
            isNotReady={!!isFetching.current}
            onClick={() => {}}
          />
          <Gutter size={12} />
          <ChainItem
            chainName={''}
            imageUrl={''}
            proposalLen={0}
            isNotReady={!!isFetching.current}
            onClick={() => {}}
          />
        </React.Fragment>
      ) : viewItems.length === 0 ? (
        <React.Fragment>
          <Gutter size={100} />
          <EmptyView>
            <Box alignX="center">
              <EmptyViewText
                text={intl.formatMessage({
                  id: 'page.governance.main.empty-title',
                })}
              />
              <Gutter size={12} />
              <EmptyViewText
                text={intl.formatMessage({
                  id: 'page.governance.main.empty-text',
                })}
              />
            </Box>
          </EmptyView>
        </React.Fragment>
      ) : (
        viewItems.map(item => {
          return (
            <React.Fragment key={item.chainId}>
              <ChainItem
                chainName={item.chainName}
                imageUrl={item.imageUrl}
                proposalLen={item.proposalLen}
                key={item.chainId}
                isNotReady={!!isFetching.current}
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
        })
      )}
      <SelectChainModal
        isOpen={isOpenSelectChainModal}
        setIsOpen={setIsOpenSelectChainModal}
        items={modalItems}
        placeholder={intl.formatMessage({
          id: 'page.governance.components.select-chain-modal.input-placeholder',
        })}
        onSelect={({key}) => {
          setIsOpenSelectChainModal(false);
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
        emptyTextTitle={intl.formatMessage({
          id: 'page.governance.components.select-chain-modal.empty-title',
        })}
        emptyText={intl.formatMessage({
          id: 'page.governance.components.select-chain-modal.empty-text',
        })}
      />
      <InformationModal
        isOpen={isOpenInfoModal}
        setIsOpen={setIsOpenInfoModal}
        title={intl.formatMessage({
          id: 'page.governance.main.info-modal.title',
        })}
        paragraph={intl.formatMessage({
          id: 'page.governance.main.info-modal.text',
        })}
      />
    </PageWithScrollView>
  );
});

interface ChainItemProps {
  onClick?: () => void;
  imageUrl?: string;
  chainName: string;
  proposalLen: number;
  isNotReady?: boolean;
}
export const ChainItem: FunctionComponent<ChainItemProps> = observer(
  ({chainName, imageUrl, proposalLen, isNotReady, onClick}) => {
    const style = useStyle();

    const containerStyle: ViewStyle = {
      backgroundColor: style.get('color-card-default').color,
      paddingVertical: 18,
      paddingLeft: 16,
      paddingRight: 8,
      borderRadius: 6,
    };

    return (
      <RectButton
        style={StyleSheet.flatten([containerStyle])}
        rippleColor={style.get('color-card-pressing-default').color}
        underlayColor={style.get('color-card-pressing-default').color}
        activeOpacity={1}
        onPress={() => {
          if (onClick) {
            onClick();
          }
        }}
        disabled={isNotReady}>
        <Columns sum={1} gutter={8} alignY="center">
          <Skeleton layer={1} type="circle" isNotReady={isNotReady}>
            <ChainImageFallback
              style={{
                width: 32,
                height: 32,
              }}
              src={imageUrl}
              alt={chainName}
            />
          </Skeleton>

          <Gutter size={12} />

          <XAxis alignY="center">
            <Skeleton layer={1} type="rect" isNotReady={isNotReady}>
              <Text
                style={style.flatten([
                  'flex-row',
                  'flex-wrap',
                  'subtitle3',
                  'color-text-high',
                ])}>
                {chainName}
              </Text>
            </Skeleton>
          </XAxis>

          <Column weight={1} />

          <Columns sum={1} gutter={2} alignY="center">
            <Skeleton layer={1} type="rect" isNotReady={isNotReady}>
              <Stack gutter={2} alignX="right">
                <Text style={style.flatten(['body2', 'color-text-low'])}>
                  <FormattedMessage
                    id="page.governance.chain-item-proposal-length"
                    values={{len: proposalLen}}
                  />
                </Text>
              </Stack>
            </Skeleton>

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
