/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import React from "react";
import { FlattenSimpleInterpolation } from "styled-components";
export declare const GlobalStyles: FlattenSimpleInterpolation | undefined;
export declare const RegisterScenes: {
    name: string;
    element: React.ElementType;
    width: string;
}[];
export declare const onGoogleSignInClick: ((sceneTransition: {
    push(name: string, props?: Record<string, any>): void;
    replace(name: string, props?: Record<string, any>): void;
}) => void) | undefined;
export declare const exportGenerateQRCodeDataByInterval: (_data: string, _setQRCodeData: (data: string) => void) => NodeJS.Timer;
export declare const exportUpload: (_encryptedData: string) => Promise<{
    otp: string;
} | null>;
