import React from "react";
import { FlattenSimpleInterpolation } from "styled-components";

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
): NodeJS.Timeout => {
  throw new Error("Method not implemented.");
};

export const exportUpload = (
  _encryptedData: string
): Promise<{
  otp: string;
} | null> => {
  throw new Error("Method not implemented.");
};
