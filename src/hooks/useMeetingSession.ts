import { useState } from "react";
import type { AppPage } from "@/lib/schema/app";
import type { MeetingSession } from "@/lib/schema/meeting";

export function useMeetingSession() {
  const [page, setPage] = useState<AppPage>("home");
  const [meetingSession, setMeetingSession] = useState<MeetingSession | null>(
    null,
  );

  function joinMeeting(session: MeetingSession) {
    setMeetingSession(session);
    setPage("meeting");
  }

  function leaveMeeting() {
    setMeetingSession(null);
    setPage("home");
  }

  return {
    page,
    meetingSession,
    joinMeeting,
    leaveMeeting,
  };
}
