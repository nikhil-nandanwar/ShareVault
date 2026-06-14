import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { variables } from "./variables";
import https from "node:https";

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
});

export const s3 = new S3Client({
  region: "auto",
  endpoint: `${variables.CLOUDFLARE_API_BASE_URL}`,
  credentials: {
    accessKeyId: `${variables.CLOUDFLARE_ACCESS_KEY_ID}`,
    secretAccessKey: `${variables.CLOUDFLARE_SECRET_ACCESS_KEY}`,
  },
  maxAttempts: 3,
  requestHandler: new NodeHttpHandler({
    httpsAgent: agent,
    connectionTimeout: 5000,
    requestTimeout: 120_000,
  }),
});
