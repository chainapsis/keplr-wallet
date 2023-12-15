import {StdSignDoc} from '@keplr-wallet/types';
import {KeplrError} from '@keplr-wallet/router';
import {CosmosApp} from '@keplr-wallet/ledger-cosmos';
import {PubKeySecp256k1} from '@keplr-wallet/crypto';
import {Buffer} from 'buffer';
import {serializeSignDoc} from '@keplr-wallet/cosmos';
import {signatureImport} from 'secp256k1';
import {
  ErrCodeDeviceLocked,
  ErrCodeUnsupportedApp,
  ErrFailedGetPublicKey,
  ErrFailedInit,
  ErrFailedSign,
  ErrModuleLedgerSign,
  ErrPublicKeyUnmatched,
  ErrSignRejected,
} from './ledger-types';
import {LedgerUtils} from '../../../utils';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import Transport from '@ledgerhq/hw-transport';
import {
  domainHash,
  EIP712MessageValidator,
  messageHash,
} from '@keplr-wallet/background';
import Eth from '@ledgerhq/hw-app-eth';

export const connectAndSignEIP712WithLedger = async (
  expectedPubKey: Uint8Array,
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  },
  signDoc: StdSignDoc,
  eip712: {
    types: Record<string, {name: string; type: string}[] | undefined>;
    domain: Record<string, any>;
    primaryType: string;
  },
): Promise<Uint8Array> => {
  let transport: Transport;
  try {
    // 현재 저장된 ledger device id를 가져온다.
    // 이 device id를 이용해서 transport를 생성한다.
    // 해당 transport가 없다면 ErrFailedInit 에러를 발생시킨다
    // ErrFailedInit 에러가 발생하면 다시 Ledger device를 연결한다.
    const deviceId = await LedgerUtils.getLastUsedLedgerDeviceId();

    transport = await TransportBLE.open(deviceId);
  } catch (e) {
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      'Failed to init transport',
    );
  }

  let ethApp = new Eth(transport);

  // Ensure that the keplr can connect to ethereum app on ledger.
  // getAppConfiguration() works even if the ledger is on screen saver mode.
  // To detect the screen saver mode, we should request the address before using.
  try {
    await ethApp.getAddress("m/44'/60'/'0/0/0");
  } catch (e) {
    // Device is locked
    if (e?.message.includes('(0x6b0c)')) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrCodeDeviceLocked,
        'Device is locked',
      );
    } else if (
      // User is in home sceen or other app.
      e?.message.includes('(0x6511)') ||
      e?.message.includes('(0x6e00)')
    ) {
      // Do nothing
    } else {
      await transport.close();

      throw e;
    }
  }

  transport = await LedgerUtils.tryAppOpen(transport, 'Ethereum');
  ethApp = new Eth(transport);

  try {
    let pubKey: PubKeySecp256k1;
    try {
      const res = await ethApp.getAddress(
        `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
      );

      pubKey = new PubKeySecp256k1(Buffer.from(res.publicKey, 'hex'));
    } catch (e) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrFailedGetPublicKey,
        e.message || e.toString(),
      );
    }

    if (
      Buffer.from(new PubKeySecp256k1(expectedPubKey).toBytes()).toString(
        'hex',
      ) !== Buffer.from(pubKey.toBytes()).toString('hex')
    ) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrPublicKeyUnmatched,
        'Public key unmatched',
      );
    }

    let data: any;

    try {
      const message = Buffer.from(
        JSON.stringify({
          types: eip712.types,
          domain: eip712.domain,
          primaryType: eip712.primaryType,
          message: signDoc,
        }),
      );

      data = await EIP712MessageValidator.validateAsync(
        JSON.parse(Buffer.from(message).toString()),
      );
    } catch (e) {
      console.log(e);

      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrFailedSign,
        e.message || e.toString(),
      );
    }

    try {
      // Unfortunately, signEIP712Message not works on ledger yet.
      return ethSignatureToBytes(
        await ethApp.signEIP712HashedMessage(
          `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
          domainHash(data),
          messageHash(data),
        ),
      );
    } catch (e) {
      if (e?.message.includes('(0x6985)')) {
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrSignRejected,
          'User rejected signing',
        );
      }

      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrFailedSign,
        e.message || e.toString(),
      );
    }
  } finally {
    await transport.close();
  }
};

export const connectAndSignWithLedger = async (
  propApp: string,
  expectedPubKey: Uint8Array,
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  },
  signDoc: StdSignDoc,
): Promise<Uint8Array> => {
  if (propApp !== 'Cosmos' && propApp !== 'Terra' && propApp !== 'Secret') {
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrCodeUnsupportedApp,
      `Unsupported app: ${propApp}`,
    );
  }
  // 현재 저장된 ledger device id를 가져온다.
  // 이 device id를 이용해서 transport를 생성한다.
  // 해당 transport가 없다면 ErrFailedInit 에러를 발생시킨다
  // ErrFailedInit 에러가 발생하면 다시 Ledger device를 연결한다.
  const deviceId = await LedgerUtils.getLastUsedLedgerDeviceId();

  let transport: Transport;

  try {
    transport = await TransportBLE.open(deviceId);
  } catch (e) {
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      'Failed to init transport',
    );
  }

  let app = new CosmosApp(propApp, transport);

  try {
    const version = await app.getVersion();
    if (
      version.device_locked ||
      version.return_code === 21781 ||
      version.return_code === 65535
    ) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrCodeDeviceLocked,
        'Device is locked',
      );
    }
  } catch (e) {
    await transport.close();

    throw e;
  }

  transport = await LedgerUtils.tryAppOpen(transport, propApp, deviceId);
  app = new CosmosApp(propApp, transport);

  try {
    const res = await app.getPublicKey(
      bip44Path.account,
      bip44Path.change,
      bip44Path.addressIndex,
    );
    if (res.error_message === 'No errors') {
      const pubKey = new PubKeySecp256k1(res.compressed_pk);
      const expected = new PubKeySecp256k1(expectedPubKey);
      if (
        Buffer.from(pubKey.toBytes()).toString() !==
        Buffer.from(expected.toBytes()).toString()
      ) {
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrPublicKeyUnmatched,
          'Public key unmatched',
        );
      }

      const signResponse = await app.sign(
        bip44Path.account,
        bip44Path.change,
        bip44Path.addressIndex,
        serializeSignDoc(signDoc),
      );

      if (signResponse.error_message === 'No errors') {
        return signatureImport(signResponse.signature);
      } else {
        if (signResponse.error_message === 'Transaction rejected') {
          throw new KeplrError(
            ErrModuleLedgerSign,
            ErrSignRejected,
            signResponse.error_message,
          );
        }

        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrFailedSign,
          signResponse.error_message,
        );
      }
    } else {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrFailedGetPublicKey,
        res.error_message,
      );
    }
  } finally {
    await transport.close();
  }
};

function ethSignatureToBytes(signature: {
  v: number;
  r: string;
  s: string;
}): Uint8Array {
  // Validate signature.r is hex encoded
  const r = Buffer.from(signature.r, 'hex');
  // Validate signature.s is hex encoded
  const s = Buffer.from(signature.s, 'hex');

  // Must be 32 bytes
  if (r.length !== 32 || s.length !== 32) {
    throw new Error('Unable to process signature: malformed fields');
  }

  if (!Number.isInteger(signature.v)) {
    throw new Error('Unable to process signature: malformed fields');
  }

  return Buffer.concat([r, s, Buffer.from([signature.v])]);
}
