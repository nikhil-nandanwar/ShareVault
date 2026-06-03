import { randomInt } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type FolderRegistry = Record<string, string>;

const DATA_FILE_PATH = path.join(process.cwd(), "data.json");
const MIN_FOLDER_NAME = 100000;
const MAX_FOLDER_NAME = 999999;
const MAX_GENERATION_ATTEMPTS = 20;

function createFolderNameCandidate(): string {
  return String(randomInt(MIN_FOLDER_NAME, MAX_FOLDER_NAME + 1));
}

function isFolderRegistry(value: unknown): value is FolderRegistry {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) => typeof entry === "string")
  );
}

async function readFolderRegistry(): Promise<FolderRegistry> {
  try {
    const fileContents = await readFile(DATA_FILE_PATH, "utf8");
    const parsedContents: unknown = JSON.parse(fileContents);

    return isFolderRegistry(parsedContents) ? parsedContents : {};
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return {};
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return {};
    }

    throw error;
  }
}

async function writeFolderRegistry(
  folderRegistry: FolderRegistry,
): Promise<void> {
  await writeFile(
    DATA_FILE_PATH,
    JSON.stringify(folderRegistry, null, 2),
    "utf8",
  );
}

export async function generateFolderName(): Promise<string> {
  const folderRegistry = await readFolderRegistry();
  let folderName = createFolderNameCandidate();

  for (
    let attempt = 0;
    attempt < MAX_GENERATION_ATTEMPTS && folderName in folderRegistry;
    attempt += 1
  ) {
    folderName = createFolderNameCandidate();
  }

  if (folderName in folderRegistry) {
    folderName = `${Date.now()}-${createFolderNameCandidate()}`;
  }

  folderRegistry[folderName] = new Date().toISOString();
  await writeFolderRegistry(folderRegistry);

  return folderName;
}
