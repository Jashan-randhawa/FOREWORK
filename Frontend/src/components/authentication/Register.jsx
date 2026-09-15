import React, { useEffect, useState } from "react";
import Navbar from "../components_lite/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup } from "../ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import API from "@/utils/axiosInstance";
import { USER_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";

const Register = () => {
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "",
    phoneNumber: "",
    pancard: "",
    adharcard: "",
    file: "",
  });

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { loading } = useSelector((store) => store.auth);
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const ChangeFilehandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("password", input.password);
    formData.append("pancard", input.pancard);
    formData.append("adharcard", input.adharcard);
    formData.append("role", input.role);
    formData.append("phoneNumber", input.phoneNumber);
    if (input.file) {
      formData.append("file", input.file);
    }
    try {
      dispatch(setLoading(true));
      const res = await API.post(`${USER_API_ENDPOINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      const errorMessage = error.response
        ? error.response.data.message
        : "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const { user } = useSelector((store) => store.auth);
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);
  return (
    <div>
      <Navbar />
      <main id="main-content" className="flex items-center justify-center max-w-7xl mx-auto px-4">
        <form
          onSubmit={submitHandler}
          aria-labelledby="register-heading"
          className="w-full max-w-lg border border-gray-300 rounded-md p-6 my-10 shadow-sm bg-white"
        >
          <h1 id="register-heading" className="font-bold text-xl mb-5 text-center text-blue-600">
            Register
          </h1>
          <div className="my-3">
            <Label htmlFor="reg-fullname">Full Name</Label>
            <Input
              id="reg-fullname"
              type="text"
              value={input.fullname}
              name="fullname"
              autoComplete="name"
              required
              aria-required="true"
              onChange={changeEventHandler}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>
          <div className="my-3">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              value={input.email}
              name="email"
              autoComplete="email"
              required
              aria-required="true"
              onChange={changeEventHandler}
              placeholder="johndoe@gmail.com"
              className="mt-1"
            />
          </div>
          <div className="my-3">
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              type="password"
              value={input.password}
              name="password"
              autoComplete="new-password"
              required
              aria-required="true"
              onChange={changeEventHandler}
              placeholder="********"
              className="mt-1"
            />
          </div>
          <div className="my-3">
            <Label htmlFor="reg-pancard">PAN Card Number</Label>
            <Input
              id="reg-pancard"
              type="text"
              value={input.pancard}
              name="pancard"
              required
              aria-required="true"
              onChange={changeEventHandler}
              placeholder="ABCDE1234F"
              className="mt-1"
            />
          </div>
          <div className="my-3">
            <Label htmlFor="reg-adharcard">Aadhaar Card Number</Label>
            <Input
              id="reg-adharcard"
              type="text"
              value={input.adharcard}
              name="adharcard"
              required
              aria-required="true"
              onChange={changeEventHandler}
              placeholder="123456789012"
              className="mt-1"
            />
          </div>
          <div className="my-3">
            <Label htmlFor="reg-phone">Phone Number</Label>
            <Input
              id="reg-phone"
              type="tel"
              value={input.phoneNumber}
              name="phoneNumber"
              autoComplete="tel"
              required
              aria-required="true"
              onChange={changeEventHandler}
              placeholder="+1234567890"
              className="mt-1"
            />
          </div>

          <fieldset className="my-4">
            <legend className="text-sm font-medium text-gray-700 mb-2">Select your role</legend>
            <RadioGroup className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  id="reg-role-student"
                  name="role"
                  value="Student"
                  checked={input.role === "Student"}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label htmlFor="reg-role-student" className="cursor-pointer">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  id="reg-role-recruiter"
                  name="role"
                  value="Recruiter"
                  checked={input.role === "Recruiter"}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label htmlFor="reg-role-recruiter" className="cursor-pointer">Recruiter</Label>
              </div>
            </RadioGroup>
          </fieldset>

          <div className="my-3">
            <Label htmlFor="reg-file">Profile Photo</Label>
            <Input
              id="reg-file"
              type="file"
              accept="image/*"
              onChange={ChangeFilehandler}
              className="cursor-pointer mt-1"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center my-6" aria-live="polite">
              <div className="spinner-border text-blue-600" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              className="block w-full py-3 my-3 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Register
            </button>
          )}

          <p className="text-gray-600 text-sm my-2 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default Register;
