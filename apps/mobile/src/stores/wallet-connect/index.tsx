import SignClient from '@walletconnect/sign-client';
import {action, autorun, makeObservable, observable, runInAction} from 'mobx';
import {CosmosEvents, CosmosMethods, SessionProposalSchema} from './schema';
import {getBasicAccessPermissionType} from '@keplr-wallet/background';
import {ChainStore} from '../chain';
import {WCMessageRequester} from './msg-requester';
import {Keplr} from '@keplr-wallet/provider';
import {RNRouterBackground} from '../../router';
import {Buffer} from 'buffer/';
import {KVStore} from '@keplr-wallet/common';
import Long from 'long';
import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {AppState} from 'react-native';
import {Key} from '@keplr-wallet/types';
import {
  KeyRingStore,
  PermissionManagerStore,
  PermissionStore,
} from '@keplr-wallet/stores-core';
import {getRandomBytesAsync} from 'expo-crypto';

function noop(fn: () => void): void {
  fn();
}

export class WalletConnectStore {
  // This field is null until init
  @observable.ref
  signClient: SignClient | undefined = undefined;

  protected sessionProposalResolverMap = new Map<
    string,
    {
      fromDeepLink?: boolean;
      resolve: () => void;
      reject: (e: Error) => void;
    }
  >();

  @observable.shallow
  protected pendingSessionProposalMetadataMap = new Map<
    string,
    {
      name?: string;
      description?: string;
      url?: string;
      icons?: string[];
    }
  >();

  // Used for invoking reaction by force.
  // To match mobx's reactive system and wallet connect library,
  // it needs to invoke reaction when needed (session added, deleted...)
  @observable
  protected _forceReaction: number = 0;

  /*
   Indicate that there is a pending client that was requested from the deep link.
   Creating session take some time, but this store can't show the indicator.
   Component can show the indicator on behalf of this store if needed.
   */
  @observable
  protected _isPendingClientFromDeepLink: boolean = false;

  @observable
  protected _needGoBackToBrowser: boolean = false;

