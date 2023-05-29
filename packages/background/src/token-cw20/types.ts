import { AppCurrency } from "@keplr-wallet/types";

export interface TokenInfo {
  // Hex encoded
  // Token은 계정당이 아니라 글로벌하게 다뤄짐.
  // 근데 secret20은 viewing key때메 계정에 귀속되어야 함;
  // secret20 때메 어쩔 수 없기 로직이 좀 괴랄해짐.
  // cw20일때는 associatedAccountAddress는 넣으면 안됨.
  associatedAccountAddress?: string;
  currency: AppCurrency;
}
