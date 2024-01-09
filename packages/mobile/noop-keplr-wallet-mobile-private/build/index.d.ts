export declare const isGoogleSignInEnabled = false;
export declare const isAppleSignInEnabled = false;
export declare const getGoogleSignInPrivateKey: () => Promise<{
  privateKey: Uint8Array;
  email: string;
}>;
export declare const getAppleSignInPrivateKey: () => Promise<{
  privateKey: Uint8Array;
  email: string;
}>;
