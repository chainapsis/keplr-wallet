export interface OnboardingStackParamList
  extends Record<string, object | undefined> {
  welcome: undefined;
  "create-multisig-biometrics": undefined;
  "create-multisig-phone-number": undefined;
  "create-multisig-phone-number-confirm": {
    phoneNumber: string;
    securityQuestion: string;
    securityAnswer: string;
  };
  "create-multisig-social": undefined;
  "create-multisig-init": undefined;
  "replace-multisig": undefined;
  "recover-multisig": undefined;
  "recover-singlesig": undefined;
  "lookup-proxy-wallets": undefined;
}
