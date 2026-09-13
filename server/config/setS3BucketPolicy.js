import { PutBucketPolicyCommand, GetBucketPolicyCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3.js";

async function setBucketPolicy() {
  const distributionArn = "arn:aws:cloudfront::736676210543:distribution/E1X2N0GHJX6GJN";
  const bucketName = "shruti-storage-app";

  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "AllowCloudFrontServicePrincipalReadOnly",
        Effect: "Allow",
        Principal: {
          Service: "cloudfront.amazonaws.com",
        },
        Action: "s3:GetObject",
        Resource: `arn:aws:s3:::${bucketName}/*`,
        Condition: {
          StringEquals: {
            "AWS:SourceArn": distributionArn,
          },
        },
      },
    ],
  };

  try {
    console.log("Setting S3 Bucket Policy for CloudFront OAC access...");
    const putCommand = new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(policy),
    });
    const putRes = await s3Client.send(putCommand);
    console.log("Successfully updated S3 Bucket Policy!", putRes);

    console.log("Verifying S3 Bucket Policy...");
    const getCommand = new GetBucketPolicyCommand({ Bucket: bucketName });
    const getRes = await s3Client.send(getCommand);
    console.log("Current S3 Bucket Policy:", getRes.Policy);
  } catch (err) {
    console.error("Error setting S3 Bucket Policy:", err);
  }
}

setBucketPolicy();
