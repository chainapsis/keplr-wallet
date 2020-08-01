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

export interface RegisterState {
  type: string;
  status: RegisterStatus;
  value: string;
  password: string;

  setType(type: string): void;
  setStatus(status: RegisterStatus): void;
  setValue(value: string): void;
  setPassword(password: string): void;

  clear(): void;
}

const RegisterContext = createContext<RegisterState | undefined>(undefined);

export const RegisterStateProvider: FunctionComponent = ({ children }) => {
  const [type, setType] = useState<string>("");
  const [status, setStatus] = useState<RegisterStatus>(RegisterStatus.INIT);
  const [value, setValue] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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
        value,
        password,
        setType,
        setStatus,
        setValue,
        setPassword,
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
