import { randomInt } from "node:crypto";
import { Content } from "@/models/dataContent.model";
import { connectToDatabase } from "./db";

const MIN_CODE = 100000;
const MAX_CODE = 999999;
const MAX_GENERATION_ATTEMPTS = 20;

function createCodeCandidate(): string {
  return String(randomInt(MIN_CODE, MAX_CODE + 1));
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  );
}

export async function createContentRecord(data: string = ""): Promise<string> {
  await connectToDatabase();

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const code = createCodeCandidate();

    try {
      await Content.create({ code, data });
      return code;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Failed to generate unique retrieval code");
}
