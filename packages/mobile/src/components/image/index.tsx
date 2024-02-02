import React, {forwardRef, FunctionComponent} from 'react';
import * as ExpoImage from 'expo-image';
/**
 * 그냥 이미지 컴포넌트인데 오류 났을때 대체 이미지를 보여주는 기능이 있음
 * @constructor
 */
export const Image = forwardRef<
  ExpoImage.Image,
  {
    defaultSrc?: number;
    alt: string;
    src?: string;
    style?: Object;
  }
>((props, ref) => {
  const {src: propSrc, defaultSrc, style} = props;

  return (
    <ExpoImage.Image
      ref={ref}
      source={propSrc}
      placeholder={defaultSrc}
      style={style}
      autoplay={false}
    />
  );
});

export const ChainImageFallback: FunctionComponent<{
  src: string | undefined; // 얘는 undefined더라도 일단 넣으라고 일부로 ?를 안붙인거임.
  alt: string;
  style: Object;
}> = ({src, style}) => {
  return (
    <ExpoImage.Image
      style={{
        ...style,
        borderRadius: 99999,
      }}
      source={src ? src : require('../../public/assets/img/chain-icon-alt.png')}
      contentFit="contain"
      autoplay={false}
    />
  );
};
