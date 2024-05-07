import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../../../components/box';
import {useStyle} from '../../../../../styles';
import {useStore} from '../../../../../stores';
import {Gutter} from '../../../../../components/gutter';
import {EmptyView, EmptyViewText} from '../../../../../components/empty-view';
import {Text} from 'react-native';
import {ChainImageFallback} from '../../../../../components/image';
import {CloseIcon} from '../../../../../components/icon';
import {XAxis} from '../../../../../components/axis';
import {useIntl} from 'react-intl';
import {FlatList} from '../../../../../components/flat-list';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

interface WalletConnectSession {
  topic: string;
  namespaces: Record<
    string,
    | {
        accounts: string[];
        methods: string[];
        events: string[];
      }
    | undefined
  >;
  peer: {
    metadata: {
      name?: string;
      description?: string;
      url?: string;
      icons?: string[];
    };
  };
  isV2: boolean;
}

export const SettingGeneralManageWalletConnectScreen: FunctionComponent =
  observer(() => {
    const {walletConnectStore} = useStore();
    const style = useStyle();
    const intl = useIntl();

    const sessions: WalletConnectSession[] = walletConnectStore
      .getSessions()
      .map(session => {
        return {
          ...session,
          isV2: true,
        };
      });

    return (
      <Box paddingX={12} paddingTop={8} style={style.flatten(['flex-grow-1'])}>
        <FlatList
          data={sessions}
          renderItem={({item}) => {
            return (
              <ConnectedItem
                key={item.topic}
                session={item}
                onClickClose={async () => {
                  await walletConnectStore.disconnect(item.topic);
                }}
              />
            );
          }}
          ItemSeparatorComponent={() => <Gutter size={8} />}
          ListEmptyComponent={() => {
            return (
              <React.Fragment>
                <Gutter size={148} direction="vertical" />
                <EmptyView>
                  <EmptyViewText
                    text={intl.formatMessage({
                      id: 'page.setting.general.manage-WC.empty-text',
                    })}
                  />
                </EmptyView>
              </React.Fragment>
            );
          }}
        />
      </Box>
    );
  });

const ConnectedItem: FunctionComponent<{
  session: WalletConnectSession;
  onClickClose?: () => void;
}> = ({session, onClickClose}) => {
  const appName =
    session.peer?.metadata?.name || session.peer?.metadata?.url || 'unknown';
  const metadata = session.peer?.metadata;
  const iconUrl = useMemo(() => {
    if (metadata?.icons && metadata?.icons.length > 0) {
      return metadata?.icons[metadata?.icons.length - 1];
    }
  }, [metadata?.icons]);
  const style = useStyle();

  return (
    <Box
      backgroundColor={style.get('color-card-default').color}
      borderRadius={6}
      paddingX={16}
      paddingY={20}>
      <XAxis alignY="center">
        <Box borderRadius={36}>
          <ChainImageFallback
            style={{width: 48, height: 48}}
            alt={session.topic}
            src={iconUrl}
          />
        </Box>

        <Gutter size={8} />

        <Text style={style.flatten(['body1', 'color-text-high', 'flex-1'])}>
          {appName}
        </Text>

        <TouchableWithoutFeedback onPress={onClickClose}>
          <CloseIcon size={24} color={style.get('color-text-low').color} />
        </TouchableWithoutFeedback>
      </XAxis>
    </Box>
  );
};
