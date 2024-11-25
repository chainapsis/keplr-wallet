import React from "react";
import { FlattenSimpleInterpolation } from "styled-components";
import { SimpleFetchResponse } from "@keplr-wallet/simple-fetch";

export const GlobalStyles: FlattenSimpleInterpolation | undefined = undefined;

export const RegisterScenes: {
  name: string;
  element: React.ElementType;
  width: string;
}[] = [];

export const onGoogleSignInClick:
  | ((sceneTransition: {
      push(name: string, props?: Record<string, any>): void;
      replace(name: string, props?: Record<string, any>): void;
    }) => void)
  | undefined = undefined;

export const exportGenerateQRCodeDataByInterval = (
  _data: string,
  _setQRCodeData: (data: string) => void
): NodeJS.Timer => {
  throw new Error("Method not implemented.");
};

export const exportUpload = (
  _encryptedData: string
): Promise<SimpleFetchResponse<Response>["data"]> => {
  throw new Error("Method not implemented.");
};
