import React, { FunctionComponent, useState } from "react";

import { Input } from "../../../components/form";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { Button } from "../../../components/button";
import useForm from "react-hook-form";

import { EmptyLayout } from "../../layouts/empty-layout";

import style from "./style.module.scss";
import queryString from "query-string";
import { RouteComponentProps } from "react-router";

interface FormData {
  password: string;
}

export const LockPage: FunctionComponent<Pick<
  RouteComponentProps,
  "location"
>> = observer(({ location }) => {
  const query = queryString.parse(location.search);
  const external = query.external ?? false;

  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: ""
    }
  });

  const { keyRingStore } = useStore();
  const [loading, setLoading] = useState(false);

  return (
    <EmptyLayout style={{ backgroundColor: "white", height: "100%" }}>
      <form
        className={style.formContainer}
        onSubmit={handleSubmit(async data => {
          setLoading(true);
          try {
            await keyRingStore.unlock(data.password);
            if (external) {
              window.close();
            }
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
            setError("password", "invalid", "Invaid password");
            setLoading(false);
          }
        })}
      >
        <div style={{ flex: 1 }} />
        <Input
          type="password"
          label="Passward"
          name="password"
          error={errors.password && errors.password.message}
          ref={register({ required: "Password is empty" })}
        />
        <Button
          type="submit"
          color="primary"
          size="medium"
          fullwidth
          loading={loading}
        >
          Unlock
        </Button>
      </form>
    </EmptyLayout>
  );
});
