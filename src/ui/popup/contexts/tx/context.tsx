import React, {
  ComponentType,
  createContext,
  FunctionComponent,
  useContext,
  useMemo,
  useState
} from "react";

import { AccAddress } from "@everett-protocol/cosmosjs/common/address";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Currency } from "../../../../common/currency";

// Used for collecting the information related to sending tx.
// This doesn't use reducer/dispatch pattern because this is relatively simple
// and doesn't act as global state and act as the pipeline for the components to handle the tx information.
export interface TxState {
  recipient: AccAddress | null;
  amount: Coin | null;

  gas: number;
  // TODO: Gas adjustment
  fees: Coin[];
  memo: string;

  // List of currencies to send
  currencies: Currency[];
  // List of currecies to be able to be used for fee
  feeCurrencies: Currency[];

  // Balances of account to send tx
  balances: Coin[];

  setRecipient(recipient: AccAddress | null): void;
  setAmount(amount: Coin | null): void;

  setGas(gas: number): void;
  setFees(fees: Coin[]): void;
  setMemo(memo: string): void;

  setCurrencies(currencies: Currency[]): void;
  setFeeCurrencies(currencies: Currency[]): void;

  setBalances(balances: Coin[]): void;
}

const TxContext = createContext<TxState | undefined>(undefined);

export const TxStateProvider: FunctionComponent = ({ children }) => {
  const [recipient, setRecipient] = useState<AccAddress | null>(null);
  const [amount, setAmount] = useState<Coin | null>(null);

  const [gas, setGas] = useState(0);
  const [fees, setFees] = useState<Coin[]>([]);
  const [memo, setMemo] = useState<string>("");

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [feeCurrencies, setFeeCurrencies] = useState<Currency[]>([]);

  const [balances, setBalances] = useState<Coin[]>([]);

  return (
    <TxContext.Provider
      value={useMemo(
        () => ({
          recipient,
          amount,
          gas,
          fees,
          memo,
          currencies,
          balances,
          feeCurrencies,
          setRecipient,
          setAmount,
          setGas,
          setFees,
          setMemo,
          setCurrencies,
          setFeeCurrencies,
          setBalances
        }),
        [
          recipient,
          amount,
          gas,
          fees,
          memo,
          currencies,
          balances,
          feeCurrencies
        ]
      )}
    >
      {children}
    </TxContext.Provider>
  );
};

export function useTxState() {
  const state = useContext(TxContext);
  if (!state) throw new Error("You probably forgot to use TxStateProvider");
  return state;
}

// HoC for wrapping component with TxStateProvider
export const withTxStateProvider: <T>(
  Component: ComponentType<T>
) => FunctionComponent<T> = Component => {
  // eslint-disable-next-line react/display-name
  return props => (
    <TxStateProvider>
      <Component {...props} />
    </TxStateProvider>
  );
};
