import { S3Client } from "@aws-sdk/client-s3";
import { variables } from "./variables";

export const s3 = new S3Client({
  region: "auto",
  endpoint: variables.CLOUDFLARE_API_BASE_URL,
  credentials: {
    accessKeyId: variables.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: variables.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
  maxAttempts: 3,
  requestHandler: {
    requestTimeout: 30000,
    httpsAgent: {
      keepAlive: true,
      maxSockets: 50,
    },
  },
});
