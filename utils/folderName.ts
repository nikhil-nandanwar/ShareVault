import { randomInt } from "node:crypto";
import { connectToDatabase } from "./db";
import { Content } from "@/models/dataContent.model";

const MIN_FOLDER_NAME = 100000;
const MAX_FOLDER_NAME = 999999;
const MAX_GENERATION_ATTEMPTS = 20;

function createFolderNameCandidate(): string {
  return String(randomInt(MIN_FOLDER_NAME, MAX_FOLDER_NAME + 1));
}

export async function generateFolderName(): Promise<string | null> {
  try {
    await connectToDatabase();

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
      const folderName = createFolderNameCandidate();

      const existing = await Content.findOne({  folderName });
      if (!existing) return folderName;
    }
  } catch (error: unknown) {
    console.error("Error generating folder name:", error);

    return null;
  }

  return null;
}
