import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { LogOut, User2, Bookmark, BellRing } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import API from "@/utils/axiosInstance";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT } from "@/utils/data";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logoutHandler = async () => {
    try {
      const res = await API.post(`${USER_API_ENDPOINT}/logout`);
      if (res && res.data && res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      } else {
        console.error("Error logging out:", res.data);
      }
    } catch (error) {
      console.error("Axios error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      toast.error("Error logging out. Please try again.");
    }
  };
  return (
    <div className="bg-white">
      {/* A11Y Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#6B3AC2] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold">
            <Link to="/" aria-label="ForeWork Home">
              <span className="text-[#6B3AC2]"> ForeWork </span>
            </Link>
          </h1>
        </div>
        <div className="flex items-center gap-10">
          <ul className="flex font-medium items-center gap-6">
            {user && user.role === "Admin" ? (
              <>
                <li>
                  <Link to={"/admin/dashboard"} className="text-red-600 font-semibold hover:text-red-700">
                    Admin Portal
                  </Link>
                </li>
                <li>
                  <Link to={"/admin/users"}>Users</Link>
                </li>
                <li>
                  <Link to={"/admin/jobs"}>Jobs</Link>
                </li>
                <li>
                  <Link to={"/admin/companies"}>Companies</Link>
                </li>
                <li>
                  <Link to={"/admin/audit-logs"}>Audit Logs</Link>
                </li>
              </>
            ) : user && user.role === "Recruiter" ? (
              <>
                <li>
                  <Link to={"/recruiter/companies"}>Companies</Link>
                </li>
                <li>
                  <Link to={"/recruiter/jobs"}>Jobs</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to={"/Home"}>Home</Link>
                </li>
                <li>
                  <Link to={"/Browse"}>Browse</Link>
                </li>
                <li>
                  <Link to={"/Jobs"}>Jobs</Link>
                </li>
                <li>
                  <Link to={"/Creator"}>About</Link>
                </li>
              </>
            )}
          </ul>
          {!user ? (
            <div className=" flex items-center gap-2">
              <Link to={"/login"}>
                <Button variant="outline">Login</Button>
              </Link>
              <Link to={"/register"}>
                <Button className="bg-[#6B3AC2] hover:bg-[#522998]">
                  Signup
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <Popover>
                <PopoverTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={user?.profile?.profilePhoto}
                      alt="@shadcn"
                    />
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="flex gap-4 space-y-2">
                    <Avatar className="cursor-pointer">
                      <AvatarImage
                        src={user?.profile?.profilePhoto}
                        alt="@shadcn"
                      />
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{user?.fullname}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user?.profile?.bio}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col my-2 text-gray-600  ">
                    {user && user.role === "Admin" && (
                      <div className="flex w-fit items-center gap-2 cursor-pointer text-red-600 font-semibold">
                        <Button variant="link" className="text-red-600 p-0">
                          <Link to={"/admin/dashboard"}>Admin Dashboard</Link>
                        </Button>
                      </div>
                    )}

                    {user && user.role === "Recruiter" && (
                      <>
                        <div className="flex w-fit items-center gap-2 cursor-pointer">
                          <Button variant="link" className="p-0">
                            <Link to={"/recruiter/companies"}>My Companies</Link>
                          </Button>
                        </div>
                        <div className="flex w-fit items-center gap-2 cursor-pointer">
                          <Button variant="link" className="p-0">
                            <Link to={"/recruiter/jobs"}>My Jobs</Link>
                          </Button>
                        </div>
                      </>
                    )}

                    {user && user.role === "Student" && (
                      <>
                        <div className="flex w-fit items-center gap-2 cursor-pointer">
                          <User2 />
                          <Button variant="link">
                            <Link to={"/Profile"}> Profile</Link>
                          </Button>
                        </div>
                        <div className="flex w-fit items-center gap-2 cursor-pointer">
                          <Bookmark className="w-4 h-4" />
                          <Button variant="link">
                            <Link to={"/saved-jobs"}> Saved Jobs</Link>
                          </Button>
                        </div>
                        <div className="flex w-fit items-center gap-2 cursor-pointer">
                          <BellRing className="w-4 h-4" />
                          <Button variant="link">
                            <Link to={"/job-alerts"}> Job Alerts</Link>
                          </Button>
                        </div>
                      </>
                    )}

                    <div className="flex w-fit items-center gap-2 cursor-pointer mt-2 pt-2 border-t">
                      <LogOut></LogOut>
                      <Button onClick={logoutHandler} variant="link" className="p-0">
                        Logout
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
