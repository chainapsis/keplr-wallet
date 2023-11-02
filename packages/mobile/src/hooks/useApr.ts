import {useEffect, useRef, useState} from 'react';
import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {simpleFetch} from '@keplr-wallet/simple-fetch';
import {Dec, IntPretty} from '@keplr-wallet/unit';
import {ViewToken} from '../screen/home';

const CHAIN_APR_API_BASE_URL =
  'https://pjld2aanw3elvteui4gwyxgx4m0ceweg.lambda-url.us-west-2.on.aws';

export interface AprItem {
  chainId: string;
  apr?: IntPretty;
}

export const useGetAllApr = (viewTokenList: ViewToken[]) => {
  const [allApr, setAllApr] = useState<AprItem[]>([]);

  //NOTE hugeQueriesStore.stakables의 전체 갯수는 변동이 없지만 내부의 정보가 변경되면서 해당 훅이 계속 호출 될 수 도있음
  //하지만 apr을 구하는데는 chainId List 변경만 없으면 되서 전체 갯수가 다를때만 다시 api call을 하게 만듬
  const previousCallInfo = useRef<{tokenListLen: number}>({
    tokenListLen: 0,
  });
  useEffect(() => {
    (async () => {
      if (previousCallInfo.current.tokenListLen !== viewTokenList.length) {
        const allPromise = viewTokenList.map(async viewToken => {
          const chainIdentifier = ChainIdHelper.parse(
            viewToken.chainInfo.chainId,
          ).identifier;
          try {
            const response = await simpleFetch<{apr: number}>(
              `${CHAIN_APR_API_BASE_URL}/apr/${chainIdentifier}`,
            );
            return {
              chainId: viewToken.chainInfo.chainId,
              apr: new IntPretty(
                new Dec(response.data.apr),
              ).moveDecimalPointRight(2),
            };
          } catch (error) {
            return {
              chainId: viewToken.chainInfo.chainId,
              apr: undefined,
            };
          }
        });
        previousCallInfo.current = {
          tokenListLen: viewTokenList.length,
        };
        setAllApr(await Promise.all(allPromise));
      }
    })();
  }, [viewTokenList]);

  return allApr;
};
