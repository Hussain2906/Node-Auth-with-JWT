import { createSlice } from "@reduxjs/toolkit";

const authInitialState = {
  user: null,
  status: "idle",
  errorMessage: null,
};

export const authSlice = createSlice({
  name: "loginUser",
  initialState: authInitialState,
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setErrorMessage: (state, action) => {
      state.errorMessage = action.payload;
    },
    clearAllAuth(state) {
      state.user = null;
      state.status = "loggedOut";
      state.errorMessage = null;
    },
  },
});

export const { setStatus, setUser, setErrorMessage, clearAllAuth } = authSlice.actions;
export default authSlice.reducer;
