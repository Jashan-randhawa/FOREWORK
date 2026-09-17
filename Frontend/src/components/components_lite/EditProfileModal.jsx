import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import API from "@/utils/axiosInstance";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/data";
import { setUser } from "@/redux/authSlice";
import { Loader2, AlertCircle, FileCheck } from "lucide-react";

const MAX_RESUME_SIZE_MB = 5;
const MAX_RESUME_SIZE_BYTES = MAX_RESUME_SIZE_MB * 1024 * 1024;

const EditProfileModal = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const { user } = useSelector((store) => store.auth);

  const [input, setInput] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.profile?.bio || "",
    skills: user?.profile?.skills?.join(", ") || "",
    file: null,
  });
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    setFileError(null);
    setSelectedFileName("");

    if (!file) {
      setInput((prev) => ({ ...prev, file: null }));
      return;
    }

    // MIME type check: must be PDF
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Only PDF documents (.pdf) are accepted for resumes.");
      e.target.value = "";
      return;
    }

    // File size check: maximum 5MB
    if (file.size > MAX_RESUME_SIZE_BYTES) {
      setFileError(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the ${MAX_RESUME_SIZE_MB}MB limit.`
      );
      e.target.value = "";
      return;
    }

    setSelectedFileName(`${file.name} (${(file.size / 1024).toFixed(0)} KB)`);
    setInput((prev) => ({ ...prev, file }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (fileError) {
      toast.error(fileError);
      return;
    }

    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("bio", input.bio);
    formData.append("skills", input.skills);

    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      setLoading(true);
      const res = await API.post(
        `${USER_API_ENDPOINT}/profile/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.data.success) {
        const skillsArray =
          typeof input.skills === "string"
            ? input.skills.split(",").map((s) => s.trim()).filter(Boolean)
            : input.skills;

        dispatch(
          setUser({
            ...res.data.user,
            profile: {
              ...res.data.user?.profile,
              skills: skillsArray,
            },
          })
        );
        toast.success(res.data.message || "Profile updated successfully!");
        setOpen(false);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-[520px]"
          onInteractOutside={() => setOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitHandler} className="space-y-4 py-2">
            <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-1.5 sm:gap-3">
              <Label htmlFor="fullname" className="text-left sm:text-right text-xs sm:text-sm font-medium">
                Full Name
              </Label>
              <input
                type="text"
                id="fullname"
                value={input.fullname}
                name="fullname"
                autoComplete="name"
                onChange={changeEventHandler}
                required
                className="w-full sm:col-span-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 sm:p-2 text-sm min-h-[44px] sm:min-h-0 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-1.5 sm:gap-3">
              <Label htmlFor="email" className="text-left sm:text-right text-xs sm:text-sm font-medium">
                Email
              </Label>
              <input
                type="email"
                id="email"
                value={input.email}
                name="email"
                autoComplete="email"
                onChange={changeEventHandler}
                required
                className="w-full sm:col-span-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 sm:p-2 text-sm min-h-[44px] sm:min-h-0 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-1.5 sm:gap-3">
              <Label htmlFor="phone" className="text-left sm:text-right text-xs sm:text-sm font-medium">
                Phone
              </Label>
              <input
                type="tel"
                id="phone"
                value={input.phoneNumber}
                name="phoneNumber"
                autoComplete="tel"
                inputMode="tel"
                onChange={changeEventHandler}
                required
                className="w-full sm:col-span-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 sm:p-2 text-sm min-h-[44px] sm:min-h-0 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-1.5 sm:gap-3">
              <Label htmlFor="bio" className="text-left sm:text-right text-xs sm:text-sm font-medium pt-1">
                Bio
              </Label>
              <textarea
                id="bio"
                value={input.bio}
                name="bio"
                rows={2}
                onChange={changeEventHandler}
                className="w-full sm:col-span-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 sm:p-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-1.5 sm:gap-3">
              <Label htmlFor="skills" className="text-left sm:text-right text-xs sm:text-sm font-medium">
                Skills
              </Label>
              <input
                id="skills"
                name="skills"
                placeholder="e.g. React, Node.js, Python"
                value={input.skills}
                onChange={changeEventHandler}
                className="w-full sm:col-span-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 sm:p-2 text-sm min-h-[44px] sm:min-h-0 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Resume Upload with inline UX validation (CAND-003) */}
            <div className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-1.5 sm:gap-3">
              <Label htmlFor="file" className="text-left sm:text-right text-xs sm:text-sm font-medium pt-1">
                Resume (PDF)
              </Label>
              <div className="w-full sm:col-span-3 space-y-1">
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept="application/pdf"
                  onChange={fileChangeHandler}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-950/40 dark:file:text-purple-300"
                />
                <p className="text-xs text-gray-500">
                  Allowed: PDF only, max {MAX_RESUME_SIZE_MB}MB.
                </p>

                {selectedFileName && !fileError && (
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Selected: {selectedFileName}</span>
                  </div>
                )}

                {fileError && (
                  <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2 flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto min-h-[44px] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto min-h-[44px] text-xs bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditProfileModal;
