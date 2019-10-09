import React, { FunctionComponent } from "react";
import { Form, Input, Label } from "../../components/form";

export const SendPage: FunctionComponent = () => {
  return (
    <Form>
      <Label>Recipient</Label>
      <Input type="text" required />
      <Label>Amount</Label>
      <Input type="text" required />
      <Input type="submit" value="Submit" />
    </Form>
  );
};
