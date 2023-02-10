import { GroupDetails, GroupMembers, NewGroupDetails } from "@chatTypes";
import { createSlice } from "@reduxjs/toolkit";

const initialState: NewGroupDetails = {
  isEditGroup: false,
  group: {
    contents: "",
    description: "",
    groupId: "",
    members: [] as GroupMembers[],
    name: "",
    onlyAdminMessages: false,
  } as GroupDetails,
};

export const newGroupSlice = createSlice({
  name: "newGroup",
  initialState: initialState,
  reducers: {
    resetNewGroup: () => initialState,
    setNewGroupInfo: (state, action) => {
      state.group = { ...state.group, ...action.payload };
    },
    setIsGroupEdit: (state, action) => {
      state.isEditGroup = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  resetNewGroup,
  setNewGroupInfo,
  setIsGroupEdit,
} = newGroupSlice.actions;

export const newGroupDetails = (state: { newGroup: any }) => state.newGroup;

export const newGroupStore = newGroupSlice.reducer;
