import React, { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const Home = lazy(() => import("./components/components_lite/Home"));
const Login = lazy(() => import("./components/authentication/Login"));
const Register = lazy(() => import("./components/authentication/Register"));
const PrivacyPolicy = lazy(() => import("./components/components_lite/PrivacyPolicy.jsx"));
const TermsofService = lazy(() => import("./components/components_lite/TermsofService.jsx"));
const Jobs = lazy(() => import("./components/components_lite/Jobs.jsx"));
const Browse = lazy(() => import("./components/components_lite/Browse.jsx"));
const Profile = lazy(() => import("./components/components_lite/Profile.jsx"));
const Description = lazy(() => import("./components/components_lite/Description.jsx"));
const Companies = lazy(() => import("./components/admincomponent/Companies"));
const CompanyCreate = lazy(() => import("./components/admincomponent/CompanyCreate"));
const CompanySetup = lazy(() => import("./components/admincomponent/CompanySetup"));
const AdminJobs = lazy(() => import("./components/admincomponent/AdminJobs.jsx"));
const PostJob = lazy(() => import("./components/admincomponent/PostJob"));
const Applicants = lazy(() => import("./components/admincomponent/Applicants"));
const ProtectedRoute = lazy(() => import("./components/admincomponent/ProtectedRoute"));
const Creator = lazy(() => import("./components/creator/Creator.jsx"));

const appRouter = createBrowserRouter([
  { path: "/", element: <Home /> },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/description/:id",
    element: <Description />,
  },
  {
    path: "/Profile",
    element: <Profile />,
  },
  {
    path: "/PrivacyPolicy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/TermsofService",
    element: <TermsofService />,
  },
  {
    path: "/Jobs",
    element: <Jobs />,
  },
  {
    path: "/Home",
    element: <Home />,
  },
  {
    path: "/Browse",
    element: <Browse />,
  },
  {
    path:"/Creator",
    element: <Creator/>
  },

  // /admin
  {
    path: "/admin/companies",
    element: (
      <ProtectedRoute>
        <Companies />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/create",
    element: (
      <ProtectedRoute>
        <CompanyCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/:id",
    element: (
      <ProtectedRoute>
        <CompanySetup />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs",
    element: (
      <ProtectedRoute>
        {" "}
        <AdminJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/create",
    element: (
      <ProtectedRoute>
        {" "}
        <PostJob />{" "}
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: (
      <ProtectedRoute>
        <Applicants />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <div>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <RouterProvider router={appRouter}></RouterProvider>
      </Suspense>
    </div>
  );
}

export default App;
