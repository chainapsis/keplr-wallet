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
import {StyleSheet, Text, ViewStyle} from 'react-native';
import {ViewToken} from '../../index';
import {RectButton} from '../../../../components/rect-button';
import {SVGLoadingIcon} from '../../../../components/spinner';
import {Path, Svg} from 'react-native-svg';
import {ArrowRightIcon} from '../../../../components/icon/arrow-right';
import {InformationOutlinedIcon} from '../../../../components/icon/information-outlined';
import {DecUtils, IntPretty, RatePretty} from '@keplr-wallet/unit';
import {formatAprString} from '../../utils';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

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
        <TouchableWithoutFeedback
          onPress={() => {
            if (onOpenModal) {
              onOpenModal();
            }
          }}>
          <Columns alignY="center" sum={1} gutter={4}>
            <Text style={style.flatten(['color-text-low', 'subtitle3'])}>
              {title}
            </Text>
            {onOpenModal ? (
              <InformationOutlinedIcon
                size={20}
                color={style.get('color-gray-400').color}
              />
            ) : null}
          </Columns>
        </TouchableWithoutFeedback>
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
  onClickError?: (errorKind: 'common' | 'secret', errorMsg: string) => void;
  disabled?: boolean;
  isNotReady?: boolean;
  apr?: IntPretty;
  hasApr?: boolean;
  // For remaining unbonding time.
  altSentence?: string | React.ReactElement;
  showPrice24HChange?: boolean;
}
export const TokenItem: FunctionComponent<TokenItemProps> = observer(
  ({
    viewToken,
    onClick,
    disabled,
    isNotReady,
    apr,
    altSentence,
    hasApr,
    onClickError,
    showPrice24HChange,
  }) => {
    const {priceStore, price24HChangesStore} = useStore();
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

    // 얘가 값이 있냐 없냐에 따라서 price change를 보여줄지 말지를 결정한다.
    // prop에서 showPrice24HChange가 null 또는 false거나
    // currency에 coingeckoId가 없다면 보여줄 수 없다.
    // 또한 잘못된 coingeckoId일때는 response에 값이 있을 수 없으므로 안보여준다.
    const price24HChange = (() => {
      if (!showPrice24HChange) {
        return undefined;
      }
      if (!viewToken.token.currency.coinGeckoId) {
        return undefined;
      }
      return price24HChangesStore.get24HChange(
        viewToken.token.currency.coinGeckoId,
      );
    })();

    const containerStyle: ViewStyle = {
      backgroundColor: style.get('color-card-default').color,
      paddingTop: 16,
      paddingBottom: 16,
      paddingLeft: 16,
      paddingRight: 8,
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
        rippleColor={
          !disabled ? style.get('color-card-pressing-default').color : undefined
        }
        underlayColor={
          !disabled ? style.get('color-card-pressing-default').color : undefined
        }
        activeOpacity={0.2}
        onPress={() => {
          if (
            viewToken.error?.data &&
            viewToken.error.data instanceof WrongViewingKeyError
          ) {
            if (onClickError) {
              onClickError('secret', viewToken.error?.message);
            }
            return;
          }

          if (viewToken.error?.data) {
            if (onClickError) {
              onClickError('common', viewToken.error?.message);
            }
            return;
          }

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
          <Column weight={3}>
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
                {price24HChange ? (
                  <React.Fragment>
                    <Gutter size={4} />

                    <PriceChangeTag rate={price24HChange} />
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
                    <ErrorIcon
                      size={16}
                      color={style.get('color-yellow-400').color}
                    />
                  </Box>
                ) : undefined}
              </XAxis>
              <XAxis alignY="center">
                <Skeleton layer={1} isNotReady={isNotReady} dummyMinWidth={72}>
                  <Text
                    style={style.flatten(['color-gray-300', 'text-caption1'])}>
                    {hasApr
                      ? `APR ${formatAprString(apr, 2)}%`
                      : isIBC
                      ? `on ${viewToken.chainInfo.chainName}`
                      : viewToken.chainInfo.chainName}
                  </Text>
                </Skeleton>

                {tag ? (
                  <React.Fragment>
                    <Gutter size={4} />
                    <Box alignY="center" height={1}>
                      <TokenTag text={tag.text} />
                    </Box>
                  </React.Fragment>
                ) : null}
              </XAxis>
            </Stack>
          </Column>
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
              </Skeleton>
            </Stack>
            <Gutter size={4} />
            <ArrowRightIcon
              size={24}
              color={style.get('color-gray-400').color}
            />
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

const TokenTag: FunctionComponent<{
  text: string;
}> = ({text}) => {
  const style = useStyle();

  return (
    <Box
      alignX="center"
      alignY="center"
      backgroundColor={style.get('color-gray-500').color}
      borderRadius={6}
      paddingX={6}
      paddingY={2}
      height={18}>
      <Text
        style={{
          color: style.get('color-gray-200').color,
          fontSize: 11,
          fontWeight: '400',
        }}>
        {text}
      </Text>
    </Box>
  );
};

const PriceChangeTag: FunctionComponent<{
  rate: RatePretty;
}> = ({rate}) => {
  const style = useStyle();

  const info: {
    text: string;
    isNeg: boolean;
  } = (() => {
    // Max decimals가 2인데 이 경우 숫자가 0.00123%같은 경우면 +0.00% 같은식으로 표시될 수 있다.
    // 이 경우는 오차를 무시하고 0.00%로 생각한다.
    if (
      rate
        .toDec()
        .abs()
        // 백분율을 고려해야되기 때문에 -2가 아니라 -4임
        .lte(DecUtils.getTenExponentN(-4))
    ) {
      return {
        text: '0.00%',
        isNeg: false,
      };
    } else {
      const res = rate
        .maxDecimals(2)
        .trim(false)
        .shrink(true)
        .inequalitySymbol(false)
        .toString();

      const isNeg = res.startsWith('-');
      return {
        text: isNeg ? res.replace('-', '') : res,
        isNeg,
      };
    }
  })();

  const fontColor = info.isNeg ? 'color-orange-400' : 'color-green-400';

  return (
    <Box
      alignX="center"
      alignY="center"
      paddingX={4}
      paddingY={2}
      borderRadius={6}
      backgroundColor={
        info.isNeg ? 'rgba(88, 39, 11, 0.4)' : 'rgba(19, 104, 68, 0.2)'
      }>
      <XAxis alignY="center">
        {info.isNeg ? (
          <DownIcon color={style.get(fontColor).color} />
        ) : (
          <UpIcon color={style.get(fontColor).color} />
        )}
        <Text style={style.flatten(['text-caption2', fontColor])}>
          {info.text}
        </Text>
      </XAxis>
    </Box>
  );
};

const UpIcon: FunctionComponent<{
  color: string;
}> = ({color}) => {
  return (
    <Svg width={12} height={10} fill="none" viewBox="0 0 12 10">
      <Path stroke={color} d="M1 9l4-5.5 2.667 3L11 1" />
    </Svg>
  );
};

const DownIcon: FunctionComponent<{
  color: string;
}> = ({color}) => {
  return (
    <Svg width={12} height={10} fill="none" viewBox="0 0 12 10">
      <Path stroke={color} d="M1 1l4 5.5 2.667-3L11 9" />
    </Svg>
  );
};
