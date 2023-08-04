/** ******************************************************************************
 *  (c) 2019 ZondaX GmbH
 *  (c) 2016-2017 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */

import { Buffer } from "buffer/";
import {
  sign,
  getVersion,
  getAppInfo,
  getDeviceInfo,
  errorCodeToString,
  processErrorResponse,
  serializePath,
} from "./device";
import {
  AppInfoResponse,
  VersionResponse,
  PublicKeyResponse,
  DeviceInfoResponse,
  SignResponse,
  AppCoinType,
  AppHRP,
  App,
} from "./types";
import { CLA, ERROR_CODE, INS } from "./constants";

export class CosmosApp {
  constructor(public readonly app: string, public readonly transport: any) {
    if (!transport) {
      throw new Error("Transport has not been defined");
    }

    if (app !== "Cosmos" && app !== "Terra" && app !== "Secret") {
      throw new Error(`Unknown app: ${this.app}`);
    }
  }

  static serializeHRP(hrp: string) {
    if (hrp == null || hrp.length < 3 || hrp.length > 83) {
      throw new Error("Invalid HRP");
    }
    const buf = Buffer.alloc(1 + hrp.length);
    buf.writeUInt8(hrp.length, 0);
    buf.write(hrp, 1);
    return buf;
  }

  static openApp(transport: any, name: string): Promise<void> {
    return transport.send(0xe0, 0xd8, 0x00, 0x00, Buffer.from(name, "ascii"));
  }

  getAppInfo(): Promise<AppInfoResponse> {
    return getAppInfo(this.transport);
  }

  getVersion(): Promise<VersionResponse> {
    return getVersion(this.transport);
  }

  getDeviceInfo(): Promise<DeviceInfoResponse> {
    return getDeviceInfo(this.transport);
  }

  getPublicKey(
    account: number,
    change: number,
    addressIndex: number
  ): Promise<PublicKeyResponse> {
    const coinType = AppCoinType[this.app as App];
    if (!coinType) {
      throw new Error(`Unknown app: ${this.app}`);
    }
    const path = [44, coinType, account, change, addressIndex];
    const result = serializePath(path);
    const hrp = AppHRP[this.app as App];
    if (!hrp) {
      throw new Error(`Unknown app: ${this.app}`);
    }
    const data = Buffer.concat([CosmosApp.serializeHRP(hrp), result]);

    return this.transport
      .send(CLA, INS.GET_ADDR_SECP256K1, 0, 0, data, [ERROR_CODE.NoError])
      .then((response: any) => {
        const errorCodeData = response.slice(-2);
        const returnCode: number = errorCodeData[0] * 256 + errorCodeData[1];
        const compressedPk = response
          ? Buffer.from(response.slice(0, 33))
          : null;

        return {
          compressed_pk: compressedPk,
          return_code: returnCode,
          error_message: errorCodeToString(returnCode),
        };
      })
      .catch(processErrorResponse);
  }

  sign(
    account: number,
    change: number,
    addressIndex: number,
    message: Uint8Array
  ): Promise<SignResponse> {
    const coinType = AppCoinType[this.app as App];
    if (!coinType) {
      throw new Error(`Unknown app: ${this.app}`);
    }
    return sign(
      this.transport,
      [44, coinType, account, change, addressIndex],
      message
    );
  }
}
