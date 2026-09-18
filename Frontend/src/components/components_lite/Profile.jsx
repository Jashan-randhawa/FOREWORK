import React, { useState, useMemo } from "react";
import Navbar from "./Navbar";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Contact,
  Mail,
  Pen,
  Bookmark,
  Bell,
  Calendar,
  Video,
  ExternalLink,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import AppliedJob from "./AppliedJob";
import EditProfileModal from "./EditProfileModal";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAllAppliedJobs";
import { Link } from "react-router-dom";
import { ResumeViewer } from "../shared";

const Profile = () => {
  useGetAppliedJobs();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { allAppliedJobs = [] } = useSelector((store) => store.job);

  // 1. Profile Completion Summary (computed client-side)
  const profileStats = useMemo(() => {
    const fields = [
      {
        id: "photo",
        label: "Profile Photo",
        isComplete: Boolean(user?.profile?.profilePhoto),
      },
      {
        id: "bio",
        label: "Bio",
        isComplete: Boolean(user?.profile?.bio && user.profile.bio.trim().length > 0),
      },
      {
        id: "skills",
        label: "Skills",
        isComplete: Boolean(user?.profile?.skills && user.profile.skills.length > 0),
      },
      {
        id: "resume",
        label: "Resume",
        isComplete: Boolean(user?.profile?.resume && user.profile.resume.trim().length > 0),
      },
      {
        id: "phone",
        label: "Phone Number",
        isComplete: Boolean(user?.phoneNumber && user.phoneNumber.trim().length > 0),
      },
    ];

    const completedCount = fields.filter((f) => f.isComplete).length;
    const percentage = Math.round((completedCount / fields.length) * 100);

    return { fields, completedCount, percentage };
  }, [user]);

  // 2. Upcoming Interviews (scheduledAt in future)
  const upcomingInterviews = useMemo(() => {
    const now = Date.now();
    return (allAppliedJobs || [])
      .filter((app) => {
        if (!app?.scheduledAt) return false;
        const interviewTime = new Date(app.scheduledAt).getTime();
        return !isNaN(interviewTime) && interviewTime > now;
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [allAppliedJobs]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Top Header Grid: Profile Summary & Completion & Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Info Card (Span 2 cols on lg) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-center gap-5">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-purple-100 dark:border-purple-950">
                  <AvatarImage
                    src={user?.profile?.profilePhoto || "https://github.com/shadcn.png"}
                    alt={user?.fullname || "User Avatar"}
                    className="object-cover"
                  />
                </Avatar>
                <div>
                  <h1 className="font-bold text-2xl text-gray-900 dark:text-gray-100 break-words">
                    {user?.fullname || "User"}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed break-words [overflow-wrap:anywhere]">
                    {user?.profile?.bio || "No bio added yet. Tell recruiters about yourself!"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setOpen(true)}
                variant="outline"
                size="sm"
                aria-label="Edit Profile"
                className="flex items-center gap-1.5 self-end sm:self-start"
              >
                <Pen className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Button>
            </div>

            {/* Contact Details */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <a
                  href={`mailto:${user?.email}`}
                  className="hover:text-purple-600 hover:underline truncate"
                >
                  {user?.email || "No email available"}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  <Contact className="w-4 h-4" />
                </div>
                <a
                  href={`tel:${user?.phoneNumber}`}
                  className="hover:text-purple-600 hover:underline"
                >
                  {user?.phoneNumber || "No phone provided"}
                </a>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2.5">
                Skills & Technologies
              </h2>
              <div className="flex flex-wrap items-center gap-1.5">
                {user?.profile?.skills && user.profile.skills.length > 0 ? (
                  user.profile.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                    >
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No skills added yet</span>
                )}
              </div>
            </div>

            {/* Resume Section with Shared ResumeViewer */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Primary Resume
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Your resume is automatically attached when you apply to jobs.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {user?.profile?.resume && (
                    <Link to="/ats">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs flex items-center gap-1.5 text-purple-600 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Check ATS Score</span>
                      </Button>
                    </Link>
                  )}
                  <Button
                    onClick={() => setOpen(true)}
                    variant="outline"
                    size="sm"
                    className="text-xs flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{user?.profile?.resume ? "Update Resume" : "Upload Resume"}</span>
                  </Button>
                </div>
              </div>
              <div className="mt-3">
                <ResumeViewer
                  resumeUrl={user?.profile?.resume}
                  resumeOriginalName={user?.profile?.resumeOriginalName}
                  fallbackText="No resume uploaded yet. Upload one to boost job applications!"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Profile Completion Summary & Shortcuts */}
          <div className="space-y-6">
            {/* Profile Completion Card */}
            <div
              data-testid="profile-completion-card"
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Profile Strength
                  </h2>
                </div>
                <span
                  data-testid="completion-percentage-text"
                  className="text-sm font-bold text-purple-600 dark:text-purple-400"
                >
                  {profileStats.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden mb-4">
                <div
                  role="progressbar"
                  aria-valuenow={profileStats.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${profileStats.percentage}%` }}
                />
              </div>

              {/* Checklist Items */}
              <div className="space-y-2 text-xs">
                {profileStats.fields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      {field.isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                      )}
                      <span
                        className={
                          field.isComplete
                            ? "text-gray-800 dark:text-gray-200 font-medium"
                            : "text-gray-500 dark:text-gray-400"
                        }
                      >
                        {field.label}
                      </span>
                    </div>
                    {field.isComplete ? (
                      <span className="text-[10px] text-green-600 font-medium">Done</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="text-[10px] text-purple-600 hover:underline font-medium"
                      >
                        Add
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Shortcuts */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Candidate Shortcuts
              </h2>
              <Link
                to="/saved-jobs"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-transparent hover:border-purple-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 group-hover:scale-105 transition-transform">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      Saved Jobs
                    </div>
                    <div className="text-[11px] text-gray-500">Review bookmarked positions</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </Link>

              <Link
                to="/job-alerts"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-transparent hover:border-purple-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 group-hover:scale-105 transition-transform">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      Job Alerts
                    </div>
                    <div className="text-[11px] text-gray-500">Manage search notifications</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Upcoming Interview Card (Pulled from applications where scheduledAt is in the future) */}
        {upcomingInterviews.length > 0 && (
          <section
            data-testid="upcoming-interview-section"
            aria-label="Upcoming Interviews"
            className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-purple-600 text-white">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Upcoming Interviews
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  You have scheduled interview sessions with recruiters.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingInterviews.map((app) => {
                const dateObj = new Date(app.scheduledAt);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={app._id}
                    data-testid="interview-card"
                    className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-purple-100 dark:border-purple-900 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {app.job?.title || "Interview"}
                          </h3>
                          <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                            {app.job?.company?.name || "Company"}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Scheduled
                        </Badge>
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-600" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                          <span>{formattedTime}</span>
                        </div>
                      </div>
                    </div>

                    {app.meetingLink && (
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <a
                          href={app.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meeting Room</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. Applied Jobs Table Section */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Applied Jobs
            </h2>
          </div>

          <AppliedJob />
        </section>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal open={open} setOpen={setOpen} />
    </div>
  );
};

export default Profile;
