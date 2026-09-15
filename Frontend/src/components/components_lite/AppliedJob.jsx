import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Calendar, Video, ArrowUpRight, Briefcase } from "lucide-react";

const AppliedJob = () => {
  const { allAppliedJobs } = useSelector((store) => store.job);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <Table className="min-w-[600px]">
        <TableCaption className="py-4 text-xs text-gray-500">
          Showing all your submitted applications and interview updates
        </TableCaption>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold text-gray-700">Date</TableHead>
            <TableHead className="font-semibold text-gray-700">Job Title</TableHead>
            <TableHead className="font-semibold text-gray-700">Company</TableHead>
            <TableHead className="font-semibold text-gray-700">Interview Details</TableHead>
            <TableHead className="text-right font-semibold text-gray-700">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!allAppliedJobs || allAppliedJobs.length <= 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-[#6B3AC2]">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <p className="text-gray-700 font-medium text-base">No applications submitted yet</p>
                  <p className="text-gray-500 text-xs max-w-sm">
                    Explore available career openings and start applying today!
                  </p>
                  <Link to="/Jobs" className="mt-2">
                    <Button size="sm" className="bg-[#6B3AC2] hover:bg-[#522998] text-white text-xs">
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            allAppliedJobs.map((appliedJob) => (
              <TableRow key={appliedJob._id} className="hover:bg-gray-50/80 transition-colors">
                <TableCell className="text-xs text-gray-600">
                  {appliedJob?.createdAt ? appliedJob.createdAt.split("T")[0] : "Recent"}
                </TableCell>
                <TableCell className="font-medium">
                  {appliedJob?.job?._id ? (
                    <Link
                      to={`/description/${appliedJob.job._id}`}
                      className="group inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>{appliedJob.job?.title || "Job Position"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ) : (
                    appliedJob?.job?.title || "Position Unavailable"
                  )}
                </TableCell>
                <TableCell className="text-gray-800">
                  {appliedJob?.job?.company?.name || "Company"}
                </TableCell>
                <TableCell>
                  {(appliedJob?.scheduledAt || appliedJob?.interviewSchedule?.scheduledAt) ? (
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="inline-flex items-center gap-1 text-purple-700 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(appliedJob.scheduledAt || appliedJob.interviewSchedule.scheduledAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {(appliedJob.meetingLink || appliedJob.interviewSchedule?.meetingLink) && (
                        <a
                          href={appliedJob.meetingLink || appliedJob.interviewSchedule.meetingLink}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Join Meeting
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      className={`capitalize font-medium text-xs px-2.5 py-0.5 rounded-full ${
                        appliedJob?.status === "rejected"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : appliedJob?.status === "accepted"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {appliedJob?.status || "pending"}
                    </Badge>
                    {(appliedJob?.scheduledAt || appliedJob?.interviewSchedule?.scheduledAt) &&
                      appliedJob?.status !== "rejected" && (
                        <span className="text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5">
                          Interview Scheduled
                        </span>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppliedJob;
