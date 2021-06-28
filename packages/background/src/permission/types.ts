export const INTERACTION_TYPE_PERMISSION = "permission";

export function getBasicAccessPermissionType() {
  return "basic-access";
}

export function isBasicAccessPermissionType(type: string) {
  return type === getBasicAccessPermissionType();
}

export interface PermissionData {
  chainIds: string[];
  type: string;
  origins: string[];
}
