import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import jobReducer from "./jobSlice";
import companyReducer from "./companyslice";
import applicationSlice from "./applicationSlice";

import {
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
// Safe localStorage engine for redux-persist that avoids Vite CJS/ESM interop issues
const createStorage = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return {
      getItem: () => Promise.resolve(null),
      setItem: (_key, value) => Promise.resolve(value),
      removeItem: () => Promise.resolve(),
    };
  }
  return {
    getItem: (key) => {
      try {
        return Promise.resolve(window.localStorage.getItem(key));
      } catch {
        return Promise.resolve(null);
      }
    },
    setItem: (key, value) => {
      try {
        return Promise.resolve(window.localStorage.setItem(key, value));
      } catch {
        return Promise.resolve();
      }
    },
    removeItem: (key) => {
      try {
        return Promise.resolve(window.localStorage.removeItem(key));
      } catch {
        return Promise.resolve();
      }
    },
  };
};

const storage = createStorage();

// Transform to strip sensitive identity numbers (PAN, Aadhaar) before saving auth to localStorage
const authTransform = createTransform(
  (inboundState) => {
    if (inboundState?.user) {
      const safeUser = { ...inboundState.user };
      delete safeUser.pancard;
      delete safeUser.adharcard;
      return {
        ...inboundState,
        user: safeUser,
      };
    }
    return inboundState;
  },
  (outboundState) => outboundState,
  { whitelist: ["auth"] }
);

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  transforms: [authTransform],
};

const rootReducer = combineReducers({
  auth: authReducer,
  job: jobReducer,
  jobs: jobReducer,
  company: companyReducer,
  application: applicationSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;
