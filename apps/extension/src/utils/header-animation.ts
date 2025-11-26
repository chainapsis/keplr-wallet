export const HEADER_ANIMATION_QUERY_KEY = "headerAnimTrigger";
export const HEADER_ANIMATION_QUERY_VALUE_SHOW = "show";
export const HEADER_ANIMATION_QUERY_VALUE_HIDE = "hide";

export const appendHeaderAnimationTriggerParam = (
  path: string,
  type: "show" | "hide" = "show"
): string => {
  const separator = path.includes("?") ? "&" : "?";

  if (type === "show") {
    return `${path}${separator}headerAnimTrigger=${HEADER_ANIMATION_QUERY_VALUE_SHOW}`;
  }

  if (type === "hide") {
    return `${path}${separator}headerAnimTrigger=${HEADER_ANIMATION_QUERY_VALUE_HIDE}`;
  }

  return path;
};
