import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";

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

export const RawImageFallback: FunctionComponent<
  React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string | undefined; // 얘는 undefined더라도 일단 넣으라고 일부로 ?를 안붙인거임.
    alt: string;

    size: string;
  }
> = (props) => {
  const { style, size, ...otherProps } = props;

  return (
    <Image
      {...otherProps}
      defaultSrc={require("../../public/assets/img/chain-icon-alt.png")}
      style={{
        borderRadius: "1000000px",
        position: "relative",
        width: size,
        height: size,
        ...style,
      }}
    />
  );
};

export const ChainImageFallback: FunctionComponent<
  Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
    chainInfo: ChainInfo;

    size: string;
    alt?: string;
  }
> = (props) => {
  const { style, size, chainInfo, ...otherProps } = props;

  return (
    <Image
      src={chainInfo.chainSymbolImageUrl}
      alt={chainInfo.chainName}
      {...otherProps}
      defaultSrc={require("../../public/assets/img/chain-icon-alt.png")}
      style={{
        borderRadius: "1000000px",
        position: "relative",
        width: size,
        height: size,
        ...style,
      }}
    />
  );
};

export const CurrencyImageFallback: FunctionComponent<
  Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
    currency: AppCurrency;

    size: string;
    alt?: string;
  }
> = (props) => {
  const { style, size, currency, ...otherProps } = props;

  return (
    <Image
      src={currency.coinImageUrl}
      alt={currency.coinDenom}
      {...otherProps}
      defaultSrc={require("../../public/assets/img/chain-icon-alt.png")}
      style={{
        borderRadius: "1000000px",
        position: "relative",
        width: size,
        height: size,
        ...style,
      }}
    />
  );
};
