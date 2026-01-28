// Workaround for @cloudflare/realtimekit-react packaging bug
// The package.json points to ./dist/index.d.ts but types are actually at ./types/index.d.ts

declare module "@cloudflare/realtimekit-react" {
  import type RTKClient from "@cloudflare/realtimekit";
  import type { RTKConfigOptions } from "@cloudflare/realtimekit";

  interface RealtimeKitClientParams {
    resetOnLeave?: boolean;
  }

  export const useRealtimeKitClient: (
    clientParams?: RealtimeKitClientParams
  ) => readonly [
    RTKClient | undefined,
    (options: RTKConfigOptions) => Promise<RTKClient | undefined>
  ];

  type StateSelector<T extends object, U> = (state: T) => U;

  export const useRealtimeKitSelector: <StateSlice>(
    selector: StateSelector<RTKClient, StateSlice>
  ) => StateSlice;

  export function RealtimeKitProvider(props: {
    value: RTKClient | undefined;
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }): JSX.Element;
}
