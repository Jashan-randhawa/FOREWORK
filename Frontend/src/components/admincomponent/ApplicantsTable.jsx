import React, { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  MoreHorizontal,
  MessageSquare,
  Calendar,
  Loader2,
  Plus,
  Video,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import API from "@/utils/axiosInstance";
import { setAllApplicants } from "@/redux/applicationSlice";
import { DataTable, ApplicationStatusBadge, ResumeViewer } from "../shared";

const ApplicantsTable = () => {
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);

  // Notes Modal state
  const [selectedAppForNotes, setSelectedAppForNotes] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Interview Schedule Modal state
  const [selectedAppForSchedule, setSelectedAppForSchedule] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    scheduledAt: "",
    meetingLink: "",
  });
  const [scheduling, setScheduling] = useState(false);

  // Update an application in Redux store
  const updateApplicationInStore = (applicationId, updatedFields) => {
    if (!applicants?.applications) return;
    const updatedApplications = applicants.applications.map((app) =>
      app._id === applicationId ? { ...app, ...updatedFields } : app
    );
    dispatch(
      setAllApplicants({
        ...applicants,
        applications: updatedApplications,
      })
    );
  };

  // Status handler (accepted, rejected, pending)
  const statusHandler = async (status, id) => {
    try {
      const normalizedStatus = status.toLowerCase();
      const res = await API.post(
        `${APPLICATION_API_ENDPOINT}/status/${id}/update`,
        { status: normalizedStatus }
      );
      if (res.data?.success) {
        toast.success(res.data.message || `Status updated to ${normalizedStatus}`);
        updateApplicationInStore(id, { status: normalizedStatus });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Open Notes Modal
  const openNotesModal = (app) => {
    setSelectedAppForNotes(app);
    setNoteText("");
  };

  // Submit Note (EMP-003)
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error("Please enter a note before submitting.");
      return;
    }
    if (!selectedAppForNotes) return;

    try {
      setAddingNote(true);
      const res = await API.post(
        `${APPLICATION_API_ENDPOINT}/${selectedAppForNotes._id}/notes`,
        { text: noteText.trim() }
      );
      if (res.data?.success) {
        toast.success("Note added successfully");
        const updatedNotes = res.data.data?.recruiterNotes || [];
        updateApplicationInStore(selectedAppForNotes._id, {
          recruiterNotes: updatedNotes,
        });
        setSelectedAppForNotes((prev) =>
          prev ? { ...prev, recruiterNotes: updatedNotes } : null
        );
        setNoteText("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  // Open Schedule Modal (EMP-004)
  const openScheduleModal = (app) => {
    setSelectedAppForSchedule(app);
    let initialDate = "";
    if (app.scheduledAt) {
      const d = new Date(app.scheduledAt);
      const tzOffset = d.getTimezoneOffset() * 60000;
      initialDate = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    }
    setScheduleData({
      scheduledAt: initialDate,
      meetingLink: app.meetingLink || "",
    });
  };

  // Submit Schedule (EMP-004)
  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!scheduleData.scheduledAt) {
      toast.error("Please select a date and time for the interview.");
      return;
    }
    if (!selectedAppForSchedule) return;

    try {
      setScheduling(true);
      const res = await API.post(
        `${APPLICATION_API_ENDPOINT}/${selectedAppForSchedule._id}/schedule`,
        {
          scheduledAt: new Date(scheduleData.scheduledAt).toISOString(),
          meetingLink: scheduleData.meetingLink.trim(),
        }
      );
      if (res.data?.success) {
        toast.success(
          res.data.message || "Interview scheduled and candidate notified via email!"
        );
        updateApplicationInStore(selectedAppForSchedule._id, {
          scheduledAt: res.data.data?.scheduledAt || new Date(scheduleData.scheduledAt).toISOString(),
          meetingLink: res.data.data?.meetingLink || scheduleData.meetingLink.trim(),
        });
        setSelectedAppForSchedule(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to schedule interview");
    } finally {
      setScheduling(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Full Name",
        accessorKey: "applicantName",
        priority: "primary",
        sortable: true,
        cell: (item) => (
          <span className="font-semibold text-gray-900 dark:text-gray-100 break-words">
            {item?.applicant?.fullname || "Unknown"}
          </span>
        ),
      },
      {
        header: "Email",
        accessorKey: "applicantEmail",
        priority: "secondary",
        sortable: true,
        cell: (item) => (
          <span className="break-all">{item?.applicant?.email || "—"}</span>
        ),
      },
      {
        header: "Contact",
        priority: "hidden-mobile",
        cell: (item) => item?.applicant?.phoneNumber || "N/A",
      },
      {
        header: "Resume",
        priority: "secondary",
        cell: (item) => (
          <ResumeViewer
            resumeUrl={item?.applicant?.profile?.resume}
            resumeOriginalName={item?.applicant?.profile?.resumeOriginalName}
            fallbackText="N/A"
          />
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        priority: "primary",
        sortable: true,
        cell: (item) => <ApplicationStatusBadge status={item.status || "pending"} />,
      },
      {
        header: "Interview",
        priority: "secondary",
        cell: (item) => {
          return item.scheduledAt ? (
            <div className="flex flex-col gap-1 text-xs">
              <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-green-600" />
                {new Date(item.scheduledAt).toLocaleDateString()}
              </span>
              {item.meetingLink && (
                <a
                  href={item.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <Video className="w-3 h-3" /> Meeting Link
                </a>
              )}
              <button
                type="button"
                onClick={() => openScheduleModal(item)}
                className="text-xs text-gray-500 hover:text-gray-700 underline text-left"
              >
                Reschedule
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openScheduleModal(item)}
              className="h-7 text-xs flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" /> Schedule
            </Button>
          );
        },
      },
      {
        header: "Notes",
        priority: "secondary",
        cell: (item) => (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openNotesModal(item)}
            className="h-7 text-xs flex items-center gap-1.5 text-gray-700 hover:bg-gray-100"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
            <span>{item.recruiterNotes?.length || 0} notes</span>
          </Button>
        ),
      },
      {
        header: "Action",
        priority: "primary",
        className: "text-right",
        headerClassName: "text-right",
        cell: (item) => (
          <div className="flex justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label="Open status options"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-36 p-1.5 text-sm shadow-md" align="end">
                <div className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                  Update Status
                </div>
                {["accepted", "rejected", "pending"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => statusHandler(status, item._id)}
                    className="w-full text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer capitalize text-xs text-gray-700 dark:text-gray-200"
                  >
                    {status}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        ),
      },
    ],
    []
  );

  const renderApplicantMobileCard = (item) => {
    const appliedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent";
    return (
      <div
        data-testid="applicant-mobile-card"
        className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3"
      >
        {/* Row 1: applicant name + status badge + overflow menu */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate break-words">
              {item?.applicant?.fullname || "Unknown"}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate break-all">
              {item?.applicant?.email || item?.applicant?.phoneNumber || "No contact"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ApplicationStatusBadge status={item.status || "pending"} />
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label="Open status options"
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-36 p-1.5 text-sm shadow-md" align="end">
                <div className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                  Update Status
                </div>
                {["accepted", "rejected", "pending"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => statusHandler(status, item._id)}
                    className="w-full text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer capitalize text-xs text-gray-700 dark:text-gray-200"
                  >
                    {status}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Row 2: applied date + resume link */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/60 text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            Applied: <span className="font-medium text-gray-700 dark:text-gray-300">{appliedDate}</span>
          </span>
          <ResumeViewer
            resumeUrl={item?.applicant?.profile?.resume}
            resumeOriginalName={item?.applicant?.profile?.resumeOriginalName}
            fallbackText="No resume"
          />
        </div>

        {/* Mobile quick actions: Interview & Notes */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openScheduleModal(item)}
            className="flex-1 h-8 text-xs flex items-center justify-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-green-600" />
            <span>{item.scheduledAt ? "Reschedule" : "Schedule"}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openNotesModal(item)}
            className="flex-1 h-8 text-xs flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
            <span>Notes ({item.recruiterNotes?.length || 0})</span>
          </Button>
        </div>
      </div>
    );
  };

  const tableData = useMemo(() => {
    return (applicants?.applications || []).map((app) => ({
      ...app,
      applicantName: app.applicant?.fullname || "",
      applicantEmail: app.applicant?.email || "",
    }));
  }, [applicants?.applications]);

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={tableData}
        caption="A list of your recent applied user"
        emptyMessage="No applicants yet"
        tableClassName="md:min-w-[850px]"
        mobileCard={renderApplicantMobileCard}
      />

      {/* Recruiter Notes Modal (EMP-003) */}
      <Dialog
        open={!!selectedAppForNotes}
        onOpenChange={(open) => {
          if (!open) setSelectedAppForNotes(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Recruiter Notes</DialogTitle>
            <DialogDescription>
              Internal evaluation notes for{" "}
              <span className="font-semibold text-gray-900">
                {selectedAppForNotes?.applicant?.fullname || "Candidate"}
              </span>
              . Only visible to recruiters.
            </DialogDescription>
          </DialogHeader>

          {/* Existing Notes List */}
          <div className="max-h-56 overflow-y-auto space-y-2.5 my-2 pr-1">
            {!selectedAppForNotes?.recruiterNotes ||
            selectedAppForNotes.recruiterNotes.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                No notes added yet. Add your first note below.
              </p>
            ) : (
              selectedAppForNotes.recruiterNotes.map((note, idx) => (
                <div
                  key={note._id || idx}
                  className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-xs space-y-1"
                >
                  <p className="text-gray-800 whitespace-pre-wrap">{note.text}</p>
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>{note.author?.fullname || "Recruiter"}</span>
                    <span>
                      {note.createdAt
                        ? new Date(note.createdAt).toLocaleString()
                        : "Just now"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label htmlFor="note-text" className="text-xs font-semibold">
                Add Note
              </Label>
              <textarea
                id="note-text"
                rows={3}
                className="w-full text-xs p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                placeholder="Write your impressions, interview feedback, or next steps..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedAppForNotes(null)}
              >
                Close
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={addingNote || !noteText.trim()}
              >
                {addingNote ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Plus className="w-3.5 h-3.5 mr-1" />
                )}
                Save Note
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Modal (EMP-004) */}
      <Dialog
        open={!!selectedAppForSchedule}
        onOpenChange={(open) => {
          if (!open) setSelectedAppForSchedule(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAppForSchedule?.scheduledAt
                ? "Reschedule Interview"
                : "Schedule Interview"}
            </DialogTitle>
            <DialogDescription>
              Set up an interview with{" "}
              <span className="font-semibold text-gray-900">
                {selectedAppForSchedule?.applicant?.fullname || "Candidate"}
              </span>
              . An invitation email will be automatically sent to{" "}
              <span className="font-semibold text-gray-900">
                {selectedAppForSchedule?.applicant?.email}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleScheduleInterview} className="space-y-4 my-2">
            <div className="space-y-1.5">
              <Label htmlFor="scheduledAt" className="text-xs font-semibold">
                Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduleData.scheduledAt}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, scheduledAt: e.target.value })
                }
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="meetingLink" className="text-xs font-semibold">
                Meeting Link (Google Meet, Zoom, etc.)
              </Label>
              <Input
                id="meetingLink"
                type="url"
                placeholder="https://meet.google.com/xyz-abc-def"
                value={scheduleData.meetingLink}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, meetingLink: e.target.value })
                }
                className="text-xs"
              />
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedAppForSchedule(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={scheduling || !scheduleData.scheduledAt}
              >
                {scheduling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                )}
                {selectedAppForSchedule?.scheduledAt
                  ? "Update Schedule"
                  : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicantsTable;
