import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Defence in depth against NoSQL operator injection ({"$ne": null} style payloads):
// objects containing $-operators inside a query filter are neutralised.
mongoose.set("sanitizeFilter", true);

export async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
}
