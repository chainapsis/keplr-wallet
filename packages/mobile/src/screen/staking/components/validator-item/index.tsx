import React, {FunctionComponent} from 'react';
import {Box} from '../../../../components/box';
import {useStyle} from '../../../../styles';
import {RectButton} from '../../../../components/rect-button';
import {Column, Columns} from '../../../../components/column';
import {Text} from 'react-native';
import {Gutter} from '../../../../components/gutter';
import {CoinPretty, Dec, RatePretty} from '@keplr-wallet/unit';
import {Stack} from '../../../../components/stack';
import {ArrowRightIcon} from '../../../../components/icon/arrow-right';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../../stores';
import {Staking} from '@keplr-wallet/stores';
import {FilterOption} from '../../validator-list';
import {InformationIcon} from '../../../../components/icon/information';
import {ValidatorImage} from '../validator-image';

export interface ViewValidator {
  coin?: CoinPretty;
  name?: string;
  subString?: string;
  isDelegation?: boolean;
  validatorAddress: string;
}

export const ValidatorItem: FunctionComponent<{
  viewValidator: ViewValidator;
  isNotReady?: boolean;
  chainId: string;
  afterSelect: () => void;
}> = observer(({chainId, viewValidator, afterSelect}) => {
  const {queriesStore} = useStore();
  const queries = queriesStore.get(chainId);
  const style = useStyle();
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded,
  );

  const thumbnail = bondedValidators.getValidatorThumbnail(
    viewValidator.validatorAddress,
  );

  return (
    <RectButton
      underlayColor={style.get('color-gray-550').color}
      rippleColor={style.get('color-gray-550').color}
      style={style.flatten(['border-radius-6', 'background-color-gray-600'])}
      activeOpacity={0.5}
      onPress={async () => {
        afterSelect();
      }}>
      <Box paddingLeft={16} paddingRight={8} paddingY={16} borderRadius={6}>
        <Columns sum={1} alignY="center" gutter={8}>
          <Box>
            <ValidatorImage
              imageUrl={thumbnail}
              name={viewValidator.name}
              isDelegation={viewValidator.isDelegation}
            />
          </Box>
          <Gutter size={12} />
          <Column weight={6}>
            <Text
              numberOfLines={1}
              style={style.flatten(['subtitle2', 'color-text-high'])}>
              {viewValidator.name}
            </Text>
            <Gutter size={4} />
          </Column>
          <Column weight={1} />
          <Stack alignX="right" gutter={4}>
            {viewValidator.coin ? (
              <Text style={style.flatten(['subtitle1', 'color-text-high'])}>
                {viewValidator.coin
                  .maxDecimals(6)
                  .trim(true)
                  .shrink(true)
                  .toString()}
              </Text>
            ) : null}

            {viewValidator.subString ? (
              <Columns sum={1}>
                <Text style={style.flatten(['subtitle2', 'color-text-low'])}>
                  {viewValidator.subString}
                </Text>
              </Columns>
            ) : null}
          </Stack>
          <Gutter size={4} />
          <ArrowRightIcon size={24} color={style.get('color-gray-400').color} />
        </Columns>
      </Box>
    </RectButton>
  );
});

export const ValidatorListItem: FunctionComponent<{
  validatorAddress: string;
  chainId: string;
  filterOption: FilterOption;
  afterSelect: () => void;
}> = observer(({chainId, validatorAddress, filterOption, afterSelect}) => {
  const {queriesStore, chainStore, accountStore} = useStore();
  const queries = queriesStore.get(chainId);
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded,
  );
  const bondedToken = queries.cosmos.queryPool.bondedTokens;
  const delegationsValidator =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      accountStore.getAccount(chainId).bech32Address,
    ).delegations;
  const validator = bondedValidators.getValidator(validatorAddress);

  const chainInfo = chainStore.getChain(chainId);
  const viewValidator: ViewValidator | undefined = (() => {
    if (!validator) {
      return undefined;
    }

    const coin = new CoinPretty(
      chainInfo.stakeCurrency || chainInfo.feeCurrencies[0],
      new Dec(validator.delegator_shares),
    );

    if (filterOption === 'Voting') {
      return {
        name: validator.description.moniker,
        validatorAddress: validator.operator_address,
        coin,
        subString:
          bondedToken?.toCoin().amount === '0'
            ? '0%'
            : new RatePretty(
                coin.toDec().quo(bondedToken?.toDec() || new Dec(1)),
              )
                .maxDecimals(2)
                .toString(),
        isDelegation: !!delegationsValidator.find(
          del =>
            del.delegation.validator_address === validator.operator_address,
        ),
      };
    }

    if (filterOption === 'Commission') {
      return {
        name: validator.description.moniker,
        validatorAddress: validator.operator_address,
        subString: new RatePretty(validator.commission.commission_rates.rate)
          .maxDecimals(2)
          .toString(),
        isDelegation: !!delegationsValidator.find(
          del =>
            del.delegation.validator_address === validator.operator_address,
        ),
      };
    }
  })();
  const style = useStyle();
  const thumbnail = bondedValidators.getValidatorThumbnail(validatorAddress);
  const isWarning =
    Number(validator?.commission.commission_rates.rate) >= 0.2 &&
    filterOption === 'Commission';

  return (
    <React.Fragment>
      {viewValidator ? (
        <RectButton
          underlayColor={style.get('color-gray-550').color}
          rippleColor={style.get('color-gray-550').color}
          style={style.flatten([
            'border-radius-6',
            'background-color-gray-600',
          ])}
          activeOpacity={0.5}
          onPress={() => {
            afterSelect();
          }}>
          <Box paddingLeft={16} paddingRight={8} paddingY={16} borderRadius={6}>
            <Columns sum={1} alignY="center" gutter={8}>
              <Box>
                <ValidatorImage
                  imageUrl={thumbnail}
                  name={viewValidator.name}
                  isDelegation={viewValidator.isDelegation}
                />
              </Box>
              <Gutter size={12} />
              <Column weight={6}>
                <Columns sum={1} gutter={4} alignY="center">
                  {isWarning ? (
                    <InformationIcon
                      size={16}
                      color={style.get('color-yellow-400').color}
                    />
                  ) : null}
                  <Text
                    numberOfLines={1}
                    style={style.flatten(['subtitle2', 'color-text-high'])}>
                    {viewValidator.name}
                  </Text>
                </Columns>
                <Gutter size={4} />
              </Column>
              <Column weight={1} />
              <Stack alignX="right" gutter={4}>
                {viewValidator.coin ? (
                  <Text style={style.flatten(['body2', 'color-text-low'])}>
                    {viewValidator.coin
                      .maxDecimals(10)
                      .trim(true)
                      .shrink(true)
                      .toString()}
                  </Text>
                ) : null}

                {viewValidator.subString ? (
                  <Columns sum={1} alignY="center" gutter={4}>
                    {isWarning ? (
                      <InformationIcon
                        size={16}
                        color={style.get('color-yellow-400').color}
                      />
                    ) : null}
                    <Text
                      style={style.flatten([
                        'body2',
                        'color-text-low',
                        isWarning ? 'color-yellow-400' : 'color-text-low',
                      ])}>
                      {viewValidator.subString}
                    </Text>
                  </Columns>
                ) : null}
              </Stack>
              <Gutter size={4} />
              <ArrowRightIcon
                size={24}
                color={style.get('color-gray-400').color}
              />
            </Columns>
          </Box>
        </RectButton>
      ) : null}
    </React.Fragment>
  );
});
