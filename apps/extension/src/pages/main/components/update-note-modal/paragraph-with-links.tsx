import React, { FunctionComponent } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { UpdateNotePageData } from ".";
import { Gutter } from "../../../../components/gutter";

const Styles = {
  Link: styled.span`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-600"]
        : ColorPalette["gray-50"]};

    cursor: pointer;
    text-decoration: underline;
  `,
};

export const ParagraphWithLinks: FunctionComponent<{
  paragraph: string;
  links?: UpdateNotePageData["links"];
}> = ({ paragraph, links }) => {
  return (
    <FormattedMessage
      id="update-node/paragraph/noop"
      defaultMessage={paragraph}
      values={{
        br: <br />,
        b: (...chunks: React.ReactNode[]) => (
          <b style={{ fontWeight: 500 }}>{chunks}</b>
        ),
        gutter: <Gutter size="0.625rem" />,
        link: links
          ? (...chunks: React.ReactNode[]) => {
              const flattenedChunks: React.ReactNode[] = [];

              for (const chunk of chunks) {
                if (Array.isArray(chunk)) {
                  flattenedChunks.push(...chunk);
                } else {
                  flattenedChunks.push(chunk);
                }
              }

              const linkText = flattenedChunks
                .filter(
                  (chunk): chunk is string | number =>
                    typeof chunk === "string" || typeof chunk === "number"
                )
                .map((chunk) => String(chunk))
                .join("")
                .trim();

              const url = links[linkText];

              if (url) {
                return (
                  <Styles.Link
                    onClick={(e) => {
                      e.preventDefault();

                      browser.tabs.create({ url });
                    }}
                  >
                    {chunks}
                  </Styles.Link>
                );
              }

              return <React.Fragment>{chunks}</React.Fragment>;
            }
          : undefined,
      }}
    />
  );
};
