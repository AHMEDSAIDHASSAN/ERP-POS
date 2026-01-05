import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
  token: "",
  currentImage: "",
};
const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    updateUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.currentImage = "";
    },

    updateCurrentImage: (state, action) => {
      state.currentImage = action.payload;
    },
  },
});
export const { login, updateUser, updateCurrentImage } = UserSlice.actions;
export default UserSlice.reducer;
