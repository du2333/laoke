import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/features/meeting/client/pages/HomePage";

export const Route = createFileRoute("/")({ component: HomePage });
