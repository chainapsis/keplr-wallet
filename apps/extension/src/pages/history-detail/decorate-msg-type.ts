export const decorateMsgType = (type: string): string => {
  let result = type;

  // Handle protobuf-style message types (e.g., /ibc.applications.transfer.v1.MsgTransfer)
  if (result.includes(".")) {
    const parts = result.split(".");
    result = parts[parts.length - 1]; // Get the last part (e.g., MsgTransfer)
  }

  // Remove "Msg" prefix if it exists
  if (result.startsWith("Msg") && result.length > 3) {
    result = result.slice(3);
  }

  // Convert to Title Case with spaces
  // Handle consecutive uppercase letters as acronyms and split properly
  const words = result
    .split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|[-_\s\/]+/)
    .filter((word) => word.length > 0)
    .map((word) => {
      // Keep acronyms in uppercase, capitalize other words
      if (word.match(/^[A-Z]+$/)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

  return words.join(" ");
};
