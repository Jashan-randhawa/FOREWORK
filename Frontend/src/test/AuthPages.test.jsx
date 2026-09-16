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

describe("Hardened Login Page", () => {
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

  it("pre-selects role based on URL parameter (?role=recruiter)", () => {
    renderWithProviders(<Login />, { initialEntries: ["/login?role=recruiter"] });

    const recruiterBtn = screen.getByRole("radio", { name: /Recruiter/i });
    const candidateBtn = screen.getByRole("radio", { name: /Candidate/i });

    expect(recruiterBtn).toHaveAttribute("aria-checked", "true");
    expect(candidateBtn).toHaveAttribute("aria-checked", "false");
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

  it("displays inline validation error for invalid email format", () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);

    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
  });

  it("fills demo credentials using quick preset buttons", () => {
    renderWithProviders(<Login />);

    const fillCandidateBtn = screen.getByRole("button", { name: "Candidate" });
    fireEvent.click(fillCandidateBtn);

    expect(screen.getByLabelText(/Email Address/i)).toHaveValue("candidate@example.com");
    expect(screen.getByLabelText(/^Password/i)).toHaveValue("password123");
  });

  it("locks submissions for 30s after 5 consecutive failed attempts", async () => {
    API.post.mockRejectedValue(new Error("Invalid credentials"));

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "wrongpassword" },
    });

    const submitBtn = screen.getByRole("button", { name: /Sign In to FOREWORK/i });

    // Trigger 5 failed attempts
    for (let i = 0; i < 5; i++) {
      fireEvent.click(submitBtn);
      await waitFor(() => expect(API.post).toHaveBeenCalledTimes(i + 1));
    }

    // Now lockout should be active
    expect(screen.getByText("Account Login Throttled")).toBeInTheDocument();
    expect(screen.getByText(/Submissions temporarily locked/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Locked/i })).toBeDisabled();
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

describe("Hardened Register Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window.URL.createObjectURL === "undefined") {
      window.URL.createObjectURL = vi.fn(() => "blob:mock-image-preview");
      window.URL.revokeObjectURL = vi.fn();
    }
  });

  it("renders all form fields including confirm password and role selector", () => {
    renderWithProviders(<Register />);

    expect(screen.getByText("Candidate & Recruiter Onboarding")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PAN Card Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Aadhaar Card Number/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Complete Registration/i })).toBeInTheDocument();
  });

  it("calculates live password strength meter", () => {
    renderWithProviders(<Register />);

    const passwordInput = screen.getByLabelText(/^Password/i);

    // Weak password (< 8 chars)
    fireEvent.change(passwordInput, { target: { value: "abc" } });
    expect(screen.getByText("Too Short")).toBeInTheDocument();

    // Fair / Medium password (>=8 chars, lowercase + uppercase)
    fireEvent.change(passwordInput, { target: { value: "Password" } });
    expect(screen.getByText("Fair")).toBeInTheDocument();

    // Strong password (>=8 chars, uppercase, number, symbol)
    fireEvent.change(passwordInput, { target: { value: "P@ssw0rd123!" } });
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });

  it("validates confirm password mismatch", () => {
    renderWithProviders(<Register />);

    const passwordInput = screen.getByLabelText(/^Password/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);

    fireEvent.change(passwordInput, { target: { value: "P@ssw0rd123" } });
    fireEvent.change(confirmInput, { target: { value: "DifferentPassword" } });
    fireEvent.blur(confirmInput);

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    expect(confirmInput).toHaveAttribute("aria-invalid", "true");
  });

  it("auto-uppercases and validates PAN Card format", () => {
    renderWithProviders(<Register />);

    const panInput = screen.getByLabelText(/PAN Card Number/i);

    // Auto-uppercase
    fireEvent.change(panInput, { target: { value: "abcde1234f" } });
    expect(panInput).toHaveValue("ABCDE1234F");

    // Invalid format
    fireEvent.change(panInput, { target: { value: "12345" } });
    fireEvent.blur(panInput);
    expect(screen.getByText(/PAN format must be 5 letters, 4 digits, 1 letter/i)).toBeInTheDocument();
  });

  it("validates Aadhaar Card 12-digit numeric length", () => {
    renderWithProviders(<Register />);

    const aadhaarInput = screen.getByLabelText(/Aadhaar Card Number/i);

    // Typing non-numeric characters should be stripped
    fireEvent.change(aadhaarInput, { target: { value: "123abc456" } });
    expect(aadhaarInput).toHaveValue("123456");

    // Less than 12 digits triggers error on blur
    fireEvent.blur(aadhaarInput);
    expect(screen.getByText(/Aadhaar must be exactly 12 numeric digits/i)).toBeInTheDocument();
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

  it("submits register form data with FormData upon valid input", async () => {
    API.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Account registered!",
      },
    });

    renderWithProviders(<Register />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "P@ssw0rd123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "P@ssw0rd123" } });
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

describe("Global ThemeToggle in Navbar", () => {
  it("renders the global ThemeToggle in Navbar for unauthenticated and authenticated users", () => {
    renderWithProviders(<Navbar />);

    const themeToggleBtn = screen.getByRole("button", { name: /Switch to (dark|light) theme/i });
    expect(themeToggleBtn).toBeInTheDocument();

    // Authenticated state
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
