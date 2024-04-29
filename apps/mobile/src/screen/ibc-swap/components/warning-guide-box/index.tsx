import React, {FunctionComponent, useLayoutEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useStyle} from '../../../../styles';
import {VerticalCollapseTransition} from '../../../../components/transition';
import {Box} from '../../../../components/box';
import {Text} from 'react-native';
import {IBCSwapAmountConfig} from '@keplr-wallet/hooks-internal';
import {EmptyAmountError, ZeroAmountError} from '@keplr-wallet/hooks';
import {FormattedMessage} from 'react-intl';

export const WarningGuideBox: FunctionComponent<{
  amountConfig: IBCSwapAmountConfig;

  forceError?: Error;
  forceWarning?: Error;
}> = observer(({amountConfig, forceError, forceWarning}) => {
  const style = useStyle();

  const error: string | undefined = (() => {
    if (forceError) {
      return forceError.message || forceError.toString();
    }

    const uiProperties = amountConfig.uiProperties;

    const err = uiProperties.error || uiProperties.warning;

    if (err instanceof EmptyAmountError) {
      return;
    }

    if (err instanceof ZeroAmountError) {
      return;
    }

    if (err) {
      return err.message || err.toString();
    }

    const queryError = amountConfig.getQueryIBCSwap()?.getQueryRoute()?.error;
    if (queryError) {
      return queryError.message || queryError.toString();
    }

    if (forceWarning) {
      return forceWarning.message || forceWarning.toString();
    }
  })();

  // Collapse됐을때는 이미 error가 없어졌기 때문이다.
  // 그러면 트랜지션 중에 이미 내용은 사라져있기 때문에
  // 이 문제를 해결하기 위해서 마지막 오류를 기억해야 한다.
  const [lastError, setLastError] = useState('');
  useLayoutEffect(() => {
    if (error != null) {
      setLastError(error);
    }
  }, [error]);

  const collapsed = error == null;

  return (
    <VerticalCollapseTransition collapsed={collapsed}>
      <Box
        padding={18}
        borderRadius={8}
        backgroundColor={style.get('color-yellow-800').color}>
        <Text
          style={style.flatten([
            'subtitle4',
            'color-yellow-400',
            'text-center',
          ])}>
          {(() => {
            const err = error || lastError;

            if (
              err &&
              err === 'could not find a path to execute the requested swap'
            ) {
              return (
                <FormattedMessage id="page.ibc-swap.error.no-route-found" />
              );
            }

            return err;
          })()}
        </Text>
      </Box>
    </VerticalCollapseTransition>
  );
});
