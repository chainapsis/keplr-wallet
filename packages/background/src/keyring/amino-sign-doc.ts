import Joi from "joi";
import { StdSignDoc } from "@cosmjs/launchpad";

const TrimAminoSignDocScheme = Joi.object({
  chain_id: Joi.string().required(),
  account_number: Joi.string().allow(""),
  sequence: Joi.string().allow(""),
  fee: Joi.object({
    amount: Joi.array().items(
      Joi.object({
        denom: Joi.string().allow(""),
        amount: Joi.string().allow(""),
      })
    ),
    gas: Joi.string().allow(""),
    payer: Joi.string().allow(""),
    granter: Joi.string().allow(""),

    // XXX: "feePayer" should be "payer". But, it maybe from ethermint team's mistake.
    //      That means this part is not standard.
    feePayer: Joi.string().allow(""),
  }),
  msgs: Joi.array().items(Joi.any()),
  memo: Joi.string().allow(""),
  timeout_height: Joi.string().allow(""),
});

/**
 * Trim unknown fields from sign doc.
 * The purpose of this function is not validate the sign doc, but only trim unknown fields.
 * @param signDoc
 */
export function trimAminoSignDoc(signDoc: StdSignDoc): StdSignDoc {
  const res = TrimAminoSignDocScheme.validate(signDoc, {
    stripUnknown: true,
  });
  if (res.error) {
    throw res.error;
  }
  return res.value;
}
