import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "./Navbar";
import Header from "./Header";
import Categories from "./Categories";
import LatestJobs from "./LatestJobs";
import Footer from "./Footer";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { loading, error } = useGetAllJobs(); // Trigger data fetch
  const jobs = useSelector((state) => state.jobs.allJobs); // Access Redux state

  console.log("Jobs in Component:", { loading, error, jobs }); // Log to check state
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "Recruiter") {
      navigate("/recruiter/companies");
    } else if (user?.role === "Admin") {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  return (
    <div>
      <Navbar />
      <main id="main-content">
        <Header />
        <Categories />
        {loading && (
          <div className="flex justify-center my-8" aria-live="polite">
            <p className="text-gray-500">Loading jobs...</p>
          </div>
        )}
        {error && (
          <div className="flex justify-center my-8" role="alert">
            <p className="text-red-500">Error: {error}</p>
          </div>
        )}
        {!loading && !error && <LatestJobs jobs={jobs} />}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
