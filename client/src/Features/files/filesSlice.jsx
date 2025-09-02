import { createSlice } from "@reduxjs/toolkit"
import { apiGet, apiPostForm } from "../../lib/apiClient"

const initialState = {
  items: [],
  status: "idle",          // "idle" | "loading" | "ready" | "error"
  errorMessage: null,
}

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setFilesStatus(state, action) { state.status = action.payload },
    setFilesError(state, action) { state.errorMessage = action.payload },
    setFiles(state, action) { state.items = action.payload || [] },
    addFiles(state, action) { (action.payload || []).forEach(it => state.items.unshift(it)) },
    clearFiles(state) { state.items = [] },
  },
})

export const { setFilesStatus, setFilesError, setFiles, addFiles, clearFiles } = filesSlice.actions
export default filesSlice.reducer

// async: list
export function fetchFiles({ page = 1, limit = 20 } = {}) {
  return async function (dispatch) {
    dispatch(setFilesStatus("loading")); dispatch(setFilesError(null))
    try {
        const data = await apiGet(`/api/files?page=${page}&limit=${limit}`)
      dispatch(setFiles(data.items || []))
      dispatch(setFilesStatus("ready"))
    } catch (err) {
      dispatch(setFilesStatus("error")); dispatch(setFilesError(err.message))
    }
  }
}

// async: upload multiple
export function uploadFiles({ fileList }) {
  return async function (dispatch) {
    dispatch(setFilesStatus("loading")); dispatch(setFilesError(null))
    try {
      const fd = new FormData()
      Array.from(fileList).forEach(f => fd.append("files", f)) // field name must be "files"
      const data = await apiPostForm(`/api/files`, fd)
      dispatch(addFiles(data.items || []))
      dispatch(setFilesStatus("ready"))
    } catch (err) {
      dispatch(setFilesStatus("error")); dispatch(setFilesError(err.message))
    }
  }
}

// selectors
export const selectFiles        = (s) => s.files.items
export const selectFilesStatus  = (s) => s.files.status
export const selectFilesError   = (s) => s.files.errorMessage