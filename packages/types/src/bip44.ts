export interface BIP44 {
  readonly coinType: number;
  readonly purpose?: number;
  readonly xpubVersion?: number;
}
