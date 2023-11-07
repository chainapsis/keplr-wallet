import React, {
  FunctionComponent,
  PropsWithChildren,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {Stack} from '../../../../components/stack';
import {Box} from '../../../../components/box';
import {useStore} from '../../../../stores';
import {Column, Columns} from '../../../../components/column';
import {observer} from 'mobx-react-lite';
import {useStyle} from '../../../../styles';
import {ChainImageFallback} from '../../../../components/image';
import {DenomHelper} from '@keplr-wallet/common';
import {XAxis} from '../../../../components/axis';
import {Gutter} from '../../../../components/gutter';
import {Skeleton} from '../../../../components/skeleton';
import {WrongViewingKeyError} from '@keplr-wallet/stores';
// import {useNavigate} from 'react-router';
// import {Secret20Currency} from '@keplr-wallet/types';
import {Pressable, StyleSheet, Text, ViewStyle} from 'react-native';
import {ViewToken} from '../../index';
import {RectButton} from '../../../../components/rect-button';
import {Tag} from '../../../../components/tag';
import {SVGLoadingIcon} from '../../../../components/spinner';
import {Path, Svg} from 'react-native-svg';
import {ArrowRightIcon} from '../../../../components/icon/arrow-right';
import {InformationOutlinedIcon} from '../../../../components/icon/information-outlined';
import {IntPretty} from '@keplr-wallet/unit';
import {formatAprString} from '../../utils';

export const TokenTitleView: FunctionComponent<{
  title: string;
  onOpenModal?: () => void;
  right?: React.ReactElement;
}> = ({title, right, onOpenModal}) => {
  const style = useStyle();
  return (
    <Box
      style={{
        flex: 1,
      }}>
      <Columns sum={1} alignY="center">
        <Pressable
          onPress={() => {
            if (onOpenModal) {
              onOpenModal();
            }
          }}>
          <Columns alignY="center" sum={1} gutter={4}>
            <Text style={style.flatten(['color-text-low'])}>{title}</Text>
            <InformationOutlinedIcon
              size={20}
              color={style.get('color-text-low').color}
            />
          </Columns>
        </Pressable>
        {right ? (
          <React.Fragment>
            <Column weight={1} />
            {right}
          </React.Fragment>
        ) : null}
      </Columns>
    </Box>
  );
};

interface TokenItemProps {
  viewToken: ViewToken;
  onClick?: () => void;
  disabled?: boolean;
  forChange?: boolean;
  isNotReady?: boolean;
  apr?: IntPretty;
  // For remaining unbonding time.
  altSentence?: string | React.ReactElement;
}
export const TokenItem: FunctionComponent<TokenItemProps> = observer(
  ({viewToken, onClick, disabled, forChange, isNotReady, apr, altSentence}) => {
    const {priceStore} = useStore();
    const style = useStyle();

    const pricePretty = priceStore.calculatePrice(viewToken.token);

    const isIBC = useMemo(() => {
      return viewToken.token.currency.coinMinimalDenom.startsWith('ibc/');
    }, [viewToken.token.currency]);

    const coinDenom = useMemo(() => {
      if (
        'originCurrency' in viewToken.token.currency &&
        viewToken.token.currency.originCurrency
      ) {
        return viewToken.token.currency.originCurrency.coinDenom;
      }
      return viewToken.token.currency.coinDenom;
    }, [viewToken.token.currency]);

    const tag = useMemo(() => {
      const currency = viewToken.token.currency;
      const denomHelper = new DenomHelper(currency.coinMinimalDenom);
      if (
        denomHelper.type === 'native' &&
        currency.coinMinimalDenom.startsWith('ibc/')
      ) {
        return {
          text: 'IBC',
          tooltip: (() => {
            const start = currency.coinDenom.indexOf('(');
            const end = currency.coinDenom.lastIndexOf(')');
            return currency.coinDenom.slice(start + 1, end);
          })(),
        };
      }
      if (denomHelper.type !== 'native') {
        return {
          text: denomHelper.type,
        };
      }
    }, [viewToken.token.currency]);

    const containerStyle: ViewStyle = {
      backgroundColor: style.get('color-gray-600').color,
      paddingTop: forChange ? 14 : 16,
      paddingBottom: forChange ? 4 : 16,
      paddingLeft: forChange ? 14 : 14,
      paddingRight: forChange ? 16 : 14,
      borderRadius: 6,
    };

    return (
      <RectButton
        style={StyleSheet.flatten([
          containerStyle,
          viewToken.error != null && {
            borderWidth: 1.5,
            borderStyle: 'solid',
            borderColor: style.get('color-yellow-400@50%').color,
          },
        ])}
        rippleColor={!disabled ? style.get('color-gray-550').color : undefined}
        underlayColor={
          !disabled ? style.get('color-gray-550').color : undefined
        }
        activeOpacity={0.2}
        onPress={() => {
          // e.preventDefault();

          //NOTE setting 페이지로 설정하라고 넘기는 페이지 같은데 이후 setting페이지에 맞춰서 라우팅 해줘야함
          // if (
          //   viewToken.error?.data &&
          //   viewToken.error.data instanceof WrongViewingKeyError
          // ) {
          //   navigate(
          //     `/setting/token/add?chainId=${
          //       viewToken.chainInfo.chainId
          //     }&contractAddress=${
          //       (viewToken.token.currency as Secret20Currency).contractAddress
          //     }`,
          //   );

          //   return;
          // }

          if (onClick) {
            onClick();
          }
        }}>
        <Columns sum={1} gutter={8} alignY="center">
          <Skeleton type="circle" layer={1} isNotReady={isNotReady}>
            <ChainImageFallback
              style={{
                width: 32,
                height: 32,
              }}
              src={viewToken.token.currency.coinImageUrl}
              alt={viewToken.token.currency.coinDenom}
            />
          </Skeleton>

          <Gutter size={12} />

          <Stack gutter={4}>
            <XAxis alignY="center">
              <Skeleton layer={1} isNotReady={isNotReady} dummyMinWidth={52}>
                <Text
                  style={style.flatten([
                    'flex-row',
                    'flex-wrap',
                    'subtitle3',
                    'color-gray-10',
                  ])}>
                  {coinDenom}
                </Text>
              </Skeleton>

              {tag ? (
                <React.Fragment>
                  <Gutter size={4} />
                  <Box alignY="center" height={1}>
                    <Tag text={tag.text} />
                  </Box>
                </React.Fragment>
              ) : null}
              {viewToken.isFetching ? (
                // 처음에는 무조건 로딩이 발생하는데 일반적으로 쿼리는 100ms 정도면 끝난다.
                // 이정도면 유저가 별 문제를 느끼기 힘들기 때문에
                // 일괄적으로 로딩을 보여줄 필요가 없다.
                // 그러므로 로딩 상태가 500ms 이상 지속되면 로딩을 표시힌다.
                // 근데 또 문제가 있어서 추가 사항이 있는데 그건 DelayedLoadingRender의 주석을 참고
                <DelayedLoadingRender isFetching={viewToken.isFetching}>
                  <Box marginLeft={4}>
                    <SVGLoadingIcon
                      size={16}
                      color={style.get('color-gray-300').color}
                    />
                  </Box>
                </DelayedLoadingRender>
              ) : viewToken.error ? (
                <Box marginLeft={4}>
                  {/* <Tooltip
                    content={(() => {
                      if (
                        viewToken.error?.message ===
                        'Wrong viewing key for this address or viewing key not set'
                      ) {
                        return intl.formatMessage({
                          id: 'page.main.components.token.wrong-viewing-key-error',
                        });
                      }

                      return viewToken.error.message;
                    })()}> */}
                  <ErrorIcon
                    size={16}
                    color={style.get('color-yellow-400').color}
                  />
                  {/* </Tooltip> */}
                </Box>
              ) : undefined}
            </XAxis>
            <XAxis alignY="center">
              <Skeleton layer={1} isNotReady={isNotReady} dummyMinWidth={72}>
                <Text
                  style={style.flatten(['color-gray-300', 'text-caption1'])}>
                  {apr
                    ? `APR ${formatAprString(apr, 2)}%`
                    : isIBC
                    ? `on ${viewToken.chainInfo.chainName}`
                    : viewToken.chainInfo.chainName}
                </Text>
              </Skeleton>
            </XAxis>
          </Stack>

          <Column weight={1} />

          <Columns sum={1} gutter={2} alignY="center">
            <Stack gutter={2} alignX="right">
              <Skeleton layer={1} isNotReady={isNotReady} dummyMinWidth={52}>
                <Text style={style.flatten(['subtitle3', 'color-gray-10'])}>
                  {viewToken.token
                    .hideDenom(true)
                    .maxDecimals(6)
                    .inequalitySymbol(true)
                    .shrink(true)
                    .toString()}
                </Text>
              </Skeleton>
              <Skeleton layer={1} isNotReady={isNotReady} dummyMinWidth={72}>
                {viewToken.error?.data &&
                viewToken.error.data instanceof WrongViewingKeyError ? (
                  <Box position="relative" alignX="right">
                    <Text
                      style={style.flatten([
                        'subtitle3',
                        'color-gray-100',
                        'absolute',
                        'text-underline',
                      ])}>
                      Set your viewing key
                    </Text>

                    <Text
                      style={style.flatten([
                        'subtitle3',

                        'text-underline',
                        'opacity-transparent',
                      ])}>
                      &nbps;
                    </Text>
                  </Box>
                ) : (
                  <Text style={style.flatten(['subtitle3', 'color-gray-300'])}>
                    {(() => {
                      if (altSentence) {
                        return altSentence;
                      }

                      return pricePretty
                        ? pricePretty.inequalitySymbol(true).toString()
                        : '-';
                    })()}
                  </Text>
                )}
              </Skeleton>
            </Stack>

            {forChange ? (
              <ArrowRightIcon
                size={24}
                color={style.get('color-gray-300').color}
              />
            ) : null}
          </Columns>
        </Columns>
      </RectButton>
    );
  },
);

const ErrorIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({size, color}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </Svg>
  );
};

let initialOnLoad = false;
setTimeout(() => {
  initialOnLoad = true;
}, 1000);

const DelayedLoadingRender: FunctionComponent<
  PropsWithChildren<{
    isFetching: boolean;
  }>
> = ({isFetching, children}) => {
  const [show, setShow] = useState(false);

  useLayoutEffect(() => {
    if (isFetching) {
      const id = setTimeout(
        () => {
          setShow(true);
        },
        // 유저가 토큰이 많은 경우에 locla state load하고 render하는데만 해도 500ms 가까이 걸리는 경우가 있다.
        // 이런 경우에는 이 컴포넌트의 목표를 달성하지 못한건데...
        // 일단 간단하게 그냥 처음에는 1초 기다리도록 처리한다...
        initialOnLoad ? 500 : 1000,
      );

      return () => {
        clearTimeout(id);
      };
    } else {
      setShow(false);
    }
  }, [isFetching]);

  if (!show) {
    return null;
  }

  return <React.Fragment>{children}</React.Fragment>;
};
