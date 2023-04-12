import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Stack } from "../../../components/stack";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { ColorPalette } from "../../../styles";
import { Box } from "../../../components/box";
import { TransactionFee } from "../../../components/transaction-fee";
import { Button } from "../../../components/button";
import { TextInput } from "../../../components/input";
import { useStore } from "../../../stores";
import { useInteractionInfo } from "../../../hooks";
import { AmountView } from "../components/amount-view";
import { MessageItem } from "../components/message-item";
import { IBCTransferView } from "../components/ibc-transfer-view";
import { MessageTitle } from "../components/message-title";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
  MinHeight: styled.div`
    flex: 1;
    min-height: 0.75rem;
  `,

  MessageContainer: styled.div`
    height: 15rem;

    margin-top: 0.5rem;

    overflow: scroll;

    border-radius: 0.375rem;
  `,
  ViewData: styled.pre`
    overflow: scroll;
    background-color: ${ColorPalette["gray-600"]};
  `,

  BottomButton: styled.div`
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 1rem;
  `,
};

export const SignCosmosTxPage: FunctionComponent = observer(() => {
  const [isIBCTransfer, _] = useState(false);
  const [isRawData, setIsRawData] = useState(true);

  const { signInteractionStore } = useStore();

  const interactionInfo = useInteractionInfo(() => {
    signInteractionStore.rejectAll();
  });

  // if (signInteractionStore.waitingData == null) {
  //   return <div>TODO: Perparing view?</div>;
  // }

  return (
    <HeaderLayout title="Confirm Transaction" left={<BackButton />}>
      <Styles.Container>
        {isIBCTransfer ? (
          <IBCTransferView />
        ) : (
          <Box>
            <MessageTitle
              messageCount="3"
              title=" Messages"
              onClick={() => setIsRawData(!isRawData)}
            />

            <Styles.MessageContainer>
              {isRawData ? (
                <Styles.ViewData>
                  {JSON.stringify(signInteractionStore.waitingData?.data)}
                </Styles.ViewData>
              ) : (
                <Box>
                  <MessageItem paragraph="From cosmosvalope...tqgfnp42" />
                  <MessageItem paragraph="From cosmosvalope...tqgfnp42" />
                  <MessageItem paragraph="From cosmosvalope...tqgfnp42" />

                  <MessageItem
                    paragraph={`
                  type: osmosis/gamm/swap-exact- amount in
                  value:.   routes;
                  pool_id: ‘2’.          
                  token_out_denom: uiontype: osmosis/gamm/swap-exact- amount in
                  value:.   routes;
                  pool_id: ‘2’.          
                  token_out_denom: uion
                `}
                  />
                </Box>
              )}
            </Styles.MessageContainer>
          </Box>
        )}
        <Styles.MinHeight />

        <Stack gutter="0.75rem">
          <AmountView />
          <TextInput label="Memo" />

          <TransactionFee />
        </Stack>

        <Styles.BottomButton>
          <Button
            text="Approve"
            color="primary"
            size="large"
            onClick={async () => {
              if (signInteractionStore.waitingData) {
                await signInteractionStore.approveAndWaitEnd(
                  signInteractionStore.waitingData.data.signDocWrapper
                );

                if (
                  interactionInfo.interaction &&
                  !interactionInfo.interactionInternal
                ) {
                  window.close();
                }
              }
            }}
          />
        </Styles.BottomButton>
      </Styles.Container>
    </HeaderLayout>
  );
});
