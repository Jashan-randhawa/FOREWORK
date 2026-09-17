import React, { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from "./components/components_lite/ErrorBoundary";
import BottomTabBar from "./components/components_lite/BottomTabBar";

const Home = lazy(() => import("./components/components_lite/Home"));
const Login = lazy(() => import("./components/authentication/Login"));
const Register = lazy(() => import("./components/authentication/Register"));
const ForgotPassword = lazy(() => import("./components/authentication/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/authentication/ResetPassword"));
const VerifyEmail = lazy(() => import("./components/authentication/VerifyEmail"));
const PrivacyPolicy = lazy(() => import("./components/components_lite/PrivacyPolicy.jsx"));
const TermsofService = lazy(() => import("./components/components_lite/TermsofService.jsx"));
const Jobs = lazy(() => import("./components/components_lite/Jobs.jsx"));
const Browse = lazy(() => import("./components/components_lite/Browse.jsx"));
const SavedJobs = lazy(() => import("./components/components_lite/SavedJobs.jsx"));
const JobAlerts = lazy(() => import("./components/components_lite/JobAlerts.jsx"));
const Profile = lazy(() => import("./components/components_lite/Profile.jsx"));
const ApplicationsPage = lazy(() => import("./components/components_lite/ApplicationsPage.jsx"));
const Description = lazy(() => import("./components/components_lite/Description.jsx"));
const RecruiterDashboard = lazy(() => import("./components/admincomponent/RecruiterDashboard"));
const Companies = lazy(() => import("./components/admincomponent/Companies"));
const CompanyCreate = lazy(() => import("./components/admincomponent/CompanyCreate"));
const CompanySetup = lazy(() => import("./components/admincomponent/CompanySetup"));
const AdminJobs = lazy(() => import("./components/admincomponent/AdminJobs.jsx"));
const PostJob = lazy(() => import("./components/admincomponent/PostJob"));
const Applicants = lazy(() => import("./components/admincomponent/Applicants"));
const ProtectedRoute = lazy(() => import("./components/admincomponent/ProtectedRoute"));
const Creator = lazy(() => import("./components/creator/Creator.jsx"));
const SuspendedAccount = lazy(() => import("./components/components_lite/SuspendedAccount.jsx"));
const NotificationsPage = lazy(() => import("./components/components_lite/NotificationsPage.jsx"));

// Platform Admin components (ADMIN-004)
const AdminRoute = lazy(() => import("./components/admin/AdminRoute"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./components/admin/AdminUsers"));
const AdminPlatformJobs = lazy(() => import("./components/admin/AdminJobs"));
const AdminCompanies = lazy(() => import("./components/admin/AdminCompanies"));
const AdminAuditLogs = lazy(() => import("./components/admin/AdminAuditLogs"));

/**
 * Root layout that wraps all routes with bottom tab bar padding and the bar itself.
 */
function RootLayout() {
  return (
    <>
      <div className="pb-16 md:pb-0">
        <Outlet />
      </div>
      <BottomTabBar />
    </>
  );
}

const appRouter = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/verify-email", element: <VerifyEmail /> },
      { path: "/description/:id", element: <Description /> },
      { path: "/Profile", element: <Profile /> },
      { path: "/applications", element: <ApplicationsPage /> },
      { path: "/saved-jobs", element: <SavedJobs /> },
      { path: "/job-alerts", element: <JobAlerts /> },
      { path: "/suspended", element: <SuspendedAccount /> },
      { path: "/notifications", element: <NotificationsPage /> },
      { path: "/PrivacyPolicy", element: <PrivacyPolicy /> },
      { path: "/TermsofService", element: <TermsofService /> },
      { path: "/Jobs", element: <Jobs /> },
      { path: "/Home", element: <Home /> },
      { path: "/Browse", element: <Browse /> },
      { path: "/Creator", element: <Creator /> },
      { path: "/about", element: <Creator /> },

      // Recruiter route tree (/recruiter/*)
      {
        path: "/recruiter",
        element: (
          <ProtectedRoute>
            <RecruiterDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/recruiter/dashboard",
        element: (
          <ProtectedRoute>
            <RecruiterDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/recruiter/companies",
        element: (
          <ProtectedRoute>
            <Companies />
          </ProtectedRoute>
        ),
      },
      {
        path: "/recruiter/companies/create",
        element: (
          <ProtectedRoute>
            <CompanyCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: "/recruiter/companies/:id",
        element: (
          <ProtectedRoute>
            <CompanySetup />
          </ProtectedRoute>
        ),
      },
      {
        path: "/recruiter/jobs",
        element: (
          <ProtectedRoute>
            <AdminJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/recruiter/jobs/create",
        element: (
          <ProtectedRoute>
            <PostJob />
          </ProtectedRoute>
        ),
      },
      {
        path: "/recruiter/jobs/:id/applicants",
        element: (
          <ProtectedRoute>
            <Applicants />
          </ProtectedRoute>
        ),
      },

      // Platform Admin route tree (/admin/*) (ADMIN-004)
      {
        path: "/admin",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/dashboard",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/jobs",
        element: (
          <AdminRoute>
            <AdminPlatformJobs />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/companies",
        element: (
          <AdminRoute>
            <AdminCompanies />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/audit-logs",
        element: (
          <AdminRoute>
            <AdminAuditLogs />
          </AdminRoute>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <div>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <RouterProvider router={appRouter}></RouterProvider>
        </Suspense>
        <Analytics />
      </div>
    </ErrorBoundary>
  );
}

export default App;

