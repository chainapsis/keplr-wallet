import React, {FunctionComponent, useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {useStyle} from '../../styles';
import {FormattedMessage, useIntl} from 'react-intl';
import {XAxis} from '../axis';
import {Button} from '../button';
import {Gutter} from '../gutter';
import {registerCardModal} from './card';
import {Box} from '../box';
import * as ExpoImage from 'expo-image';
import {Text} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import {Chip} from '../chip';
import {ChainInfo} from '@keplr-wallet/types';
import {InteractionWaitingData} from '@keplr-wallet/background';
import {GuideBox} from '../guide-box';
import {Skeleton} from '../skeleton';
import {RectButton} from '../rect-button';
import * as WebBrowser from 'expo-web-browser';
import {ScrollView} from '../scroll-view/common-scroll-view';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {WCMessageRequester} from '../../stores/wallet-connect/msg-requester.ts';

export const SuggestChainModal = registerCardModal(
  observer(() => {
    const {chainSuggestStore} = useStore();

    const waitingData = chainSuggestStore.waitingSuggestedChainInfo;
    if (!waitingData) {
      return null;
    }

    return (
      <SuggestChainPageImpl key={waitingData.id} waitingData={waitingData} />
    );
  }),
);

const SuggestChainPageImpl: FunctionComponent<{
  waitingData: InteractionWaitingData<{
    chainInfo: ChainInfo;
    origin: string;
  }>;
}> = observer(({waitingData}) => {
  const intl = useIntl();

  const {chainSuggestStore, chainStore, keyRingStore, walletConnectStore} =
    useStore();
  const [isLoadingPlaceholder, setIsLoadingPlaceholder] = useState(true);
  const [originUrl, setOriginUrl] = useState<string>('');

  const queryCommunityChainInfo = chainSuggestStore.getCommunityChainInfo(
    waitingData.data.chainInfo.chainId,
  );
  const communityChainInfo = queryCommunityChainInfo.chainInfo;

  const reject = async () => {
    await chainSuggestStore.rejectWithProceedNext(waitingData.id, () => {});
  };

  const approve = async () => {
    const chainInfo = communityChainInfo || waitingData.data.chainInfo;

    await chainSuggestStore.approveWithProceedNext(
      waitingData.id,
      chainInfo,
      () => {
        keyRingStore.refreshKeyRingStatus();
        chainStore.updateChainInfosFromBackground();
      },
    );
  };

  useEffect(() => {
    (async () => {
      if (WCMessageRequester.isVirtualURL(waitingData.data.origin)) {
        const id = WCMessageRequester.getIdFromVirtualURL(
          waitingData.data.origin,
        );

        const topic = await walletConnectStore.getTopicByRandomId(id);
        if (topic) {
          const session = walletConnectStore.getSession(topic);
          setOriginUrl(session?.peer.metadata.url ?? '');
        } else {
          setOriginUrl(waitingData.data.origin);
        }
      } else {
        setOriginUrl(waitingData.data.origin);
      }
    })();
  }, [waitingData.data.origin, walletConnectStore]);

  useEffect(() => {
    if (!queryCommunityChainInfo.isLoading) {
      setIsLoadingPlaceholder(false);
    }
  }, [queryCommunityChainInfo.isLoading]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoadingPlaceholder(false);
    }, 1000);
  }, []);

  return (
    <Box key={waitingData.id} paddingX={12} paddingBottom={12}>
      {(() => {
        if (isLoadingPlaceholder) {
          return (
            <CommunityInfo
              isNotReady={isLoadingPlaceholder}
              origin={originUrl}
              chainInfo={waitingData.data.chainInfo}
            />
          );
        }

        if (communityChainInfo) {
          return (
            <CommunityInfo
              isNotReady={false}
              origin={originUrl}
              chainInfo={communityChainInfo}
              communityChainInfoUrl={chainSuggestStore.getCommunityChainInfoUrl(
                communityChainInfo.chainId,
              )}
            />
          );
        }

        return (
          <RawInfo
            origin={originUrl}
            chainInfo={waitingData.data.chainInfo}
            communityChainInfoRepoUrl={
              chainSuggestStore.communityChainInfoRepoUrl
            }
          />
        );
      })()}
      <XAxis>
        <Button
          size="large"
          text={intl.formatMessage({id: 'button.reject'})}
          color="secondary"
          containerStyle={{flex: 1, width: '100%'}}
          onPress={reject}
        />

        <Gutter size={16} />

        <Button
          size="large"
          text={intl.formatMessage({id: 'button.approve'})}
          containerStyle={{flex: 1, width: '100%'}}
          onPress={approve}
        />
      </XAxis>
    </Box>
  );
});

