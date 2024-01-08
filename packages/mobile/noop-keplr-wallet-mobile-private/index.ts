export const isGoogleSignInEnabled = false;
export const isAppleSignInEnabled = false;

export const getGoogleSignInPrivateKey = async (): Promise<{
  privateKey: Uint8Array;
  email: string;
}> => {
  throw new Error('Google sign in is not enabled');
};

export const getAppleSignInPrivateKey = async (): Promise<{
  privateKey: Uint8Array;
  email: string;
}> => {
  throw new Error('Apple sign in is not enabled');
};
