export const processHyperlinks = (inputText: string) => {
  const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const urlRegex = /(<a\s+(?:[^>]*?\s+)?href=(['"])(?:[^'"]*?)\2[^>]*?>.*?<\/a>)|((https?:\/\/[^\s]+)|(?<!\w)(www\.[^\s]+))/g;
  const processedText = inputText
    .replace(
      urlRegex,
      (
        _match: any,
        anchorTag: string,
        _quote: any,
        url: any,
        plainUrl: any
      ) => {
        if (anchorTag) {
          if (anchorTag.includes("target=")) {
            return anchorTag;
          } else {
            return anchorTag.replace("<a", '<a target="_blank"');
          }
        } else {
          const href = url
            ? url.startsWith("http")
              ? url
              : `https://${url}`
            : `https://${plainUrl}`;
          return `<a href="${href}" target="_blank">${url}</a>`;
        }
      }
    )
    .replace(scriptRegex, "<i>Script Not Allowed</i><br />");

  return processedText;
};
