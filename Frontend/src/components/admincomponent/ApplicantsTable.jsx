import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
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
  ExternalLink,
  Loader2,
  Plus,
  Video,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import API from "@/utils/axiosInstance";
import { setAllApplicants } from "@/redux/applicationSlice";

const STATUS_CLASSES = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

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

  // Status handler (Accepted, Rejected)
  const statusHandler = async (status, id) => {
    try {
      const res = await API.post(
        `${APPLICATION_API_ENDPOINT}/status/${id}/update`,
        { status }
      );
      if (res.data?.success) {
        toast.success(res.data.message || `Status updated to ${status}`);
        updateApplicationInStore(id, { status: status.toLowerCase() });
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
    if (!noteText.trim() || !selectedAppForNotes) return;

    try {
      setAddingNote(true);
      const res = await API.post(
        `${APPLICATION_API_ENDPOINT}/${selectedAppForNotes._id}/notes`,
        { text: noteText.trim() }
      );

      if (res.data?.success) {
        toast.success("Recruiter note added successfully");
        const updatedNotes = res.data.recruiterNotes || res.data.data?.recruiterNotes;
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
      try {
        const d = new Date(app.scheduledAt);
        initialDate = d.toISOString().slice(0, 16);
      } catch (err) {
        initialDate = "";
      }
    }
    setScheduleData({
      scheduledAt: initialDate,
      meetingLink: app.meetingLink || "",
    });
  };

  // Submit Interview Schedule (EMP-004)
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppForSchedule || !scheduleData.scheduledAt || !scheduleData.meetingLink) {
      toast.error("Please provide both scheduled date/time and meeting link");
      return;
    }

    try {
      setScheduling(true);
      const res = await API.post(
        `${APPLICATION_API_ENDPOINT}/${selectedAppForSchedule._id}/schedule`,
        {
          scheduledAt: scheduleData.scheduledAt,
          meetingLink: scheduleData.meetingLink.trim(),
        }
      );

      if (res.data?.success) {
        toast.success("Interview scheduled & email notification sent to candidate");
        updateApplicationInStore(selectedAppForSchedule._id, {
          scheduledAt: scheduleData.scheduledAt,
          meetingLink: scheduleData.meetingLink.trim(),
        });
        setSelectedAppForSchedule(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to schedule interview");
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div>
      <Table>
        <TableCaption>A list of applicants for this job</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Interview</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Applied Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants?.applications?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                No applicants yet
              </TableCell>
            </TableRow>
          ) : (
            applicants?.applications?.map((item) => {
              const currentStatus = (item.status || "pending").toLowerCase();
              const statusClass =
                STATUS_CLASSES[currentStatus] || STATUS_CLASSES.pending;

              return (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">
                    {item?.applicant?.fullname || "Unknown"}
                  </TableCell>
                  <TableCell>{item?.applicant?.email}</TableCell>
                  <TableCell>{item?.applicant?.phoneNumber || "N/A"}</TableCell>
                  <TableCell>
                    {item.applicant?.profile?.resume ? (
                      <a
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
                        href={item?.applicant?.profile?.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Resume <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusClass}`}
                    >
                      {currentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.scheduledAt ? (
                      <div className="flex flex-col gap-1">
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
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openNotesModal(item)}
                      className="h-7 text-xs flex items-center gap-1.5 text-gray-700 hover:bg-gray-100"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                      <span>{item.recruiterNotes?.length || 0} notes</span>
                    </Button>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {item?.createdAt?.split("T")[0]}
                  </TableCell>
                  <TableCell className="text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="p-1 hover:bg-gray-100 rounded cursor-pointer">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 p-1 text-sm shadow-md" align="end">
                        <div className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                          Update Status
                        </div>
                        <button
                          onClick={() => statusHandler("Accepted", item._id)}
                          className="w-full text-left px-2 py-1.5 hover:bg-green-50 text-green-700 rounded text-xs font-medium"
                        >
                          Accept Candidate
                        </button>
                        <button
                          onClick={() => statusHandler("Rejected", item._id)}
                          className="w-full text-left px-2 py-1.5 hover:bg-red-50 text-red-700 rounded text-xs font-medium"
                        >
                          Reject Candidate
                        </button>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Recruiter Notes Dialog (EMP-003) */}
      <Dialog
        open={!!selectedAppForNotes}
        onOpenChange={(open) => {
          if (!open) setSelectedAppForNotes(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Recruiter Notes
            </DialogTitle>
            <DialogDescription>
              Candidate: {selectedAppForNotes?.applicant?.fullname || "Applicant"}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-60 overflow-y-auto space-y-3 my-2 pr-1">
            {!selectedAppForNotes?.recruiterNotes ||
            selectedAppForNotes.recruiterNotes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No notes added yet for this applicant.
              </p>
            ) : (
              selectedAppForNotes.recruiterNotes.map((note, idx) => (
                <div
                  key={note._id || idx}
                  className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm"
                >
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span className="font-semibold text-gray-700">
                      {note.author?.fullname || "Recruiter"}
                    </span>
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{note.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddNote} className="space-y-3">
            <div>
              <Label htmlFor="noteInput" className="text-xs font-semibold">
                Add New Note
              </Label>
              <textarea
                id="noteInput"
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write observations, interview feedback, or next steps..."
                className="w-full mt-1.5 p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={addingNote || !noteText.trim()}
                className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white flex items-center gap-1 text-xs"
              >
                {addingNote ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Plus className="w-4 h-4 mr-1" />
                )}
                Add Note
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Interview Scheduling Dialog (EMP-004) */}
      <Dialog
        open={!!selectedAppForSchedule}
        onOpenChange={(open) => {
          if (!open) setSelectedAppForSchedule(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Schedule Interview
            </DialogTitle>
            <DialogDescription>
              Candidate: {selectedAppForSchedule?.applicant?.fullname || "Applicant"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleScheduleSubmit} className="space-y-4 my-2">
            <div>
              <Label htmlFor="scheduledAt">Date & Time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduleData.scheduledAt}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, scheduledAt: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="meetingLink">Meeting Link (Google Meet / Zoom / Teams)</Label>
              <Input
                id="meetingLink"
                type="url"
                placeholder="https://meet.google.com/abc-defg-hij"
                value={scheduleData.meetingLink}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, meetingLink: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>
            <p className="text-xs text-gray-500">
              An email invitation containing the schedule details and meeting link will be
              sent directly to the candidate ({selectedAppForSchedule?.applicant?.email}).
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedAppForSchedule(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={scheduling}
                className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white flex items-center gap-1"
              >
                {scheduling ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Calendar className="w-4 h-4 mr-1" />
                )}
                Schedule & Notify
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicantsTable;
