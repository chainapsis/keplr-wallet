import React, { FunctionComponent, useState } from "react";

import { Input } from "../../../components/form";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { Button } from "../../../components/button";
import useForm from "react-hook-form";

import { EmptyLayout } from "../../layouts/empty-layout";

interface FormData {
  password: string;
}

export const LockPage: FunctionComponent = observer(() => {
  const { register, handleSubmit, errors } = useForm<FormData>({
    defaultValues: {
      password: ""
    }
  });

  const { keyRingStore } = useStore();

  const [loading, setLoading] = useState(false);

  return (
    <EmptyLayout>
      <form
        onSubmit={handleSubmit(async data => {
          setLoading(true);
          await keyRingStore.unlock(data.password);
          await keyRingStore.save();
        })}
      >
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