const CommunityInfo: FunctionComponent<{
  isNotReady: boolean;
  origin: string;
  chainInfo: ChainInfo;
  communityChainInfoUrl?: string;
}> = ({origin, chainInfo, isNotReady, communityChainInfoUrl}) => {
  const style = useStyle();

  return (
    <Box padding={12} alignX="center" alignY="center">
      <Gutter size={32} />

      <XAxis alignY="center">
        <Skeleton isNotReady={isNotReady} type="circle">
          <ExpoImage.Image
            style={{width: 80, height: 80, borderRadius: 40}}
            source={chainInfo.chainSymbolImageUrl}
            contentFit="contain"
          />
        </Skeleton>

        <Gutter size={20} />

        <Skeleton isNotReady={isNotReady} type="circle">
          <DotIcon />
        </Skeleton>
        <Gutter size={12} />
        <Skeleton isNotReady={isNotReady} type="circle">
          <DotIcon />
        </Skeleton>
        <Gutter size={12} />
        <Skeleton isNotReady={isNotReady} type="circle">
          <DotIcon />
        </Skeleton>

        <Gutter size={20} />

        <Skeleton isNotReady={isNotReady} type="circle">
          <ExpoImage.Image
            style={{width: 80, height: 80, borderRadius: 40}}
            source={require('../../public/assets/logo-256.png')}
            contentFit="contain"
          />
        </Skeleton>
      </XAxis>

      <Gutter size={24} />

      <Skeleton isNotReady={isNotReady}>
        <Text style={style.flatten(['h3', 'color-text-high'])}>
          <FormattedMessage
            id="page.suggest-chain.title"
            values={{chainName: chainInfo.chainName}}
          />
        </Text>
      </Skeleton>

      <Gutter size={16} />

      <Skeleton isNotReady={isNotReady}>
        <RectButton
          style={style.flatten(['border-radius-32'])}
          onPress={() => {
            if (communityChainInfoUrl) {
              WebBrowser.openBrowserAsync(communityChainInfoUrl);
            }
          }}>
          <Chip
            text={
              <XAxis alignY="center">
                <Text style={style.flatten(['body3', 'color-text-high'])}>
                  <FormattedMessage id="page.suggest-chain.community-info-view.community-driven-chip" />
                </Text>

                <Gutter size={4} />

                <GithubIcon />
              </XAxis>
            }
          />
        </RectButton>
      </Skeleton>

      <Gutter size={16} />

      <Skeleton isNotReady={isNotReady}>
        <Text
          style={style.flatten(['color-text-middle', 'body2', 'text-center'])}>
          <FormattedMessage
            id="page.suggest-chain.community-info-view.paragraph"
            values={{
              b: (...chunks: any) => (
                <Text style={{fontWeight: 'bold'}}>{chunks}</Text>
              ),
              origin,
              chainId: chainInfo.chainId,
            }}
          />
        </Text>
      </Skeleton>

      <Gutter size={32} />
    </Box>
  );
};

const RawInfo: FunctionComponent<{
  origin: string;
  chainInfo: ChainInfo;
  communityChainInfoRepoUrl: string;
}> = ({origin, chainInfo, communityChainInfoRepoUrl}) => {
  const intl = useIntl();
  const style = useStyle();

  return (
    <Box alignY="center" alignX="center">
      <Text style={style.flatten(['h3', 'color-text-high'])}>
        <FormattedMessage
          id="page.suggest-chain.title"
          values={{chainName: chainInfo.chainName}}
        />
      </Text>

      <Gutter size={16} />

      <Chip text={origin} />

      <Gutter size={16} />

      <Box
        maxHeight={160}
        backgroundColor={style.get('color-gray-500').color}
        padding={16}
        borderRadius={6}>
        <ScrollView isGestureScrollView={true}>
          <Text style={style.flatten(['body3', 'color-text-middle'])}>
            {JSON.stringify(chainInfo, null, 2)}
          </Text>
        </ScrollView>
      </Box>

      <Gutter size={16} />

      <GuideBox
        title={intl.formatMessage({
          id: 'page.suggest-chain.raw-info-view.guide-title',
        })}
        paragraph={intl.formatMessage({
          id: 'page.suggest-chain.raw-info-view.guide-paragraph',
        })}
        bottom={
          <TouchableWithoutFeedback
            onPress={() => {
              WebBrowser.openBrowserAsync(communityChainInfoRepoUrl);
            }}>
            <Text
              style={style.flatten([
                'text-underline',
                'color-gray-100',
                'subtitle4',
              ])}>
              <FormattedMessage id="page.suggest-chain.raw-info-view.chain-registry-link-text" />
            </Text>
          </TouchableWithoutFeedback>
        }
      />

      <Gutter size={16} />
    </Box>
  );
};

const DotIcon = () => (
  <Svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <Circle cx="4" cy="4" r="4" fill="#AFD7F3" />
  </Svg>
);

const GithubIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <Path
      d="M7 0.171875C3.13483 0.171875 0 3.30612 0 7.17188C0 10.2647 2.0055 12.8885 4.78742 13.8143C5.13683 13.879 5.25 13.662 5.25 13.4777V12.1745C3.30283 12.598 2.89742 11.3485 2.89742 11.3485C2.57892 10.5395 2.11983 10.3242 2.11983 10.3242C1.48458 9.88962 2.16825 9.89896 2.16825 9.89896C2.87117 9.94796 3.241 10.6205 3.241 10.6205C3.86517 11.6904 4.87842 11.3812 5.278 11.2021C5.34042 10.75 5.52183 10.4409 5.7225 10.2665C4.16792 10.0885 2.53342 9.48829 2.53342 6.80671C2.53342 6.04196 2.807 5.41779 3.25442 4.92779C3.18208 4.75104 2.94233 4.03879 3.32267 3.07512C3.32267 3.07512 3.91067 2.88729 5.24825 3.79262C5.8065 3.63746 6.405 3.55987 7 3.55696C7.595 3.55987 8.19408 3.63746 8.7535 3.79262C10.0899 2.88729 10.6767 3.07512 10.6767 3.07512C11.0577 4.03938 10.8179 4.75162 10.7456 4.92779C11.1947 5.41779 11.466 6.04254 11.466 6.80671C11.466 9.49529 9.82858 10.0874 8.26992 10.2606C8.52075 10.4776 8.75 10.9035 8.75 11.5568V13.4777C8.75 13.6638 8.862 13.8825 9.21725 13.8137C11.9968 12.8868 14 10.2635 14 7.17188C14 3.30612 10.8657 0.171875 7 0.171875Z"
      fill="#FEFEFE"
    />
  </Svg>
);
