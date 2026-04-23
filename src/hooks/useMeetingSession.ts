import { useState, useCallback } from "react";
import type { AppPage } from "@/lib/schema/app";
import type { MeetingSession } from "@/lib/schema/meeting";

export function useMeetingSession() {
  const [page, setPage] = useState<AppPage>("home");
  const [meetingSession, setMeetingSession] = useState<MeetingSession | null>(
    null,
  );

  const joinMeeting = useCallback((session: MeetingSession) => {
    setMeetingSession(session);
    setPage("meeting");
  }, []);

  const leaveMeeting = useCallback(() => {
    setMeetingSession(null);
    setPage("home");
  }, []);

  return {
    page,
    meetingSession,
    joinMeeting,
    leaveMeeting,
  };
}
