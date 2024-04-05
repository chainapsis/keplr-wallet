import React, { FunctionComponent } from "react";
import { usePaginatedCursorQuery } from "./hook";
import { ResMsgsHistory } from "./types";
import { Stack } from "../../../components/stack";
import { MsgItemRender } from "./msg-items";
import { Box } from "../../../components/box";
import { Subtitle4 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { FormattedDate } from "react-intl";

export const RenderMessages: FunctionComponent<{
  explorerUrl: string;
  msgHistory: ReturnType<typeof usePaginatedCursorQuery<ResMsgsHistory>>;
  targetDenom: string;
}> = ({ explorerUrl, msgHistory, targetDenom }) => {
  const msgsPerDaily: {
    year: number;
    month: number;
    day: number;
    msgs: ResMsgsHistory["msgs"];
  }[] = (() => {
    if (msgHistory.pages.length === 0) {
      return [];
    }

    const res: {
      year: number;
      month: number;
      day: number;
      msgs: ResMsgsHistory["msgs"];
    }[] = [];

    // prop 자체로부터 이미 내림차순된 채로 온다고 가정하고 작성한다.
    for (const page of msgHistory.pages) {
      if (page.response) {
        for (const msg of page.response.msgs) {
          if (res.length === 0) {
            const time = new Date(msg.msg.time);
            res.push({
              year: time.getFullYear(),
              month: time.getMonth(),
              day: time.getDate(),
              msgs: [msg],
            });
          } else {
            const last = res[res.length - 1];
            const time = new Date(msg.msg.time);
            if (
              last.year === time.getFullYear() &&
              last.month === time.getMonth() &&
              last.day === time.getDate()
            ) {
              last.msgs.push(msg);
            } else {
              res.push({
                year: time.getFullYear(),
                month: time.getMonth(),
                day: time.getDate(),
                msgs: [msg],
              });
            }
          }
        }
      }
    }

    return res;
  })();

  return (
    <Box padding="0.75rem" paddingTop="0">
      {msgsPerDaily.map((msgs, i) => {
        return (
          <React.Fragment key={i.toString()}>
            <Box
              paddingX="0.375rem"
              marginBottom="0.5rem"
              marginTop={i === 0 ? "0" : "1.25rem"}
            >
              <Subtitle4 color={ColorPalette["gray-200"]}>
                <FormattedDate
                  value={new Date(msgs.year, msgs.month, msgs.day)}
                  year="numeric"
                  month="short"
                  day="numeric"
                />
              </Subtitle4>
            </Box>
            <Stack gutter="0.5rem">
              {msgs.msgs.map((msg) => {
                return (
                  <MsgItemRender
                    key={`${msg.msg.height}/${msg.msg.msgIndex}/${msg.msg.relation}`}
                    explorerUrl={explorerUrl}
                    msg={msg.msg}
                    prices={msg.prices}
                    targetDenom={targetDenom}
                  />
                );
              })}
            </Stack>
          </React.Fragment>
        );
      })}
    </Box>
  );
};
