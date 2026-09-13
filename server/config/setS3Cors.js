import { PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3.js";

async function configureCors() {
  try {
    const corsParams = {
      Bucket: "shruti-storage-app",
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: [
              "https://apexvault-1.netlify.app",
              "http://localhost:5173",
              "http://localhost:3000",
              "http://localhost:4000",
              "*"
            ],
            ExposeHeaders: ["ETag", "x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    };

    console.log("Setting S3 CORS configuration on bucket 'shruti-storage-app'...");
    const command = new PutBucketCorsCommand(corsParams);
    const response = await s3Client.send(command);
    console.log("Successfully updated S3 CORS configuration!", response);

    console.log("Verifying CORS configuration...");
    const getCommand = new GetBucketCorsCommand({ Bucket: "shruti-storage-app" });
    const getResponse = await s3Client.send(getCommand);
    console.log("Current S3 CORS Rules:", JSON.stringify(getResponse.CORSRules, null, 2));
  } catch (error) {
    console.error("Error setting S3 CORS configuration:", error);
  }
}

configureCors();
