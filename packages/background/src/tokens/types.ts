export function getSecret20ViewingKeyPermissionType(contractAddress: string) {
  return `viewing-key/${contractAddress}`;
}

export function isSecret20ViewingKeyPermissionType(type: string) {
  return type.startsWith("viewing-key/");
}

export function splitSecret20ViewingKeyPermissionType(type: string) {
  return type.replace("viewing-key/", "");
}
