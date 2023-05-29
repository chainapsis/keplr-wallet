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
