import React, { FunctionComponent, useState } from "react";

import { Button, Form } from "reactstrap";

import {
  RegisterMode,
  RegisterStatus,
  useRegisterState
} from "../../../contexts/register";

import { FormattedMessage, useIntl } from "react-intl";
import style from "./style.module.scss";
import { BackButton } from "./index";
import { Input } from "../../../components/form";
import useForm from "react-hook-form";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { AdvancedBIP44Option } from "./advanced-bip44";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const TypeAddLedger = "add-ledger";

export const AddLedgerPage: FunctionComponent = () => {
  const registerState = useRegisterState();

  return (
    <React.Fragment>
      {registerState.status === RegisterStatus.INIT ? (
        <Button
          color="primary"
          outline
          block
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();

            registerState.setStatus(RegisterStatus.REGISTER);
            registerState.setType(TypeAddLedger);
          }}
        >
          <FormattedMessage id="register.ledger.title" />
        </Button>
      ) : null}
      {registerState.type === TypeAddLedger &&
      registerState.status === RegisterStatus.REGISTER ? (
        <AddLedgerPageIn />
      ) : null}
    </React.Fragment>
  );
};

const AddLedgerPageIn: FunctionComponent = observer(() => {
  const intl = useIntl();

  const { keyRingStore } = useStore();

  const registerState = useRegisterState();

  const { register, handleSubmit, getValues, errors } = useForm<FormData>({
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: ""
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  return (
    <React.Fragment>
      {registerState.status === RegisterStatus.REGISTER ? (
        <div>
          <div className={style.title}>
            {intl.formatMessage({
              id: "register.name"
            })}
          </div>
          <Form
            className={style.formContainer}
            onSubmit={handleSubmit(async (data: FormData) => {
              setIsLoading(true);

              try {
                if (registerState.mode === RegisterMode.ADD) {
                  await keyRingStore.addLedgerKey(
                    {
                      name: data.name
                    },
                    registerState.bip44HDPath
                  );
                } else {
                  await keyRingStore.createLedgerKey(
                    data.password,
                    {
                      name: data.name
                    },
                    registerState.bip44HDPath
                  );
                }
                await keyRingStore.save();
                registerState.setStatus(RegisterStatus.COMPLETE);
              } catch (e) {
                alert(e.message ? e.message : e.toString());
                registerState.clear();
              }
            })}
          >
            <Input
              label={intl.formatMessage({
                id: "register.name"
              })}
              type="text"
              name="name"
              ref={register({
                required: intl.formatMessage({
                  id: "register.name.error.required"
                })
              })}
              error={errors.name && errors.name.message}
            />
            {registerState.mode === RegisterMode.CREATE ? (
              <React.Fragment>
                <Input
                  label={intl.formatMessage({
                    id: "register.create.input.password"
                  })}
                  type="password"
                  name="password"
                  ref={register({
                    required: intl.formatMessage({
                      id: "register.create.input.password.error.required"
                    }),
                    validate: (password: string): string | undefined => {
                      if (password.length < 8) {
                        return intl.formatMessage({
                          id: "register.create.input.password.error.too-short"
                        });
                      }
                    }
                  })}
                  error={errors.password && errors.password.message}
                />
                <Input
                  label={intl.formatMessage({
                    id: "register.create.input.confirm-password"
                  })}
                  type="password"
                  name="confirmPassword"
                  ref={register({
                    required: intl.formatMessage({
                      id:
                        "register.create.input.confirm-password.error.required"
                    }),
                    validate: (confirmPassword: string): string | undefined => {
                      if (confirmPassword !== getValues()["password"]) {
                        return intl.formatMessage({
                          id:
                            "register.create.input.confirm-password.error.unmatched"
                        });
                      }
                    }
                  })}
                  error={
                    errors.confirmPassword && errors.confirmPassword.message
                  }
                />
              </React.Fragment>
            ) : null}
            <AdvancedBIP44Option coinType={118} />
            <Button
              color="primary"
              type="submit"
              block
              data-loading={isLoading}
            >
              <FormattedMessage id="register.create.button.next" />
            </Button>
          </Form>
          <BackButton onClick={registerState.clear} />
        </div>
      ) : null}
    </React.Fragment>
  );
});
