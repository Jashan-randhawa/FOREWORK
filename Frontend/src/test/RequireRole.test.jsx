import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { RequireRole } from "../components/auth/RequireRole";

const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: (state = initialState.auth || { user: null, loading: false }) => state,
      _persist: (state = initialState._persist || { rehydrated: true }) => state,
    },
    preloadedState: initialState,
  });
};

describe("RequireRole Component", () => {
  it("renders loader during Redux rehydration", () => {
    const store = createMockStore({
      auth: { user: null, loading: false },
      _persist: { rehydrated: false },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <RequireRole allowedRoles={["Student"]}>
            <div>Protected Content</div>
          </RequireRole>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Verifying session.../i)).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders loader during auth loading state", () => {
    const store = createMockStore({
      auth: { user: null, loading: true },
      _persist: { rehydrated: true },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <RequireRole allowedRoles={["Student"]}>
            <div>Protected Content</div>
          </RequireRole>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Verifying session.../i)).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated user to login preserving returnPath", () => {
    const store = createMockStore({
      auth: { user: null, loading: false },
      _persist: { rehydrated: true },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route
              path="/profile"
              element={
                <RequireRole allowedRoles={["Student"]}>
                  <div>Protected Profile</div>
                </RequireRole>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Profile")).not.toBeInTheDocument();
  });

  it("renders suspended screen when user is suspended", () => {
    const store = createMockStore({
      auth: {
        user: { _id: "u1", fullname: "John", role: "Student", isSuspended: true },
        loading: false,
      },
      _persist: { rehydrated: true },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <RequireRole allowedRoles={["Student"]}>
            <div>Protected Content</div>
          </RequireRole>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Account Suspended/i)).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("shows Access Denied when user does not have required role", () => {
    const store = createMockStore({
      auth: {
        user: { _id: "u1", fullname: "Student John", role: "Student" },
        loading: false,
      },
      _persist: { rehydrated: true },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <RequireRole allowedRoles={["Recruiter", "Admin"]}>
            <div>Recruiter Dashboard</div>
          </RequireRole>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Recruiter Dashboard")).not.toBeInTheDocument();
  });

  it("renders protected children when role is authorized", () => {
    const store = createMockStore({
      auth: {
        user: { _id: "u1", fullname: "Recruiter Bob", role: "Recruiter" },
        loading: false,
      },
      _persist: { rehydrated: true },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <RequireRole allowedRoles={["Recruiter"]}>
            <div>Recruiter Dashboard</div>
          </RequireRole>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Recruiter Dashboard")).toBeInTheDocument();
  });
});
