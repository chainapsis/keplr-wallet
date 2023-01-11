import React, { FunctionComponent } from "react";
import RenderHtml, { CustomBlockRenderer } from "react-native-render-html";
import { useStyle } from "../../../styles";

export const MemoizedHtmlRender: FunctionComponent<{
  html: string;
  contentWidth: number;
  // eslint-disable-next-line react/display-name
}> = React.memo<{
  html: string;
  contentWidth: number;
}>(({ html, contentWidth }) => {
  const style = useStyle();

  return (
    <RenderHtml
      source={{
        html,
      }}
      contentWidth={contentWidth}
      // XXX: Comments on `RenderHtml` component recommend us not to use `StyleSheet`.
      //      However, style builder itself uses `StyleSheet`.
      //      I don't know how this affect in detail.
      //      Anyway, there is no problem yet.
      baseStyle={style.flatten([
        "body3",
        "color-text-middle",
        "dark:color-platinum-100",
        "margin-0",
      ])}
      // XXX: Text selection is only supported well in android.
      //      On ios, it works as chunk.
      //      It is limitation of react-native itself.
      defaultTextProps={{ selectable: true }}
      renderers={{
        p: ParagraphRenderer,
      }}
      tagsStyles={{
        h1: style.flatten(["h2", "margin-top-8", "margin-bottom-4"]),
        h2: style.flatten(["h3", "margin-top-8", "margin-bottom-4"]),
        h3: style.flatten(["h4", "margin-top-8", "margin-bottom-4"]),
        h4: style.flatten(["h5", "margin-top-8", "margin-bottom-4"]),
        h5: style.flatten(["h6", "margin-top-8", "margin-bottom-4"]),
        h6: style.flatten(["h7", "margin-top-8", "margin-bottom-4"]),
        p: style.flatten(["margin-top-4", "margin-bottom-4"]),
        ul: style.flatten(["margin-top-4", "margin-bottom-4"]),
        li: style.flatten(["margin-bottom-4"]),
        strong: style.flatten(["color-text-high", "dark:color-platinum-50"]),
        a: {
          ...style.flatten(["color-platinum-600", "dark:color-platinum-50"]),
          ...{
            // TODO: Add text decoration color support to style builder?
            textDecorationColor: style.flatten([
              "color-platinum-600",
              "dark:color-platinum-50",
            ]).color,
          },
        },
      }}
    />
  );
});

// https://meliorence.github.io/react-native-render-html/blog/2021/06/29/create-blog-app-rnrh-III#fixing-paragraphs-in-li-elements
export const ParagraphRenderer: CustomBlockRenderer = function ParagraphRenderer({
  TDefaultRenderer,
  tnode,
  ...props
}) {
  const marginsFix =
    tnode.markers.olNestLevel > -1 || tnode.markers.ulNestLevel > -1
      ? { marginTop: 0, marginBottom: 0 }
      : null;
  return (
    <TDefaultRenderer
      {...props}
      tnode={tnode}
      style={[props.style, marginsFix]}
    />
  );
};
