import { connectToDatabase } from "@/utils/db";

export async function GET() {
  await connectToDatabase();
  return new Response("Token refreshed successfully.");
}