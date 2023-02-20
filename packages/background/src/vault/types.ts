type Primitive = string | number | boolean;
export type PlainObject = {
  [key: string]: PlainObject | Primitive | undefined;
};

export interface Vault {
  id: string;
  insensitive: PlainObject;
  sensitive: Uint8Array;
}
