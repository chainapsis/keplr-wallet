import React, {
  ComponentType,
  createContext,
  FunctionComponent,
  useContext,
  useState
} from "react";

export enum RegisterStatus {
  INIT,
  REGISTER,
  VERIFY,
  COMPLETE
}

export enum RegisterMode {
  CREATE,
  ADD
}

export interface RegisterState {
  type: string;
  status: RegisterStatus;
  name: string;
  value: string;
  password: string;
  mode: RegisterMode;
  bip44HDPath: {
    account: number;
    change: number;
    addressIndex: number;
  };

  setType(type: string): void;
  setStatus(status: RegisterStatus): void;
  setName(name: string): void;
  setValue(value: string): void;
  setPassword(password: string): void;
  setMode(mode: RegisterMode): void;
  setBIP44HDPath(path: {
    account: number;
    change: number;
    addressIndex: number;
  }): void;

  clear(): void;
}

const RegisterContext = createContext<RegisterState | undefined>(undefined);

export const RegisterStateProvider: FunctionComponent = ({ children }) => {
  const [type, setType] = useState<string>("");
  const [status, setStatus] = useState<RegisterStatus>(RegisterStatus.INIT);
  const [name, setName] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [mode, setMode] = useState<RegisterMode>(RegisterMode.CREATE);
  const [bip44HDPath, setBIP44HDPath] = useState<{
    account: number;
    change: number;
    addressIndex: number;
  }>({
    account: 0,
    change: 0,
    addressIndex: 0
  });

  const clear = () => {
    setType("");
    setStatus(RegisterStatus.INIT);
    setValue("");
    setPassword("");
  };

  return (
    <RegisterContext.Provider
      value={{
        type,
        status,
        name,
        value,
        password,
        mode,
        bip44HDPath,
        setType,
        setStatus,
        setName,
        setValue,
        setPassword,
        setMode,
        setBIP44HDPath,
        clear
      }}
    >
      {children}
    </RegisterContext.Provider>
  );
};

export function useRegisterState() {
  const state = useContext(RegisterContext);
  if (!state)
    throw new Error("You probably forgot to use RegisterStateProvider");
  return state;
}

// HoC for wrapping component with RegisterStateProvider
export const withRegisterStateProvider: <T>(
  Component: ComponentType<T>
) => FunctionComponent<T> = Component => {
  // eslint-disable-next-line react/display-name
  return props => (
    <RegisterStateProvider>
      <Component {...props} />
    </RegisterStateProvider>
  );
};
