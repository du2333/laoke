import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";

import { router } from "./router";

const schemaConverter = new ZodToJsonSchemaConverter();

export const openAPIHandler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error instanceof Error ? error.message : JSON.stringify(error, null, 2));
    }),
  ],
  plugins: [
    new SmartCoercionPlugin({
      schemaConverters: [schemaConverter],
    }),
    new OpenAPIReferencePlugin({
      schemaConverters: [schemaConverter],
      specGenerateOptions: {
        info: {
          title: "Laoke API",
          version: "1.0.0",
        },
      },
    }),
  ],
});
