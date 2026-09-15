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
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="fullname" className="text-right text-sm">
                Full Name
              </Label>
              <input
                type="text"
                id="fullname"
                value={input.fullname}
                name="fullname"
                onChange={changeEventHandler}
                required
                className="col-span-3 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="email" className="text-right text-sm">
                Email
              </Label>
              <input
                type="email"
                id="email"
                value={input.email}
                name="email"
                onChange={changeEventHandler}
                required
                className="col-span-3 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="phone" className="text-right text-sm">
                Phone
              </Label>
              <input
                type="tel"
                id="phone"
                value={input.phoneNumber}
                name="phoneNumber"
                onChange={changeEventHandler}
                required
                className="col-span-3 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="bio" className="text-right text-sm">
                Bio
              </Label>
              <textarea
                id="bio"
                value={input.bio}
                name="bio"
                rows={2}
                onChange={changeEventHandler}
                className="col-span-3 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="skills" className="text-right text-sm">
                Skills
              </Label>
              <input
                id="skills"
                name="skills"
                placeholder="e.g. React, Node.js, Python"
                value={input.skills}
                onChange={changeEventHandler}
                className="col-span-3 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Resume Upload with inline UX validation (CAND-003) */}
            <div className="grid grid-cols-4 items-start gap-3">
              <Label htmlFor="file" className="text-right text-sm pt-2">
                Resume (PDF)
              </Label>
              <div className="col-span-3 space-y-1">
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept="application/pdf"
                  onChange={fileChangeHandler}
                  className="w-full border border-gray-300 rounded-md p-1.5 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
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

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || Boolean(fileError)}
                className="bg-[#6B3AC2] hover:bg-[#552d9b] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
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
