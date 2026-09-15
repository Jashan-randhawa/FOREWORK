import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import jobReducer, { setFilter, setSearchedQuery, clearFilters } from "../redux/jobSlice";
import useFilterUrlSync from "../hooks/useFilterUrlSync";

const TestComponent = () => {
  useFilterUrlSync();
  const [searchParams] = useSearchParams();
  const { filters, searchedQuery } = useSelector((store) => store.job);
  const dispatch = useDispatch();

  return (
    <div>
      <div data-testid="url-location">{searchParams.get("location") || ""}</div>
      <div data-testid="url-keyword">{searchParams.get("keyword") || ""}</div>
      <div data-testid="redux-location">{filters?.location || ""}</div>
      <div data-testid="redux-keyword">{searchedQuery || ""}</div>
      <button
        onClick={() => dispatch(setFilter({ key: "location", value: "Bangalore" }))}
      >
        Set Redux Location
      </button>
      <button onClick={() => dispatch(setSearchedQuery("React"))}>
        Set Redux Keyword
      </button>
      <button onClick={() => dispatch(clearFilters())}>Clear Filters</button>
    </div>
  );
};

const renderWithProviders = (initialEntries = ["/"]) => {
  const store = configureStore({
    reducer: {
      job: jobReducer,
    },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <TestComponent />
        </MemoryRouter>
      </Provider>
    ),
  };
};

describe("useFilterUrlSync hook", () => {
  it("restores filters and keyword from URL search parameters on mount", async () => {
    renderWithProviders(["/jobs?location=Delhi&keyword=Node"]);

    await waitFor(() => {
      expect(screen.getByTestId("redux-location")).toHaveTextContent("Delhi");
      expect(screen.getByTestId("redux-keyword")).toHaveTextContent("Node");
      expect(screen.getByTestId("url-location")).toHaveTextContent("Delhi");
      expect(screen.getByTestId("url-keyword")).toHaveTextContent("Node");
    });
  });

  it("updates URL search parameters when Redux filters change", async () => {
    renderWithProviders(["/jobs"]);

    await act(async () => {
      screen.getByText("Set Redux Location").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("redux-location")).toHaveTextContent("Bangalore");
      expect(screen.getByTestId("url-location")).toHaveTextContent("Bangalore");
    });
  });

  it("updates URL search parameters when Redux searchedQuery changes", async () => {
    renderWithProviders(["/jobs"]);

    await act(async () => {
      screen.getByText("Set Redux Keyword").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("redux-keyword")).toHaveTextContent("React");
      expect(screen.getByTestId("url-keyword")).toHaveTextContent("React");
    });
  });

  it("clears URL search parameters when filters are cleared", async () => {
    renderWithProviders(["/jobs"]);

    await act(async () => {
      screen.getByText("Set Redux Location").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("redux-location")).toHaveTextContent("Bangalore");
    });

    await act(async () => {
      screen.getByText("Clear Filters").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("redux-location")).toHaveTextContent("");
      expect(screen.getByTestId("url-location")).toHaveTextContent("");
    });
  });
});
