import Joi from "joi";

export const CosmosMethods = [
  "cosmos_getAccounts",
  "cosmos_signDirect",
  "cosmos_signAmino",
];
// https://docs.walletconnect.com/2.0/javascript/web3wallet/wallet-usage#emit-session-events
// On docs, it describes only about ethereum.
// However, "accountsChanged" event is not standardised for cosmos.
// Keplr supports such event, but it doesn't include the data of address information.
// Because that event not yet standardised enough, additionally emit "keplr_accountsChanged" event at the same time.
// "accountsChanged" event can be changed.
export const CosmosEvents = ["accountsChanged", "keplr_accountsChanged"];

export const SessionProposalSchema = Joi.object({
  params: Joi.object({
    requiredNamespaces: Joi.object({
      cosmos: Joi.object({
        methods: Joi.array().items(Joi.string().valid(...CosmosMethods)),
        chains: Joi.array().items(
          Joi.string().custom((value: string) => {
            if (!value.startsWith("cosmos:")) {
              throw new Error("Only cosmos chain supported");
            }
            return value;
          })
        ),
        events: Joi.array().items(Joi.string().valid(...CosmosEvents)),
      }),
      // Only cosmos namespace supported yet.
    }),
  }).unknown(true),
}).unknown(true);
