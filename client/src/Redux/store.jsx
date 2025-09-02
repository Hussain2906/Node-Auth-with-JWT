import { configureStore } from '@reduxjs/toolkit'
import filesReducer from "../Features/files/filesSlice";
import authReducer from "../Features/auth/AuthSlice";

const store = configureStore({
  reducer: {
    files: filesReducer,
    auth:  authReducer,
  },
})

export default store