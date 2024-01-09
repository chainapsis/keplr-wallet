import React from 'react';
import {Box} from '../../../../components/box';
import {useStyle} from '../../../../styles';
import {StakingIcon} from '../../../../components/icon/stacking';
import {Text} from 'react-native';
import {Image} from '../../../../components/image';

export const ValidatorImage = ({
  imageUrl,
  name,
  size,
  isDelegation,
}: {
  imageUrl?: string;
  isDelegation?: boolean;
  name?: string;
  size?: number;
}) => {
  const style = useStyle();
  const nameFirstCharacter = name?.trim() ? Array.from(name)[0] : null;

  return (
    <React.Fragment>
      {imageUrl ? (
        isDelegation ? (
          <Box>
            <Image
              style={{
                width: size || 32,
                height: size || 32,
                borderRadius: 9999,
              }}
              src={imageUrl}
              alt={imageUrl}
              defaultSrc={require('../../../../public/assets/img/chain-icon-alt.png')}
              cache="immutable"
            />
            <Box
              position="absolute"
              width={16}
              height={16}
              borderRadius={16}
              backgroundColor={style.get('color-gray-400').color}
              alignX="center"
              alignY="center"
              style={{bottom: -3, right: -3}}>
              <StakingIcon
                size={9.6}
                color={style.get('color-green-300').color}
              />
            </Box>
          </Box>
        ) : (
          <Image
            style={{
              width: size || 32,
              height: size || 32,
              borderRadius: 9999,
            }}
            src={imageUrl}
            alt={imageUrl}
            defaultSrc={require('../../../../public/assets/img/chain-icon-alt.png')}
            cache="immutable"
          />
        )
      ) : isDelegation ? (
        <Box>
          <Box
            width={size || 32}
            height={size || 32}
            borderRadius={999}
            alignX="center"
            alignY="center"
            backgroundColor={style.get('color-gray-450').color}>
            <Text style={style.flatten(['subtitle2', 'color-text-high'])}>
              {nameFirstCharacter}
            </Text>
          </Box>
          <Box
            position="absolute"
            width={16}
            height={16}
            borderRadius={16}
            backgroundColor={style.get('color-gray-400').color}
            alignX="center"
            alignY="center"
            style={{bottom: -3, right: -3}}>
            <StakingIcon
              size={9.6}
              color={style.get('color-green-300').color}
            />
          </Box>
        </Box>
      ) : (
        <Box
          width={size || 32}
          height={size || 32}
          borderRadius={999}
          alignX="center"
          alignY="center"
          backgroundColor={style.get('color-gray-450').color}>
          <Text style={style.flatten(['subtitle2', 'color-text-high'])}>
            {nameFirstCharacter}
          </Text>
        </Box>
      )}
    </React.Fragment>
  );
};
