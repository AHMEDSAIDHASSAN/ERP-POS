import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./UserSlice";

const store = configureStore({
  reducer: {
    user: UserSlice, // add your slices here
  },
});
export default store;
