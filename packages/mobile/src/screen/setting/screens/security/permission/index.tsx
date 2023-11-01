import React, {FunctionComponent, useState} from 'react';
import {observer} from 'mobx-react-lite';

import {FormattedMessage, useIntl} from 'react-intl';
import {useStore} from '../../../../../stores';
import {Stack} from '../../../../../components/stack';
import {Box} from '../../../../../components/box';
import {SearchTextInput} from '../../../../../components/input/search-text-input';
import {useStyle} from '../../../../../styles';
import {Button} from '../../../../../components/button';
import {Column, Columns} from '../../../../../components/column';
import {Text} from 'react-native';
import {CloseIcon} from '../../../../../components/icon';
import {ArrowDownIcon} from '../../../../../components/icon/arrow-down';
import {ArrowUpIcon} from '../../../../../components/icon/arrow-up';
import {TreeIcon} from '../../../../../components/icon/tree';
import {PageWithScrollView} from '../../../../../components/page';

export const SettingSecurityPermissionScreen: FunctionComponent = observer(
  () => {
    //TODO - 브라우저 탭 구현 후 기능이 제대로 동작되는지 한번 더 테스트 필요
    const {permissionManagerStore} = useStore();
    const intl = useIntl();

    const [search, setSearch] = useState('');

    return (
      <PageWithScrollView backgroundMode={'default'}>
        <Box padding={12}>
          <Stack gutter={8}>
            <SearchTextInput
              placeholder={intl.formatMessage({
                id: 'page.setting.security.permission.search-placeholder',
              })}
              value={search}
              onChange={e => {
                e.preventDefault();
                setSearch(e.nativeEvent.text);
              }}
            />
            <Box paddingTop={4} alignX="right">
              <Button
                text={intl.formatMessage({
                  id: 'page.setting.security.permission.disconnect-all-button',
                })}
                color="secondary"
                size="extra-small"
                disabled={
                  Object.entries(permissionManagerStore.permissionData)
                    .length === 0
                }
                onPress={async () => {
                  await permissionManagerStore.clearAllPermissions();
                }}
              />
            </Box>
            {Object.entries(permissionManagerStore.permissionData)
              .filter(([origin]) => {
                const trim = search.trim();
                if (trim.length === 0) {
                  return true;
                }

                return origin.toLowerCase().includes(trim.toLowerCase());
              })
              .map(([origin, value]) => {
                return (
                  <OriginView key={origin} origin={origin} value={value} />
                );
              })}
          </Stack>
        </Box>
      </PageWithScrollView>
    );
  },
);

const OriginView: FunctionComponent<{
  origin: string;
  value?:
    | {
        permissions: {chainIdentifier: string; type: string}[];
        globalPermissions: {type: string}[];
      }
    | undefined;
}> = observer(({origin, value}) => {
  const {permissionManagerStore} = useStore();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const style = useStyle();

  if (!value) {
    return null;
  }

  return (
    <Box
      padding={12}
      borderRadius={6}
      backgroundColor={style.get('color-gray-600').color}
      style={style.flatten(['gap-12'])}
      onClick={() => setIsCollapsed(!isCollapsed)}>
      <Columns sum={1} alignY="center">
        <Box
          padding={10}
          marginRight={10}
          borderRadius={6}
          backgroundColor={style.get('color-gray-500').color}>
          <Columns sum={1} gutter={12} alignY="center">
            <Text style={style.flatten(['body2', 'color-text-high'])}>
              {origin}
            </Text>
            <Box
              cursor="pointer"
              onClick={async e => {
                e.preventDefault();
                e.stopPropagation();
                await permissionManagerStore.clearOrigin(origin);
              }}>
              <Columns sum={1} gutter={2}>
                <Text style={style.flatten(['text-button2', 'color-text-low'])}>
                  <FormattedMessage id="page.setting.security.permission.origin-view.all-text" />
                </Text>
                <CloseIcon
                  size={16}
                  color={style.get('color-text-low').color}
                />
              </Columns>
            </Box>
          </Columns>
        </Box>

        <Column weight={1} />

        <Columns sum={1} alignY="center" gutter={8}>
          <Text style={style.flatten(['body1', 'color-text-middle'])}>
            {(value?.permissions.length ?? 0) +
              (value?.globalPermissions.length ?? 0)}
          </Text>

          {isCollapsed ? (
            <ArrowDownIcon
              size={20}
              color={style.get('color-text-middle').color}
            />
          ) : (
            <ArrowUpIcon
              size={20}
              color={style.get('color-text-middle').color}
            />
          )}
        </Columns>
      </Columns>

      {isCollapsed ? null : (
        <Stack gutter={12}>
          {value.permissions.map(permission => {
            return (
              <Columns
                sum={1}
                key={`${permission.chainIdentifier}/${permission.type}`}>
                <TreeIcon size={36} color={style.get('color-gray-400').color} />
                <Box
                  padding={10}
                  marginRight={10}
                  borderRadius={6}
                  backgroundColor={style.get('color-gray-500').color}
                  cursor="pointer"
                  onClick={async e => {
                    e.preventDefault();
                    e.stopPropagation();

                    await permissionManagerStore.removePermission(
                      origin,
                      permission.chainIdentifier,
                      permission.type,
                    );
                  }}>
                  <Columns sum={1} gutter={12} alignY="center">
                    <Text style={style.flatten(['body2', 'color-text-high'])}>
                      {permission.chainIdentifier}
                    </Text>
                    <Box cursor="pointer">
                      <CloseIcon
                        size={16}
                        color={style.get('color-text-low').color}
                      />
                    </Box>
                  </Columns>
                </Box>
              </Columns>
            );
          })}
          {value.globalPermissions.map(globalPermission => {
            return (
              <Columns sum={1} key={globalPermission.type}>
                <TreeIcon size={36} color={style.get('color-gray-400').color} />
                <Box
                  padding={10}
                  marginRight={10}
                  borderRadius={6}
                  backgroundColor={style.get('color-gray-500').color}
                  onClick={async e => {
                    e.preventDefault();
                    e.stopPropagation();

                    await permissionManagerStore.removeGlobalPermission(
                      origin,
                      globalPermission.type,
                    );
                  }}>
                  <Columns sum={1} gutter={12} alignY="center">
                    <Text style={style.flatten(['body2', 'color-text-high'])}>
                      {(() => {
                        switch (globalPermission.type) {
                          case 'get-chain-infos':
                            return 'Get chain infos';
                          default:
                            return `Unknown: ${globalPermission.type}`;
                        }
                      })()}
                    </Text>
                    <Box cursor="pointer">
                      <CloseIcon
                        size={16}
                        color={style.get('color-text-low').color}
                      />
                    </Box>
                  </Columns>
                </Box>
              </Columns>
            );
          })}
        </Stack>
      )}
    </Box>
  );
});
