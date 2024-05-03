import {
  createSmartNavigatorProvider,
  SmartNavigator,
} from "hooks/use-smart-navigation";
import {
  AddressBookConfig,
  AddressBookData,
  IMemoConfig,
  IRecipientConfig,
  IRecipientConfigWithICNS,
  RegisterConfig,
} from "@keplr-wallet/hooks";
import { NewMnemonicConfig } from "screens/register/mnemonic";
import { BIP44HDPath, ExportKeyRingData } from "@keplr-wallet/background";

interface Configs {
  amount: string;
  denom: string;
  recipient?: any;
  memo?: string;
}

export interface State {
  isNext: boolean;
  configs: Configs;
}
const { SmartNavigatorProvider, useSmartNavigation } =
  createSmartNavigatorProvider(
    new SmartNavigator({
      "Register.Intro": {
        upperScreenName: "Register",
      },
      "Register.NewUser": {
        upperScreenName: "Register",
      },
      "Register.NotNewUser": {
        upperScreenName: "Register",
      },
      "Register.NewMnemonic": {
        upperScreenName: "Register",
      },
      "Register.VerifyMnemonic": {
        upperScreenName: "Register",
      },
      "Register.RecoverMnemonic": {
        upperScreenName: "Register",
      },
      "Register.MigrateETH": {
        upperScreenName: "Register",
      },
      "Register.CreateAccount": {
        upperScreenName: "Register",
      },
      "Register.NewLedger": {
        upperScreenName: "Register",
      },
      "Register.TorusSignIn": {
        upperScreenName: "Register",
      },
      "Register.ImportFromExtension.Intro": {
        upperScreenName: "Register",
      },
      "Register.ImportFromExtension": {
        upperScreenName: "Register",
      },
      "Register.ImportFromExtension.SetPassword": {
        upperScreenName: "Register",
      },
      "Register.End": {
        upperScreenName: "Register",
      },
      Home: {
        upperScreenName: "HomeTab",
      },
      Send: {
        upperScreenName: "Others",
      },
      Receive: {
        upperScreenName: "Others",
      },
      SendNew: {
        upperScreenName: "Others",
      },
      Portfolio: {
        upperScreenName: "HomeTab",
      },
      NativeTokens: {
        upperScreenName: "HomeTab",
      },
      Tokens: {
        upperScreenName: "Others",
      },
      Camera: {
        upperScreenName: "Others",
      },
      Inbox: {
        upperScreenName: "HomeTab",
      },
      ManageWalletConnect: {
        upperScreenName: "Others",
      },
      "Staking.Dashboard": {
        upperScreenName: "Others",
      },
      "Validator.Details": {
        upperScreenName: "Others",
      },
      "Validator.List": {
        upperScreenName: "Others",
      },
      Delegate: {
        upperScreenName: "Others",
      },
      Undelegate: {
        upperScreenName: "Others",
      },
      Redelegate: {
        upperScreenName: "Others",
      },
      Governance: {
        upperScreenName: "Others",
      },
      "Governance Details": {
        upperScreenName: "Others",
      },
      Setting: {
        upperScreenName: "Settings",
      },
      SettingSelectAccount: {
        upperScreenName: "Settings",
      },
      "Setting.ViewPrivateData": {
        upperScreenName: "Others",
      },
      "Setting.Currency": {
        upperScreenName: "Others",
      },
      "Setting.Version": {
        upperScreenName: "Others",
      },
      "Setting.ChainList": {
        upperScreenName: "ChainList",
      },
      "Setting.AddToken": {
        upperScreenName: "Others",
      },
      "Setting.ManageTokens": {
        upperScreenName: "Others",
      },
      AddressBook: {
        upperScreenName: "AddressBooks",
      },
      SecurityAndPrivacy: {
        upperScreenName: "Others",
      },
      AddAddressBook: {
        upperScreenName: "AddressBooks",
      },
      EditAddressBook: {
        upperScreenName: "AddressBooks",
      },
      Result: {
        upperScreenName: "Others",
      },
      TxPendingResult: {
        upperScreenName: "Others",
      },
      TxSuccessResult: {
        upperScreenName: "Others",
      },
      TxFailedResult: {
        upperScreenName: "Others",
      },
      "Web.Intro": {
        upperScreenName: "Web",
      },
      "Web.Osmosis": {
        upperScreenName: "Web",
      },
      "Web.OsmosisFrontier": {
        upperScreenName: "Web",
      },
      "Web.Stargaze": {
        upperScreenName: "Web",
      },
      "Web.Umee": {
        upperScreenName: "Web",
      },
      "Web.Junoswap": {
        upperScreenName: "Web",
      },
      WebView: {
        upperScreenName: "Others",
      },
      RenameWallet: {
        upperScreenName: "Others",
      },
      DeleteWallet: {
        upperScreenName: "Others",
      },
    }).withParams<{
      WebView: {
        url: string;
      };
      "Register.Intro": {
        isBack: boolean;
      };
      "Register.NewMnemonic": {
        registerConfig: RegisterConfig;
      };
      "Register.VerifyMnemonic": {
        registerConfig: RegisterConfig;
        newMnemonicConfig: NewMnemonicConfig;
      };
      "Register.RecoverMnemonic": {
        registerConfig: RegisterConfig;
      };
      "Register.MigrateETH": {
        registerConfig: RegisterConfig;
      };
      "Register.CreateAccount": {
        registerConfig: RegisterConfig;
        mnemonic: string;
        bip44HDPath?: BIP44HDPath;
        title?: string;
      };
      "Register.NewLedger": {
        registerConfig: RegisterConfig;
      };
      "Register.TorusSignIn": {
        registerConfig: RegisterConfig;
        type: "google" | "apple";
      };
      "Register.ImportFromExtension.Intro": {
        registerConfig: RegisterConfig;
      };
      "Register.ImportFromExtension": {
        registerConfig: RegisterConfig;
      };
      "Register.ImportFromExtension.SetPassword": {
        registerConfig: RegisterConfig;
        exportKeyRingDatas: ExportKeyRingData[];
        addressBooks: { [chainId: string]: AddressBookData[] | undefined };
      };
      "Register.End": {
        password?: string;
      };
      Send: {
        chainId?: string;
        currency?: string;
        recipient?: string;
      };
      Receive: {
        chainId?: string;
      };
      SendNew: {
        chainId?: string;
        currency?: string;
        recipient?: string;
        state?: State;
      };
      NativeTokens: {
        tokenString: string;
        tokenBalanceString: string;
      };
      Camera: {
        showMyQRButton?: boolean;
        recipientConfig?: IRecipientConfig | IRecipientConfigWithICNS;
      };
      "Validator.Details": {
        validatorAddress: string;
      };
      "Validator.List": {
        validatorSelector?: (validatorAddress: string) => void;
      };
      Delegate: {
        validatorAddress: string;
      };
      Undelegate: {
        validatorAddress: string;
      };
      Redelegate: {
        validatorAddress: string;
      };
      "Governance Details": {
        proposalId: string;
      };
      "Setting.ViewPrivateData": {
        privateData: string;
        privateDataType: string;
      };
      AddressBook: {
        recipientConfig?: IRecipientConfig;
        memoConfig?: IMemoConfig;
      };
      AddAddressBook: {
        chainId: string;
        addressBookConfig: AddressBookConfig;
      };
      TxPendingResult: {
        chainId?: string;
        txHash: string;
      };
      TxSuccessResult: {
        chainId?: string;
        txHash: string;
      };
      TxFailedResult: {
        chainId?: string;
        txHash: string;
      };
    }>()
  );

export { SmartNavigatorProvider, useSmartNavigation };
