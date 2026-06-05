import { Content } from "@/models/dataContent.model";
import { connectToDatabase } from "./db";

export async function uploadToDb(
  code: string,
  data: string = "",
): Promise<string | null | undefined> {
  try {
    await connectToDatabase();
    const response = await Content.create({
       code,
       data,
    });

    if (!response || !response._id) {
      throw new Error("Failed to save content to the database");
    }
    return response.code?.toString();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to the database");
  }
}