  /*
   XXX: Fairly hacky part.
        In Android, it seems posible that JS works, but all views deleted.
        This case seems to happen when the window size of the app is forcibly changed or the app is exited.
        But there doesn't seem to be an API that can detect this.
        The reason this is a problem is that the stores are all built with a singleton concept.
        Even if the view is initialized and recreated, this store is not recreated.
        In this case, the url handler of the deep link does not work and must be called through initialURL().
        To solve this problem, we leave the detection of the activity state to another component.
        If a component that cannot be unmounted is unmounted, it means the activity is killed.
   */
  protected _isAndroidActivityKilled = false;
  /*
   This means that how many wc call request is processing.
   When the call requested, should increase this.
   And when the requested call is completed, should decrease this.
   This field is only needed on the handler side, so don't need to be observable.
   */
  protected wcCallCount: number = 0;
  /*
   Check that there is a wallet connect call from the client that was connected by deep link.
   */
  @observable
  protected _isPendingWcCallFromDeepLinkClient = false;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainStore: ChainStore,
    protected readonly keyRingStore: KeyRingStore,
    protected readonly permissionStore: PermissionStore,
    protected readonly permissionManagerStore: PermissionManagerStore,
  ) {
    makeObservable(this);

    this.init();
  }

  protected async init(): Promise<void> {
    const projectId = process.env['WC_PROJECT_ID'];
    if (!projectId) {
      return;
    }

    const signClient = await SignClient.init({
      projectId: projectId,
      metadata: {
        name: 'Keplr',
        description: 'Your Wallet for the Interchain',
        url: 'https://www.keplr.app',
        icons: ['https://asset-icons.s3.us-west-2.amazonaws.com/keplr_512.png'],
      },
    });

    runInAction(() => {
      this.signClient = signClient;
    });

    signClient.on('session_proposal', this.onSessionProposal.bind(this));
    signClient.on('session_request', this.onSessionRequest.bind(this));
    signClient.on('session_delete', this.onSessionDelete.bind(this));

    this.eventListener.addEventListener(
      'keplr_keystoreunlock',
      this.accountMayChanged.bind(this),
    );
    this.eventListener.addEventListener(
      'keplr_keystorechange',
      this.accountMayChanged.bind(this),
    );
  }

  async processDeepLinkURL(url: URL) {
    try {
      // If deep link, uri can be escaped.
      let params = decodeURIComponent(url.search);
      if (params) {
        if (params.startsWith('?')) {
          params = params.slice(1);
        }

        const topic = this.getTopicFromURI(params);
        try {
          // Validate that topic is hex encoded.
          if (
            Buffer.from(topic, 'hex').toString('hex').toLowerCase() !==
            topic.toLowerCase()
          ) {
            throw new Error('Invalid topic');
          }
        } catch {
          console.log('Invalid topic', params);
          return;
        }
        if (this.sessionProposalResolverMap.has(topic)) {
          runInAction(() => {
            // 엄밀하게 말하면 확신할 수 있는건 아니지만
            // 이미 pairing된 uri로 wc 요청이 들어오면 request 처리일 확률이 높음.
            this._isPendingWcCallFromDeepLinkClient = true;
          });
          // Already requested. Do nothing.
          return;
        }

        runInAction(() => {
          this._isPendingClientFromDeepLink = true;
        });

        try {
          const topic = this.getTopicFromURI(params);
          const signClient = await this.ensureInit();
          if (!signClient.pairing.keys.includes(topic)) {
            await this.pair(params, true);
          }
        } catch (e) {
          console.log('Failed to init wallet connect v2 client', e);
        } finally {
          runInAction(() => {
            this._isPendingClientFromDeepLink = false;
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  get isPendingClientFromDeepLink(): boolean {
    return this._isPendingClientFromDeepLink;
  }

  get isPendingWcCallFromDeepLinkClient(): boolean {
    return this._isPendingWcCallFromDeepLinkClient;
  }

  /**
   needGoBackToBrowser indicates that all requests from the wallet connect are processed when the request is from the deep link.
   This store doesn't show any indicator to user or close the app.
   The other component (maybe provider) should act according to this field.
   */
  get needGoBackToBrowser(): boolean {
    return this._needGoBackToBrowser;
  }

  /**
   clearNeedGoBackToBrowser is used in the component to set the needGoBackToBrowser as false.
   */
  @action
  clearNeedGoBackToBrowser() {
    this._needGoBackToBrowser = false;
  }

  get isAndroidActivityKilled(): boolean {
    return this._isAndroidActivityKilled;
  }

  setAndroidActivityKilled(killed: boolean) {
    this._isAndroidActivityKilled = killed;
  }

  async getSessionMetadata(id: string): Promise<
    | {
        name?: string;
        description?: string;
        url?: string;
        icons?: string[];
      }
    | undefined
  > {
    if (!this.signClient) {
      return;
    }

    if (this.pendingSessionProposalMetadataMap.has(id)) {
      return this.pendingSessionProposalMetadataMap.get(id);
    }

    const topic = await this.getTopicByRandomId(id);
    if (!topic) {
      return;
    }

    noop(() => this._forceReaction);

    try {
      return this.signClient.session.get(topic).peer.metadata;
    } catch (e) {
      console.log(e);
      return;
    }
  }

  getSession(topic: string):
    | {
        topic: string;
        namespaces: Record<
          string,
          | {
              accounts: string[];
              methods: string[];
              events: string[];
            }
          | undefined
        >;
        peer: {
          metadata: {
            name?: string;
            description?: string;
            url?: string;
            icons?: string[];
          };
        };
      }
    | undefined {
    if (!this.signClient) {
      return;
    }

    try {
      return this.signClient.session.get(topic);
    } catch (e) {
      console.log(e);
      return;
    }
  }

  getSessions(): {
    topic: string;
    namespaces: Record<
      string,
      | {
          accounts: string[];
          methods: string[];
          events: string[];
        }
      | undefined
    >;
    peer: {
      metadata: {
        name?: string;
        description?: string;
        url?: string;
        icons?: string[];
      };
    };
  }[] {
    if (!this.signClient) {
      return [];
    }

    noop(() => this._forceReaction);

    return this.signClient.session.getAll() || [];
  }

  async disconnect(topic: string): Promise<void> {
    if (!this.signClient) {
      return;
    }

    await this.signClient.disconnect({
      topic: topic,
      reason: {
        code: 201,
        message: 'disconnected',
      },
    });

    this.forceReaction();

    await this.topicDisconnected(topic);
  }

  protected async accountMayChanged(): Promise<void> {
    await this.ensureInit();

    const sessions = this.getSessions();
    for (const session of sessions) {
      // no need to wait
      this.accountMayChangedSession(session.topic);
    }
  }

  /*
    Based on the permissions allowed for each session, check if any changes are required for accounts in existing sessions.
    If change is required, the session is updated and "accountsChanged" event is raised.
   */
  protected async accountMayChangedSession(topic: string): Promise<void> {
    const signClient = await this.ensureInit();

    const session = this.getSession(topic);
    if (session) {
      if (!session.namespaces['cosmos']) {
        return;
      }

      const namespaceMap: Record<string, string | undefined> = {};
      for (const account of session.namespaces['cosmos']!.accounts) {
        const split = account.split(':');
        if (split.length !== 3) {
          return;
        }
        if (split[0] !== 'cosmos') {
          return;
        }
        const chainId = split[1];
        namespaceMap[ChainIdHelper.parse(chainId).identifier] = split[2];
      }

      const newNamespaces = {
        cosmos: {
          ...session.namespaces['cosmos'],
          accounts: [] as string[],
        },
      };

      const changedInfos: {caip10: string; account: string; key: Key}[] = [];

      const randomId = await this.getRandomIdByTopic(topic);
      if (randomId) {
        const permittedChains =
          await this.permissionStore.getOriginPermittedChains(
            WCMessageRequester.getVirtualURL(randomId),
            getBasicAccessPermissionType(),
          );

        const keplr = this.createKeplrAPI(randomId);

        for (const chain of permittedChains) {
          if (this.chainStore.hasChain(chain)) {
            const key = await keplr.getKey(chain);
            const chainInfo = this.chainStore.getChain(chain);

            const account = `cosmos:${chainInfo.chainId}:${key.bech32Address}`;

            newNamespaces.cosmos.accounts.push(account);

            if (namespaceMap[chain] !== key.bech32Address) {
              changedInfos.push({
                caip10: `cosmos:${chainInfo.chainId}`,
                account,
                key,
              });
            }
          }
        }
      }

      if (changedInfos.length > 0) {
        await signClient.update({
          topic,
          namespaces: newNamespaces,
        });

        const keys = [];

        for (const changedInfo of changedInfos) {
          // No need to wait
          signClient.emit({
            topic,
            event: {
              name: 'accountsChanged',
              data: [changedInfo.account],
            },
            chainId: changedInfo.caip10,
          });

          keys.push({
            chainId: changedInfo.caip10.replace('cosmos:', ''),
            ...changedInfo.key,
          });
        }

        signClient.emit({
          topic,
          event: {
            name: 'keplr_accountsChanged',
            data: {
              keys: JSON.stringify(
                keys.map(key => {
                  return {
                    ...key,
                    pubKey: Buffer.from(key.pubKey).toString('base64'),
                    address: Buffer.from(key.address).toString('base64'),
                  };
                }),
              ),
            },
          },
          chainId: changedInfos[0].caip10,
        });
      }
    }
  }

  protected async onSessionDelete(event: any) {
    const topic = event.topic;
    if (!topic) {
      console.log('Invalid wc2 request');
      return;
    }

    this.forceReaction();

    await this.topicDisconnected(topic);
  }

  protected async topicDisconnected(topic: string): Promise<void> {
    const id = await this.getRandomIdByTopic(topic);

    if (id) {
      for (const chainInfo of this.chainStore.chainInfos) {
        await this.permissionManagerStore.removePermission(
          WCMessageRequester.getVirtualURL(id),
          chainInfo.chainId,
          getBasicAccessPermissionType(),
        );
      }
    }

    await this.clearTopic(topic);
  }

  protected async onSessionProposal(event: any) {
    const signClient = await this.ensureInit();

    const id = event?.id;
    if (!id) {
      // In this case, nothing to do.
      console.log('Invalid wc2 request');
      return;
    }
    const topic = event?.params?.pairingTopic;
    if (!topic) {
      // In typing, they say that pairingTopic can be null.
      // However, in that case, we can't do anything.
      await signClient.reject({
        id,
        reason: {
          code: 1,
          message: 'there is no pairing topic',
        },
      });
      return;
    }

    const resolver = this.sessionProposalResolverMap.get(topic);
    if (resolver) {
      resolver.resolve();
      this.sessionProposalResolverMap.delete(topic);
    }

    const randomId = Buffer.from(await getRandomBytesAsync(10)).toString('hex');

    try {
      const proposal = await SessionProposalSchema.validateAsync(event);

      const metadata = proposal.params?.proposer?.metadata;
      if (metadata) {
        this.pendingSessionProposalMetadataMap.set(randomId, metadata);
      }

      const chainIds = proposal.params.requiredNamespaces.cosmos.chains.map(
        (chainId: string) => chainId.replace('cosmos:', ''),
      );

      const keplr = this.createKeplrAPI(randomId);
      await keplr.enable(chainIds);

      const accounts: string[] = [];
      const keys = [];
      for (const chainId of chainIds) {
        const key = await keplr.getKey(chainId);
        keys.push({chainId, ...key});
        accounts.push(`cosmos:${chainId}:${key.bech32Address}`);
      }

      const {topic: ackTopic, acknowledged} = await signClient.approve({
        id,
        namespaces: {
          cosmos: {
            accounts,
            methods: CosmosMethods,
            events: CosmosEvents,
          },
        },
        sessionProperties: {
          keys: JSON.stringify(
            keys.map(key => {
              return {
                ...key,
                pubKey: Buffer.from(key.pubKey).toString('base64'),
                address: Buffer.from(key.address).toString('base64'),
              };
            }),
          ),
        },
      });

      await this.saveTopic(randomId, ackTopic, resolver?.fromDeepLink ?? false);

      await acknowledged();

      this.forceReaction();
    } catch (e) {
      await signClient.reject({
        id,
        reason: {
          code: 1,
          message: e.message || e.toString(),
        },
      });
    } finally {
      this.pendingSessionProposalMetadataMap.delete(randomId);

      if (
        resolver &&
        resolver.fromDeepLink &&
        this.pendingSessionProposalMetadataMap.size === 0
      ) {
        if (AppState.currentState === 'active') {
          runInAction(() => {
            this._needGoBackToBrowser = true;
          });
        }
      }
    }
  }

  protected async onSessionRequest(event: any): Promise<void> {
    const signClient = await this.ensureInit();

    const id = event?.id;
    if (!id) {
      // In this case, nothing to do.
      console.log('Invalid wc2 request');
      return;
    }
    const topic = event?.topic;
    if (!topic) {
      // In this case, nothing to do.
      console.log('Invalid wc2 request');
      return;
    }

    this.wcCallCount++;

    // 인터렉션이 필수적인 method의 경우
    // ios에서는 웹브라우저로 돌아가라는 모달을 보여주고
    // 안드로이드에서는 앱을 kill 해버린다.
    // enable, getKey같은 method는 인터렉션이 필요한지 아닌지 구분하기 힘들다.
    // sign과 같이 인터렉션이 필수적인 얘들의 경우 true로 설정해줘야한다.
    let interactionNeeded = false;

    try {
      let chainId = event.params.chainId as string;
      if (!chainId.startsWith('cosmos:')) {
        throw new Error('Only cosmos chain supported');
      }
      chainId = chainId.replace('cosmos:', '');

      const reqId = await this.getRandomIdByTopic(topic);
      if (!reqId) {
        throw new Error('Unregistered topic');
      }

      if (await this.getFromDeepLinkByTopic(topic)) {
        runInAction(() => {
          this._isPendingWcCallFromDeepLinkClient = true;
        });
      }

      // Store permitted chains before processing request.
      const permittedChains =
        await this.permissionStore.getOriginPermittedChains(
          WCMessageRequester.getVirtualURL(reqId),
          getBasicAccessPermissionType(),
        );

      const keplr = this.createKeplrAPI(reqId);

      const params = event.params.request.params;
      switch (event.params.request.method) {
        case 'cosmos_getAccounts': {
          const key = await keplr.getKey(chainId);
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              result: [
                {
                  algo: key.algo,
                  address: key.bech32Address,
                  pubkey: Buffer.from(key.pubKey).toString('base64'),
                },
              ],
            },
          });
          break;
        }
        case 'cosmos_signAmino': {
          interactionNeeded = true;
          const res = await keplr.signAmino(
            chainId,
            params.signerAddress,
            params.signDoc,
            params.signOptions,
          );
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              result: {
                signature: res.signature,
                signed: res.signed,
              },
            },
          });
          break;
        }
        case 'cosmos_signDirect': {
          interactionNeeded = true;
          const res = await keplr.signDirect(chainId, params.signerAddress, {
            bodyBytes: Buffer.from(params.signDoc.bodyBytes, 'base64'),
            authInfoBytes: Buffer.from(params.signDoc.authInfoBytes, 'base64'),
            chainId: params.signDoc.chainId,
            accountNumber: Long.fromString(params.signDoc.accountNumber),
          });
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              result: {
                signature: res.signature,
                signed: {
                  bodyBytes: Buffer.from(res.signed.bodyBytes).toString(
                    'base64',
                  ),
                  authInfoBytes: Buffer.from(res.signed.authInfoBytes).toString(
                    'base64',
                  ),
                  chainId: res.signed.chainId,
                  accountNumber: res.signed.accountNumber.toString(),
                },
              },
            },
          });
          break;
        }
        case 'keplr_getKey': {
          const res = await keplr.getKey(params.chainId);
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              result: {
                name: res.name,
                algo: res.algo,
                pubKey: Buffer.from(res.pubKey).toString('base64'),
                address: Buffer.from(res.address).toString('base64'),
                bech32Address: res.bech32Address,
                isNanoLedger: res.isNanoLedger,
              },
            },
          });
          break;
        }
        case 'keplr_signAmino': {
          interactionNeeded = true;
          const res = await keplr.signAmino(
            params.chainId,
            params.signer,
            params.signDoc,
            params.signOptions,
          );
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              result: {
                ...res,
              },
            },
          });
          break;
        }
        case 'keplr_signDirect': {
          interactionNeeded = true;
          const res = await keplr.signDirect(params.chainId, params.signer, {
            bodyBytes: Buffer.from(params.signDoc.bodyBytes, 'base64'),
            authInfoBytes: Buffer.from(params.signDoc.authInfoBytes, 'base64'),
            chainId: params.signDoc.chainId,
            accountNumber: Long.fromString(params.signDoc.accountNumber),
          });

          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              result: {
                signature: res.signature,
                signed: {
                  bodyBytes: Buffer.from(res.signed.bodyBytes).toString(
                    'base64',
                  ),
                  authInfoBytes: Buffer.from(res.signed.authInfoBytes).toString(
                    'base64',
                  ),
                  chainId: res.signed.chainId,
                  accountNumber: res.signed.accountNumber.toString(),
                },
              },
            },
          });
          break;
        }
        case 'keplr_signArbitrary': {
          interactionNeeded = true;
          const res = await keplr.signArbitrary(
            params.chainId,
            params.signer,
            params.type === 'string'
              ? params.data
              : Buffer.from(params.data, 'base64'),
          );

          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              result: {
                ...res,
              },
            },
          });
          break;
        }
        case 'keplr_enable': {
          await keplr.enable(params.chainId);
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              result: {},
            },
          });
          break;
        }
        case 'keplr_signEthereum': {
          interactionNeeded = true;
          const res = await keplr.signEthereum(
            params.chainId,
            params.signer,
            params.data,
            params.type,
          );

          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              result: {
                ...res,
              },
            },
          });
          break;
        }
        case 'keplr_experimentalSuggestChain': {
          interactionNeeded = true;

          await keplr.experimentalSuggestChain(params.chainInfo);
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              result: {},
            },
          });
          break;
        }
        case 'keplr_suggestToken': {
          interactionNeeded = true;

          await keplr.suggestToken(params.chainId, params.contractAddress);
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              result: {},
            },
          });
          break;
        }
        default:
          throw new Error('Unknown request method');
      }

      // Keplr asks permission to user according to requests.
      // It is possible that new permission added to session after requests.
      // If changes exists, try to update session and emit event.
      const newPermittedChains =
        await this.permissionStore.getOriginPermittedChains(
          WCMessageRequester.getVirtualURL(reqId),
          getBasicAccessPermissionType(),
        );
      if (
        JSON.stringify(permittedChains) !== JSON.stringify(newPermittedChains)
      ) {
        // No need to wait.
        this.accountMayChangedSession(topic);

        // 새로운 permission이 추가되었을 경우
        // 웹페이지에서 앱이 열려있도록 보장하기 위해서 deep link를 썻을 확률이 높기 때문에
        // 인터렉션이 필요한 경우라고 가정한다.
        interactionNeeded = true;
      }
    } catch (e) {
      console.log(e);
      await signClient.respond({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          error: {
            code: 1,
            message: e.message || e.toString(),
          },
        },
      });
    } finally {
      this.wcCallCount--;

      if (
        interactionNeeded &&
        this.wcCallCount === 0 &&
        this._isPendingWcCallFromDeepLinkClient
      ) {
        runInAction(() => {
          this._isPendingWcCallFromDeepLinkClient = false;
        });

        if (AppState.currentState === 'active') {
          runInAction(() => {
            this._needGoBackToBrowser = true;
          });
        }
      }
    }
  }

  async pair(uri: string, fromDeepLink?: boolean) {
    const topic = this.getTopicFromURI(uri);

    const signClient = await this.ensureInit();

    return new Promise<void>((resolve, reject) => {
      this.sessionProposalResolverMap.set(topic, {
        fromDeepLink,
        resolve,
        reject,
      });

      signClient.pair({uri}).catch(e => {
        reject(e);

        this.sessionProposalResolverMap.delete(topic);
      });

      setTimeout(() => {
        reject(new Error('Timeout'));

        this.sessionProposalResolverMap.delete(topic);
      }, 10000);
    });
  }

  protected getTopicFromURI(uri: string): string {
    let str = uri.replace('wc:', '');
    const i = str.indexOf('?');
    if (i >= 0) {
      str = str.slice(0, i);
    }
    str = str.replace('@2', '');
    return str;
  }

  protected async ensureInit(): Promise<SignClient> {
    await this.waitInitStores();

    if (this.signClient) {
      return this.signClient;
    }

    return new Promise(resolve => {
      const disposal = autorun(() => {
        if (this.signClient) {
          resolve(this.signClient);

          if (disposal) {
            disposal();
          }
        }
      });
    });
  }

  protected async waitInitStores(): Promise<void> {
    // Wait until the chain store and account store is ready.
    if (this.chainStore.isInitializing) {
      await new Promise<void>(resolve => {
        const disposer = autorun(() => {
          if (!this.chainStore.isInitializing) {
            resolve();
            if (disposer) {
              disposer();
            }
          }
        });
      });
    }

    if (this.keyRingStore.status !== 'unlocked') {
      await new Promise<void>(resolve => {
        const disposer = autorun(() => {
          if (this.keyRingStore.status === 'unlocked') {
            resolve();
            if (disposer) {
              disposer();
            }
          }
        });
      });
    }
  }

  protected createKeplrAPI(id: string) {
    return new Keplr(
      // TODO: Set version
      '',
      'core',
      new WCMessageRequester(RNRouterBackground.EventEmitter, id),
    );
  }

  protected async saveTopic(
    randomId: string,
    ackTopic: string,
    fromDeepLink: boolean,
  ): Promise<void> {
    await this.kvStore.set(`id-to-topic:${randomId}`, ackTopic);
    await this.kvStore.set(`topic-to-id:${ackTopic}`, randomId);
    await this.kvStore.set(`topic-to-from-deep-link:${ackTopic}`, fromDeepLink);
  }

  async getTopicByRandomId(randomId: string): Promise<string | undefined> {
    return await this.kvStore.get(`id-to-topic:${randomId}`);
  }

  protected async getRandomIdByTopic(
    topic: string,
  ): Promise<string | undefined> {
    return await this.kvStore.get(`topic-to-id:${topic}`);
  }

  protected async getFromDeepLinkByTopic(
    topic: string,
  ): Promise<boolean | undefined> {
    // XXX: This value is added after deep link wc v2 updates.
    //      Thus, it is possible that there is no value if client was made before the update.
    return await this.kvStore.get(`topic-to-from-deep-link:${topic}`);
  }

  protected async clearTopic(topic: string): Promise<void> {
    const randomId = await this.kvStore.get(`topic-to-id:${topic}`);
    await this.kvStore.set(`topic-to-id:${topic}`, null);
    await this.kvStore.set(`topic-to-from-deep-link:${topic}`, null);
    if (randomId) {
      await this.kvStore.set(`id-to-topic:${randomId}`, null);
    }
  }

  protected async clearTopicByRandomId(randomId: string): Promise<void> {
    const topic = await this.kvStore.get(`id-to-topic:${randomId}`);
    await this.kvStore.set(`id-to-topic:${randomId}`, null);
    if (topic) {
      await this.kvStore.set(`topic-to-id:${topic}`, null);
      await this.kvStore.set(`topic-to-from-deep-link:${topic}`, null);
    }
  }

  @action
  protected forceReaction() {
    this._forceReaction++;
  }
}
