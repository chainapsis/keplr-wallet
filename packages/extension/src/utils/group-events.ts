export interface GroupEvent {
  action: string;
  createdBy?: string;
  performedOn?: string;
  message: string;
  createdAt?: Date;
}

export const createEvent = (eventContent: GroupEvent) => {
  return JSON.stringify(eventContent);
};

export const leaveGroupEvent = (memberAddress: string) => {
  return createEvent({
    action: "LEAVE",
    createdBy: memberAddress,
    message: "[createdBy] left the group chat",
    createdAt: new Date(),
  });
};

export const addMemberEvent = (adminAddress: string, memberAddress: string) => {
  return createEvent({
    action: "ADD",
    createdBy: adminAddress,
    performedOn: memberAddress,
    message: "[createdBy] added [performedOn]",
    createdAt: new Date(),
  });
};

export const updateInfoEvent = (adminAddress: string) => {
  return createEvent({
    action: "UPDATE",
    createdBy: adminAddress,
    message: "Group info updated by [createdBy]",
    createdAt: new Date(),
  });
};

export const createGroupEvent = (adminAddress: string) => {
  return createEvent({
    action: "CREATE",
    createdBy: adminAddress,
    message: "Group created by [createdBy]",
    createdAt: new Date(),
  });
};

export const removeMemberEvent = (memberAddress: string) => {
  return createEvent({
    action: "REMOVE",
    performedOn: memberAddress,
    message: "[performedOn] has been removed.",
    createdAt: new Date(),
  });
};

export const addAdminEvent = (memberAddress: string) => {
  return createEvent({
    action: "ADDADMIN",
    performedOn: memberAddress,
    message: "[performedOn] is now an admin.",
    createdAt: new Date(),
  });
};

export const removedAdminEvent = (memberAddress: string) => {
  return createEvent({
    action: "REMOVEADMIN",
    performedOn: memberAddress,
    message: "[performedOn] removed as admin.",
    createdAt: new Date(),
  });
};
