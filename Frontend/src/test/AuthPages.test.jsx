import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/authSlice";
import { ThemeProvider } from "@/context/ThemeContext";
import Login from "../components/authentication/Login";
import Register from "../components/authentication/Register";
import AuthHeroPanel from "../components/authentication/AuthHeroPanel";
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

function renderWithProviders(ui, { preloadedState = { auth: { user: null, loading: false } } } = {}) {
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
          <MemoryRouter>{ui}</MemoryRouter>
        </ThemeProvider>
      </Provider>
    ),
  };
}

describe("AuthHeroPanel", () => {
  it("renders brand elements and metric cards for login mode", () => {
    render(
      <MemoryRouter>
        <AuthHeroPanel mode="login" />
      </MemoryRouter>
    );

    expect(screen.getByText("FORE")).toBeInTheDocument();
    expect(screen.getByText("PORTAL")).toBeInTheDocument();
    expect(screen.getByText("Talent Cloud Active")).toBeInTheDocument();
    expect(screen.getByText(/Every role discovered/i)).toBeInTheDocument();
    expect(screen.getByText("Sub-minute")).toBeInTheDocument();
    expect(screen.getByText("RBAC + JWT")).toBeInTheDocument();
    expect(screen.getByText("Real-Time")).toBeInTheDocument();
    expect(screen.getByText("FOREWORK")).toBeInTheDocument();
  });

  it("renders register mode specific headline and copy", () => {
    render(
      <MemoryRouter>
        <AuthHeroPanel mode="register" />
      </MemoryRouter>
    );

    expect(screen.getByText(/Shape your future with world-class employers/i)).toBeInTheDocument();
    expect(screen.getByText(/Join The Top 1% Engineering Network/i)).toBeInTheDocument();
  });
});

describe("Redesigned Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the split-screen layout with form header, role pills, and input fields", () => {
    renderWithProviders(<Login />);

    expect(screen.getByText("Authentication Gateway")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Candidate/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Recruiter/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In to FOREWORK/i })).toBeInTheDocument();
  });

  it("toggles password visibility when the eye button is clicked", () => {
    renderWithProviders(<Login />);

    const passwordInput = screen.getByLabelText(/^Password/i);
    const toggleButton = screen.getByLabelText(/Show password/i);

    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByLabelText(/Hide password/i)).toBeInTheDocument();
  });

  it("toggles active role selection between Candidate and Recruiter", () => {
    renderWithProviders(<Login />);

    const candidateBtn = screen.getByRole("radio", { name: /Candidate/i });
    const recruiterBtn = screen.getByRole("radio", { name: /Recruiter/i });

    expect(candidateBtn).toHaveAttribute("aria-checked", "true");
    expect(recruiterBtn).toHaveAttribute("aria-checked", "false");

    fireEvent.click(recruiterBtn);
    expect(recruiterBtn).toHaveAttribute("aria-checked", "true");
    expect(candidateBtn).toHaveAttribute("aria-checked", "false");
  });

  it("fills demo credentials using quick preset buttons", () => {
    renderWithProviders(<Login />);

    const fillCandidateBtn = screen.getByRole("button", { name: "Candidate" });
    fireEvent.click(fillCandidateBtn);

    expect(screen.getByLabelText(/Email Address/i)).toHaveValue("candidate@example.com");
    expect(screen.getByLabelText(/^Password/i)).toHaveValue("password123");
  });

  it("submits the login form with valid credentials", async () => {
    API.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Welcome back!",
        user: { _id: "123", fullname: "Test User", role: "Student" },
      },
    });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "mypassword" },
    });

    const submitBtn = screen.getByRole("button", { name: /Sign In to FOREWORK/i });
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

describe("Redesigned Register Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window.URL.createObjectURL === "undefined") {
      window.URL.createObjectURL = vi.fn(() => "blob:mock-image-preview");
      window.URL.revokeObjectURL = vi.fn();
    }
  });

  it("renders the onboarding form with 2-column fields and role switch", () => {
    renderWithProviders(<Register />);

    expect(screen.getByText("Candidate & Recruiter Onboarding")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PAN Card Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Aadhaar Card Number/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Complete Registration/i })).toBeInTheDocument();
  });

  it("handles profile photo selection and removal", () => {
    renderWithProviders(<Register />);

    const file = new File(["dummy content"], "avatar.png", { type: "image/png" });
    const fileInput = screen.getByLabelText(/Click to upload/i);

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText("avatar.png")).toBeInTheDocument();

    const removeBtn = screen.getByTitle("Remove selected file");
    fireEvent.click(removeBtn);

    expect(screen.queryByText("avatar.png")).not.toBeInTheDocument();
  });

  it("submits register form data with FormData", async () => {
    API.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Account registered!",
      },
    });

    renderWithProviders(<Register />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "secret123" } });
    fireEvent.change(screen.getByLabelText(/PAN Card Number/i), { target: { value: "ABCDE1234F" } });
    fireEvent.change(screen.getByLabelText(/Aadhaar Card Number/i), { target: { value: "123456789012" } });

    const submitBtn = screen.getByRole("button", { name: /Complete Registration/i });
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
