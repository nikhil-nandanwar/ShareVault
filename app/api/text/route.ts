import { generateFolderName } from "@/utils/folderName";
import { uploadToDb } from "@/utils/uploadToDB";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("YEEE HAI REQUEST AAYA", request);
    const { text } = await request.json();
    console.log("Received text:", text);
    const code = await generateFolderName() ?? "";
    const response = await uploadToDb(code, text);

    if(response !== code){
        throw new Error("Failed to save text to the database");
    }   

    return NextResponse.json({message: "Text uploaded successfully", code: response });
  } catch (error: unknown) {
    console.error("Error processing text:", error);
    const message = error instanceof Error ? error.message : String(error);
    return  NextResponse.json(
      JSON.stringify({ error: message || "Failed to process text" }),
      { status: 500 },
    );
  }
}
