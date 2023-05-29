import React, { FunctionComponent, useLayoutEffect, useState } from "react";

/**
 * 그냥 이미지 컴포넌트인데 오류 났을때 대체 이미지를 보여주는 기능이 있음
 * @constructor
 */
export const Image: FunctionComponent<
  React.ImgHTMLAttributes<HTMLImageElement> & {
    defaultSrc?: string;
    alt: string;
  }
> = (props) => {
  const {
    src: propSrc,
    onError: propOnError,
    alt,
    defaultSrc,
    ...otherProps
  } = props;

  const [src, setSrc] = useState(propSrc);
  useLayoutEffect(() => {
    setSrc(propSrc);
  }, [propSrc]);

  return (
    <img
      {...otherProps}
      src={src || defaultSrc}
      alt={alt}
      onError={(e) => {
        if (defaultSrc) {
          setSrc(defaultSrc);
        }

        if (propOnError) {
          propOnError(e);
        }
      }}
    />
  );
};

export const ChainImageFallback: FunctionComponent<
  React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string | undefined; // 얘는 undefined더라도 일단 넣으라고 일부로 ?를 안붙인거임.
    alt: string;
  }
> = (props) => {
  const { style, ...otherProps } = props;

  return (
    <Image
      {...otherProps}
      defaultSrc={require("../../public/assets/img/chain-icon-alt.png")}
      style={{
        borderRadius: "1000000px",
        ...style,
      }}
    />
  );
};
