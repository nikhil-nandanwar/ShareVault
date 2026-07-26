import { connectToDatabase } from "@/utils/db";
import { NextRequest } from "next/server";
import { env } from "@/lib/envValidation"

export async function GET(req: NextRequest) {
  // await connectToDatabase();
  const pass = await req.nextUrl.searchParams.get("pass");
  console.log("pass", pass);
  if (pass !== env.CRON_PASS) {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response(JSON.stringify({ data: env }), { status: 200 });
}
