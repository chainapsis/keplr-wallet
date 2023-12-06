import React, {FunctionComponent, useMemo, useState} from 'react';
import {CollapsibleList} from '../../components/collapsible-list';
import {Dec} from '@keplr-wallet/unit';
import {ViewToken} from './index';
import {observer} from 'mobx-react-lite';
import {Stack} from '../../components/stack';
import {useStore} from '../../stores';
import {TokenItem, TokenTitleView} from './components/token';
import {MainEmptyView} from './components/empty-view';
import FastImage from 'react-native-fast-image';
import {useIntl} from 'react-intl';
import {Modal} from '../../components/modal';
import {
  InformationModal,
  InformationModalProps,
} from '../../components/modal/infoModal';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../navigation';
import {SelectStakingChainModal} from './components/stakeing-chain-select-modal';
import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import {formatRelativeTimeString} from '../../utils/format';

const zeroDec = new Dec(0);

export const StakedTabView: FunctionComponent<{
  SelectStakingChainModalRef: React.RefObject<BottomSheetModalMethods>;
}> = observer(({SelectStakingChainModalRef}) => {
  const {hugeQueriesStore, queriesStore} = useStore();
  const intl = useIntl();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const stakablesTokenList = hugeQueriesStore.stakables;
  const stakablesTokenNonZeroList = useMemo(() => {
    return stakablesTokenList.filter(token => {
      return token.token.toDec().gt(zeroDec) && token.chainInfo.stakeCurrency;
    });
  }, [stakablesTokenList]);

  const navigate = useNavigation<StackNavProp>();
  const aprList = stakablesTokenList.map(
    viewToken => queriesStore.get(viewToken.chainInfo.chainId).apr.queryApr.apr,
  );

  const delegations: ViewToken[] = useMemo(
    () =>
      hugeQueriesStore.delegations.filter(token => {
        return token.token.toDec().gt(new Dec(0));
      }),
    [hugeQueriesStore.delegations],
  );

  const [infoModalState, setInfoModalState] = useState<InformationModalProps>({
    title: '',
    paragraph: '',
  });

  const unbondings: {
    viewToken: ViewToken;
    altSentence: string;
  }[] = useMemo(
    () =>
      hugeQueriesStore.unbondings
        .filter(unbonding => {
          return unbonding.viewToken.token.toDec().gt(new Dec(0));
        })
        .map(unbonding => {
          return {
            viewToken: unbonding.viewToken,
            altSentence: formatRelativeTimeString(intl, unbonding.completeTime),
          };
        }),
    [hugeQueriesStore.unbondings, intl],
  );

  const TokenViewData: {
    title: string;
    balance:
      | ViewToken[]
      | {
          viewToken: ViewToken;
          altSentence: string;
        }[];
    lenAlwaysShown: number;
    paragraph: string;
  }[] = [
    {
      title: intl.formatMessage({
        id: 'page.main.staked.staked-balance-title',
      }),
      balance: delegations,
      lenAlwaysShown: 5,
      paragraph: intl.formatMessage({
        id: 'page.main.staked.staked-balance-tooltip',
      }),
    },
    {
      title: intl.formatMessage({
        id: 'page.main.staked.unstaking-balance-title',
      }),
      balance: unbondings,
      lenAlwaysShown: 3,
      paragraph: intl.formatMessage({
        id: 'page.main.staked.unstaking-balance-tooltip',
      }),
    },
  ];

  return (
    <React.Fragment>
      <Stack gutter={8}>
        {TokenViewData.map(({title, balance, lenAlwaysShown, paragraph}) => {
          if (balance.length === 0) {
            return null;
          }
          //NOTE delegation 일때만 apr을 보여줘야 하기 때문에 해당 변수 설정
          const isDelegation = title === TokenViewData[0].title;

          return (
            <CollapsibleList
              key={title}
              itemKind="tokens"
              title={
                <TokenTitleView
                  title={title}
                  onOpenModal={() => {
                    setInfoModalState({title, paragraph});
                    setIsInfoModalOpen(true);
                  }}
                />
              }
              lenAlwaysShown={lenAlwaysShown}
              items={balance.map(viewToken => {
                if ('altSentence' in viewToken) {
                  return (
                    <TokenItem
                      hasApr={isDelegation ? true : false}
                      apr={
                        aprList.filter(
                          ({chainId}) =>
                            chainId === viewToken.viewToken.chainInfo.chainId,
                        )[0]?.apr
                      }
                      viewToken={viewToken.viewToken}
                      key={`${viewToken.viewToken.chainInfo.chainId}-${viewToken.viewToken.token.currency.coinMinimalDenom}`}
                      disabled={
                        !viewToken.viewToken.chainInfo.walletUrlForStaking
                      }
                      onClick={() => {
                        navigate.navigate('Stake', {
                          screen: 'Stake.Dashboard',
                          params: {
                            chainId: viewToken.viewToken.chainInfo.chainId,
                          },
                        });
                      }}
                      onClickError={(errorKind, errorMsg) => {
                        if (errorKind === 'common') {
                          setInfoModalState({
                            title: intl.formatMessage({
                              id: 'page.main.components.secret-error-modal-button',
                            }),
                            paragraph: errorMsg,
                          });
                          setIsInfoModalOpen(true);
                          return;
                        }
                      }}
                      altSentence={viewToken.altSentence}
                    />
                  );
                }

                return (
                  <TokenItem
                    hasApr={isDelegation ? true : false}
                    apr={
                      aprList.filter(
                        ({chainId}) => chainId === viewToken.chainInfo.chainId,
                      )[0]?.apr
                    }
                    viewToken={viewToken}
                    key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                    disabled={!viewToken.chainInfo.walletUrlForStaking}
                    onClick={() => {
                      navigate.navigate('Stake', {
                        screen: 'Stake.Dashboard',
                        params: {
                          chainId: viewToken.chainInfo.chainId,
                        },
                      });
                    }}
                  />
                );
              })}
            />
          );
        })}
      </Stack>

      {delegations.length === 0 && unbondings.length === 0 ? (
        <MainEmptyView
          image={
            <FastImage
              source={require('../../public/assets/img/main-empty-staking.png')}
              style={{
                width: 100,
                height: 100,
              }}
            />
          }
          title={intl.formatMessage({
            id: 'page.main.staked.empty-view-title',
          })}
          paragraph={intl.formatMessage({
            id: 'page.main.staked.empty-view-paragraph',
          })}
        />
      ) : null}

      <InformationModal
        isOpen={isInfoModalOpen}
        setIsOpen={setIsInfoModalOpen}
        title={infoModalState?.title}
        paragraph={infoModalState?.paragraph}
      />

      <Modal ref={SelectStakingChainModalRef}>
        <SelectStakingChainModal
          onSelect={stakingChainModalItem => {
            navigate.navigate('Stake', {
              screen: 'Stake.ValidateList',
              params: {
                chainId: stakingChainModalItem.viewToken.chainInfo.chainId,
              },
            });
          }}
          aprList={aprList}
          items={stakablesTokenNonZeroList.map(token => ({
            key: token.chainInfo.chainId,
            viewToken: token,
          }))}
        />
      </Modal>
    </React.Fragment>
  );
});
