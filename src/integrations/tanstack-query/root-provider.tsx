import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "请求失败");
        },
      },
    },
  });

  return {
    queryClient,
  };
}
export default function TanstackQueryProvider() {}
