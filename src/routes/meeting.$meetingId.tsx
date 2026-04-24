import { createFileRoute, redirect } from "@tanstack/react-router";

import { MeetingPage } from "@/features/meeting/client/pages/MeetingPage";
import {
  clearCurrentMeetingSession,
  getCurrentMeetingSession,
} from "@/features/meeting/client/storage/current-meeting";

export const Route = createFileRoute("/meeting/$meetingId")({
  loader: ({ params }) => {
    const session = getCurrentMeetingSession();
    if (!session || session.meetingId !== params.meetingId) {
      throw redirect({ to: "/" });
    }

    return session;
  },
  component: MeetingRoute,
});

function MeetingRoute() {
  const navigate = Route.useNavigate();
  const session = Route.useLoaderData();

  function handleLeave() {
    clearCurrentMeetingSession();
    void navigate({ to: "/" });
  }

  return <MeetingPage session={session} onLeave={handleLeave} />;
}
