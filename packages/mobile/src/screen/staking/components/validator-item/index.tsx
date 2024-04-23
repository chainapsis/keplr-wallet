import React, {FunctionComponent, useMemo, useRef} from 'react';
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
import {ValidatorInfo} from '../../type';
import {Skeleton} from '../../../../components/skeleton';

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
}> = observer(({chainId, viewValidator, isNotReady, afterSelect}) => {
  const {queriesStore} = useStore();
  const queries = queriesStore.get(chainId);
  const style = useStyle();
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded,
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonded,
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonding,
  );
  const isJailed = !!unbondedValidators.validators
    .concat(unbondingValidators.validators)
    .find(val => val.operator_address === viewValidator.validatorAddress)
    ?.jailed;

  const thumbnail =
    bondedValidators.getValidatorThumbnail(viewValidator.validatorAddress) ||
    unbondingValidators.getValidatorThumbnail(viewValidator.validatorAddress) ||
    unbondedValidators.getValidatorThumbnail(viewValidator.validatorAddress);

  return (
    <RectButton
      underlayColor={style.get('color-card-pressing-default').color}
      rippleColor={style.get('color-card-pressing-default').color}
      style={style.flatten([
        'border-radius-6',
        'background-color-card-default',
      ])}
      activeOpacity={0.5}
      disabled={isNotReady}
      onPress={async () => {
        afterSelect();
      }}>
      <Box paddingLeft={16} paddingRight={8} paddingY={16} borderRadius={6}>
        <Columns sum={1} alignY="center" gutter={8}>
          <Skeleton layer={1} type="circle" isNotReady={isNotReady}>
            <Box>
              <ValidatorImage
                imageUrl={thumbnail}
                name={viewValidator.name}
                isDelegation={viewValidator.isDelegation}
              />
            </Box>
          </Skeleton>
          <Gutter size={12} />

          <Column weight={6}>
            <Skeleton layer={1} type="rect" isNotReady={isNotReady}>
              <Columns sum={1} alignY="center">
                {isJailed ? (
                  <React.Fragment>
                    <InformationIcon
                      size={16}
                      color={style.get('color-red-400').color}
                    />
                    <Gutter size={4} />
                  </React.Fragment>
                ) : null}
                <Text
                  numberOfLines={1}
                  style={style.flatten(['subtitle2', 'color-text-high'])}>
                  {viewValidator.name}
                </Text>
              </Columns>
            </Skeleton>

            <Gutter size={4} />
          </Column>
          <Column weight={1} />
          <Stack alignX="right" gutter={4}>
            {viewValidator.coin ? (
              <Skeleton layer={1} type="rect" isNotReady={isNotReady}>
                <Text style={style.flatten(['subtitle1', 'color-text-high'])}>
                  {viewValidator.coin
                    .maxDecimals(6)
                    .trim(true)
                    .inequalitySymbol(true)
                    .shrink(true)
                    .toString()}
                </Text>
              </Skeleton>
            ) : null}

            {viewValidator.subString ? (
              <Skeleton layer={1} type="rect" isNotReady={isNotReady}>
                <Columns sum={1}>
                  <Text style={style.flatten(['subtitle2', 'color-text-low'])}>
                    {viewValidator.subString}
                  </Text>
                </Columns>
              </Skeleton>
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
  validator: ValidatorInfo;
  chainId: string;
  filterOption: FilterOption;
  isDelegation?: boolean;
  bondedToken?: CoinPretty;
  afterSelect: () => void;
}> = observer(
  ({
    chainId,
    validatorAddress,
    isDelegation,
    validator,
    filterOption,
    bondedToken,
    afterSelect,
  }) => {
    const {queriesStore, chainStore} = useStore();
    const queries = queriesStore.get(chainId);
    const cache = useSubstringCache();
    const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
      Staking.BondStatus.Bonded,
    );

    const chainInfo = chainStore.getChain(chainId);
    const coin = useMemo(() => {
      return new CoinPretty(
        chainInfo.stakeCurrency || chainInfo.feeCurrencies[0],
        new Dec(validator.delegator_shares),
      );
    }, [
      chainInfo.feeCurrencies,
      chainInfo.stakeCurrency,
      validator.delegator_shares,
    ]);

    const viewValidator: ViewValidator | undefined = (() => {
      if (!validator) {
        return undefined;
      }
      if (filterOption === 'Voting Power') {
        const subString = (() => {
          if (bondedToken?.toCoin().amount === '0') {
            return '0%';
          }
          const cachedValue = cache.current.get(validatorAddress);
          if (!cachedValue?.votingPower) {
            const result = new RatePretty(
              coin.toDec().quo(bondedToken?.toDec() || new Dec(1)),
            )
              .maxDecimals(2)
              .toString();
            cache.current.set(validatorAddress, {
              ...cachedValue,
              votingPower: result,
            });
            return cache.current.get(validatorAddress)?.votingPower;
          }

          return cache.current.get(validatorAddress)?.votingPower;
        })();

        return {
          name: validator.description.moniker,
          validatorAddress: validator.operator_address,
          coin,
          subString,
          isDelegation,
        };
      }

      if (filterOption === 'Commission') {
        const subString = (() => {
          if (bondedToken?.toCoin().amount === '0') {
            return '0%';
          }
          const cachedValue = cache.current.get(validatorAddress);

          if (!cache.current.get(validatorAddress)?.commission) {
            const result = new RatePretty(
              validator.commission.commission_rates.rate,
            )
              .maxDecimals(2)
              .toString();
            cache.current.set(validatorAddress, {
              ...cachedValue,
              commission: result,
            });
            return cache.current.get(validatorAddress)?.commission;
          }

          return cache.current.get(validatorAddress)?.commission;
        })();

        return {
          name: validator.description.moniker,
          validatorAddress: validator.operator_address,
          subString,
          isDelegation,
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
            underlayColor={style.get('color-card-pressing-default').color}
            rippleColor={style.get('color-card-pressing-default').color}
            style={style.flatten([
              'border-radius-6',
              'background-color-card-default',
            ])}
            activeOpacity={0.5}
            onPress={() => {
              afterSelect();
            }}>
            <Box
              paddingLeft={16}
              paddingRight={8}
              paddingY={16}
              borderRadius={6}>
              <Columns sum={1} alignY="center" gutter={8}>
                <Box>
                  <ValidatorImage
                    imageUrl={thumbnail}
                    name={viewValidator.name}
                    isDelegation={viewValidator.isDelegation}
                  />
                </Box>
                <Gutter size={12} />
                <Column weight={1}>
                  <Columns sum={1} gutter={4} alignY="center">
                    {isWarning ? (
                      <InformationIcon
                        size={16}
                        color={style.get('color-yellow-400').color}
                      />
                    ) : null}
                    <Text
                      numberOfLines={1}
                      style={style.flatten([
                        'subtitle2',
                        'color-text-high',
                        'width-full',
                      ])}>
                      {viewValidator.name}
                    </Text>
                  </Columns>
                  <Gutter size={4} />
                </Column>
                <Gutter size={12} />
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
  },
);

const useSubstringCache = () => {
  const cache = useRef(
    new Map<string, {votingPower?: string; commission?: string}>(),
  );
  return cache;
};
