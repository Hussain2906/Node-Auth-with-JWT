import { createSlice } from "@reduxjs/toolkit";
import {apiGet, apiPostJson} from "../../lib/apiClient";

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


export function signupWithEmailPassword ({ emailValue, passwordValue }) {
  return async function (dispatch){
    dispatch(setStatus("loading")); dispatch(setErrorMessage(null));
    try {
      const data = await apiPostJson("/signup", { email: emailValue, password: passwordValue });
      dispatch(setUser(data.user)); dispatch(setStatus("loggedIn"));
    } catch (err) {
      dispatch(setStatus("error")); dispatch(setErrorMessage(err.message));
    }
  }
}

export function loginWithEmailPassword ({ emailValue, passwordValue }) {
  return async function (dispatch){
    dispatch(setStatus("loading"));
    dispatch(setErrorMessage(null));
    try {
      const data = await apiPostJson('/login', {email: emailValue, password:passwordValue})
      dispatch(setUser(data.user)); dispatch(setStatus("loggedIn"));
    } catch (err) {
      dispatch(setStatus("error")); dispatch(setErrorMessage(err.message));
    }
  }
}

export function checkExistingSession() {
  return async function (dispatch){
    dispatch(setStatus("loading"));
    try {
      const data = await apiGet("/me");
      dispatch(setUser(data.user)); dispatch(setStatus("loggedIn"));
    } catch {
      dispatch(clearAllAuth()); // loggedOut
    }
  }
}

export function logoutUser() {
  return async function (dispatch) {
    try {
      await apiPostJson("/logout", {});
    } catch (err) {
      console.warn("logout failed (ignored):", err.message);
    }
    dispatch(clearAllAuth());
  };
}

export const selectAuthUser        = (s) => s.auth.user;
export const selectAuthStatus      = (s) => s.auth.status;
export const selectAuthError       = (s) => s.auth.errorMessage;
export const selectIsLoggedIn      = (s) => s.auth.status === "loggedIn";