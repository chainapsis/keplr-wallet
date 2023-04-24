import React, {
  FunctionComponent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Columns } from "../../../../components/column";
import { CodeBracketIcon } from "../../../../components/icon";
import { Stack } from "../../../../components/stack";
import { Styles } from "./styles";

export const MessageItem: FunctionComponent<{ paragraph: string }> = ({
  paragraph,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    setHeight(ref.current ? ref.current.offsetHeight : 0);
  }, []);

  return (
    <Styles.Container ref={ref}>
      <Columns sum={1} alignY={height > 81 ? "top" : "center"}>
        <Styles.IconContainer>
          <CodeBracketIcon width="2rem" height="2rem" />
        </Styles.IconContainer>

        <Stack gutter="0.125rem">
          <Styles.Title>Claim Staking Reward</Styles.Title>
          <Styles.Paragraph>{paragraph}</Styles.Paragraph>
        </Stack>
      </Columns>
    </Styles.Container>
  );
};
