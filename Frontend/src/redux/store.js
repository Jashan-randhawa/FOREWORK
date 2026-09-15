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
import storage from "redux-persist/lib/storage";

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
