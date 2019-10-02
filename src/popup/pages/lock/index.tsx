import React, { FunctionComponent, useState } from "react";

import { Form, Input, Label } from "../../components/form";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

export const LockPage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const [password, setPassword] = useState("");

  return (
    <Form
      onSubmit={async e => {
        e.preventDefault();
        await keyRingStore.unlock(password);
        await keyRingStore.save();
      }}
    >
      <Label>Password</Label>
      <Input
        type="text"
        required
        value={password}
        onChange={e => {
          setPassword(e.target.value);
        }}
      />

      <Input type="submit" value="Submit" />

      <Label>Test</Label>
      <Input
        type="text"
        required
        value={password}
        onChange={e => {
          setPassword(e.target.value);
        }}
      />
    </Form>
  );
});
