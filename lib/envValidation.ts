const requiredEnvVars = {
  R2_BUCKET_NAME: "Cloudflare R2 bucket name",
  CLOUDFLARE_ACCESS_KEY_ID: "Cloudflare access key ID",
  CLOUDFLARE_SECRET_ACCESS_KEY: "Cloudflare secret access key",
  CLOUDFLARE_API_BASE_URL: "Cloudflare API base URL",
  MONGO_USERNAME: "MongoDB username",
  MONGO_PASSWORD: "MongoDB password",
  MONGO_DB_NAME: "MongoDB database name",
} as const;

type EnvVar = keyof typeof requiredEnvVars;

const missingVars: EnvVar[] = [];
const invalidVars: { var: EnvVar; reason: string }[] = [];

for (const [key, description] of Object.entries(requiredEnvVars)) {
  const value = process.env[key];

  if (!value) {
    missingVars.push(key as EnvVar);
    continue;
  }

  if (typeof value !== "string" || value.trim() === "") {
    invalidVars.push({
      var: key as EnvVar,
      reason: "Value is empty or not a string",
    });
  }
}

if (missingVars.length > 0 || invalidVars.length > 0) {
  const errors: string[] = [];

  if (missingVars.length > 0) {
    errors.push(
      `Missing environment variables:\n${missingVars.map((v) => `  - ${v} (${requiredEnvVars[v as EnvVar]})`).join("\n")}`,
    );
  }

  if (invalidVars.length > 0) {
    errors.push(
      `Invalid environment variables:\n${invalidVars.map((v) => `  - ${v.var}: ${v.reason}`).join("\n")}`,
    );
  }

  throw new Error(`Environment validation failed:\n${errors.join("\n\n")}`);
}

export const env = {
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME!,
  CLOUDFLARE_ACCESS_KEY_ID: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
  CLOUDFLARE_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  CLOUDFLARE_API_BASE_URL: process.env.CLOUDFLARE_API_BASE_URL!,
  MONGO_USERNAME: process.env.MONGO_USERNAME!,
  MONGO_PASSWORD: process.env.MONGO_PASSWORD!,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME!,
  VERCEL_URL: process.env.VERCEL_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
} as const;
