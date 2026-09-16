import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/authSlice";
import { ThemeProvider } from "@/context/ThemeContext";
import Login from "../components/authentication/Login";
import Register from "../components/authentication/Register";
import Navbar from "../components/components_lite/Navbar";
import API from "@/utils/axiosInstance";

vi.mock("@/utils/axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderWithProviders(
  ui,
  {
    initialEntries = ["/"],
    preloadedState = { auth: { user: null, loading: false } },
  } = {}
) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
        </ThemeProvider>
      </Provider>
    ),
  };
}

describe("ForeWork Login Page (with Navbar)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Navbar, login card, inputs, role radio options, and submit button", () => {
    renderWithProviders(<Login />);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Candidate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recruiter/i)).toBeInTheDocument();
    const loginButtons = screen.getAllByRole("button", { name: "Login" });
    const submitBtn = loginButtons.find((btn) => btn.getAttribute("type") === "submit");
    expect(submitBtn).toBeInTheDocument();
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });

  it("toggles role radio between Candidate and Recruiter", () => {
    renderWithProviders(<Login />);

    const candidateRadio = screen.getByLabelText(/Candidate/i);
    const recruiterRadio = screen.getByLabelText(/Recruiter/i);

    expect(candidateRadio).toBeChecked();
    expect(recruiterRadio).not.toBeChecked();

    fireEvent.click(recruiterRadio);
    expect(recruiterRadio).toBeChecked();
    expect(candidateRadio).not.toBeChecked();
  });

  it("submits the login form with valid credentials", async () => {
    API.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Logged in successfully",
        user: { _id: "123", fullname: "Test User", role: "Student" },
      },
    });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "mypassword" },
    });

    const loginButtons = screen.getAllByRole("button", { name: "Login" });
    const submitBtn = loginButtons.find((btn) => btn.getAttribute("type") === "submit");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        expect.stringContaining("/login"),
        expect.objectContaining({
          email: "test@example.com",
          password: "mypassword",
          role: "Student",
        }),
        expect.any(Object)
      );
    });
  });
});

describe("ForeWork Register Page (with Navbar)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Navbar, register form, personal/identity fields, and submit button", () => {
    renderWithProviders(<Register />);

    expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PAN Card Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Aadhaar Card Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Candidate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recruiter/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
  });

  it("submits registration with FormData", async () => {
    API.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Account created!",
      },
    });

    renderWithProviders(<Register />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/PAN Card Number/i), { target: { value: "ABCDE1234F" } });
    fireEvent.change(screen.getByLabelText(/Aadhaar Card Number/i), { target: { value: "123456789012" } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: "9876543210" } });

    const submitBtn = screen.getByRole("button", { name: "Register" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        expect.stringContaining("/register"),
        expect.any(FormData),
        expect.objectContaining({
          headers: { "Content-Type": "multipart/form-data" },
        })
      );
    });
  });
});

describe("Global ThemeToggle in Navbar", () => {
  it("renders the global ThemeToggle in Navbar for unauthenticated and authenticated users", () => {
    renderWithProviders(<Navbar />);

    const themeToggleBtn = screen.getByRole("button", { name: /Switch to (dark|light) theme/i });
    expect(themeToggleBtn).toBeInTheDocument();

    renderWithProviders(<Navbar />, {
      preloadedState: {
        auth: {
          user: { _id: "1", fullname: "Alex Candidate", role: "Student" },
          loading: false,
        },
      },
    });

    expect(screen.getAllByRole("button", { name: /Switch to (dark|light) theme/i })[0]).toBeInTheDocument();
  });
});
