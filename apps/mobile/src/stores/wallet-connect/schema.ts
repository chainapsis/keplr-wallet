import Joi from 'joi';

export const CosmosMethods = [
  'cosmos_getAccounts',
  'cosmos_signDirect',
  'cosmos_signAmino',
  'keplr_getKey',
  'keplr_signAmino',
  'keplr_signDirect',
  'keplr_signArbitrary',
  'keplr_enable',
  'keplr_signEthereum',
  'keplr_experimentalSuggestChain',
  'keplr_suggestToken',
];
// https://docs.walletconnect.com/2.0/javascript/web3wallet/wallet-usage#emit-session-events
// On docs, it describes only about ethereum.
// However, "accountsChanged" event is not standardised for cosmos.
// Even though, "accountsChanged" event not standardised enough,
// Keplr implements it by own way.
// In multi chain ecosystem, it is slightly hard to sync changed account when dapp uses multiple chains.
// To reduce this problem, emit events with changed accounts information with CAIP-10 to permit dapp to sync account with events immediately.
// However, keplr doesn't invoke "chainChanged" event. The reason is multi-chain philosophy of keplr.
export const CosmosEvents = [
  'accountsChanged',
  'chainChanged',
  'keplr_accountsChanged',
];

export const SessionProposalSchema = Joi.object({
  params: Joi.object({
    requiredNamespaces: Joi.object({
      cosmos: Joi.object({
        methods: Joi.array().items(Joi.string().valid(...CosmosMethods)),
        chains: Joi.array().items(
          Joi.string().custom((value: string) => {
            if (!value.startsWith('cosmos:')) {
              throw new Error('Only cosmos chain supported');
            }
            return value;
          }),
        ),
        events: Joi.array().items(Joi.string().valid(...CosmosEvents)),
      }),
      // Only cosmos namespace supported yet.
    }),
  }).unknown(true),
}).unknown(true);
