import { createContentRecord } from "./createContent";

export async function uploadToDb(
  code: string,
  data: string = "",
): Promise<string | null | undefined> {
  if (data) {
    return createContentRecord(data);
  }

  return code;
}
