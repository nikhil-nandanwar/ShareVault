import { variables } from "@/lib/variables";
import mongoose from "mongoose";

export function connectToDatabase(): Promise<typeof mongoose> {
  const uri = `mongodb+srv://${variables.MONGO_USERNAME}:${variables.MONGO_PASSWORD}@cluster0.pxlkh.mongodb.net/${variables.MONGO_DB_NAME}`;

  return mongoose.connect(uri);
}
