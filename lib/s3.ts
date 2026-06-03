import { S3Client } from "@aws-sdk/client-s3";
import { variables } from "./variables";

export const s3 = new S3Client({
  region: "auto", // Required by AWS SDK, not used by R2
  // Provide your R2 endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  endpoint: `${variables.CLOUDFLARE_API_BASE_URL}`,
  credentials: {
    // Provide your R2
    accessKeyId: `${variables.CLOUDFLARE_ACCESS_KEY_ID}`,
    secretAccessKey: `${variables.CLOUDFLARE_SECRET_ACCESS_KEY}`,
  },
});
