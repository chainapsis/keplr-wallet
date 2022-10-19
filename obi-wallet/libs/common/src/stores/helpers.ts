import * as t from "io-ts";

export function nullable<A>(type: t.Type<A>) {
  return t.union([type, t.null]);
}
