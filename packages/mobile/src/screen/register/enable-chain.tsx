import {observer} from 'mobx-react-lite';
import React, {FunctionComponent} from 'react';
import {View} from 'react-native';

//TODO 이후 니모닉이나 private key를 받아서 vaultId 를 만들수 있게 수정해야함
interface RegisterEnableChainProps {
  // name: string;
  // password: string;
  // mnemonic?: {
  //   value: string;
  //   // If mnemonic is not recovered, but newly generated,
  //   // it should be set to true.
  //   isFresh?: boolean;
  //   bip44Path: {
  //     account: number;
  //     change: number;
  //     addressIndex: number;
  //   };
  // };
}
export const RegisterEnableChainScreen: FunctionComponent<RegisterEnableChainProps> =
  observer(() => {
    return (
      <React.Fragment>
        <View></View>
      </React.Fragment>
    );
  });
