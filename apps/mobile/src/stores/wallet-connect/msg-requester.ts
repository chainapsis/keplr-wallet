import {
  Message,
  MessageRequester,
  Result,
  JSONUint8Array,
  KeplrError,
  EthereumProviderRpcError,
} from '@keplr-wallet/router';
import EventEmitter from 'eventemitter3';

export class WCMessageRequester implements MessageRequester {
  constructor(
    protected readonly eventEmitter: EventEmitter,
    protected readonly topic: string,
  ) {}

  static getVirtualURL = (id: string): string => {
    return `https://keplr_wc_virtual@2.${id}`;
  };

  static isVirtualURL = (url: string): boolean => {
    return url.startsWith('https://keplr_wc_virtual@2.');
  };

  static getIdFromVirtualURL = (url: string): string => {
    if (!WCMessageRequester.isVirtualURL(url)) {
      throw new Error('URL is not for wallet connect v2');
    }

    return url.replace('https://keplr_wc_virtual@2.', '').replace('/', '');
  };

  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M,
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();

    // In the router and background, the origin should be formed as proper URL.
    // But, actually there is no expilicit and reliable URL in the wallet connect system.
    // Rather than handling the wallet connect with different logic, just set the URL as virtually formed URL with session id.
    const url = WCMessageRequester.getVirtualURL(this.topic);

    // @ts-ignore
    msg['origin'] = url;

    if (this.eventEmitter.listenerCount('message') === 0) {
      throw new Error('There is no router to send');
    }

    const result: Result = JSONUint8Array.unwrap(
      await new Promise(resolve => {
        this.eventEmitter.emit('message', {
          message: {
            port,
            type: msg.type(),
            msg: JSONUint8Array.wrap(msg),
          },
          sender: {
            id: 'react-native',
            url,
            resolver: resolve,
          },
        });
      }),
    );

    if (!result) {
      throw new Error('Null result');
    }

    if (result.error) {
      if (typeof result.error === 'string') {
        throw new Error(result.error);
      } else {
        if ('module' in result.error) {
          if (typeof result.error.module === 'string') {
            throw new KeplrError(
              result.error.module,
              result.error.code,
              result.error.message,
            );
          }
        } else {
          throw new EthereumProviderRpcError(
            result.error.code,
            result.error.message,
            result.error.data,
          );
        }
      }
    }

    return result.return;
  }
}
