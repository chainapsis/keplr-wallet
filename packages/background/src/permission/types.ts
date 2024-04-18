export const INTERACTION_TYPE_PERMISSION = "permission";
export const INTERACTION_TYPE_GLOBAL_PERMISSION = "global_permission";
export const INTERACTION_TYPE_EVM_PERMISSION = "evm_permission";

export function getBasicAccessPermissionType() {
  return "basic-access";
}

export function isBasicAccessPermissionType(type: string) {
  return type === getBasicAccessPermissionType();
}

export function getEVMAccessPermissionType() {
  return "evm-access";
}

export interface PermissionData {
  chainIds: string[];
  type: string;
  origins: string[];
}

export interface GlobalPermissionData {
  type: string;
  origins: string[];
}

export interface EVMPermissionData {
  type: string;
  origins: string[];
}

export interface AllPermissionDataPerOrigin {
  [origin: string]:
    | {
        permissions: { chainIdentifier: string; type: string }[];
        globalPermissions: { type: string }[];
        evmPermissions: { type: string }[];
      }
    | undefined;
}
