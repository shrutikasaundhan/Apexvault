import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1"
});

export const createdUploadSignedUrl = async ({ key, contentType }) => {
  const command = new PutObjectCommand({
    Bucket: "shruti-storage-app",
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
    signableHeaders: new Set(["content-type"]),
  });

  return url;
};


export const createGetSignedUrl = async ({ key, download = false, filename }) => {
  const command = new GetObjectCommand({
    Bucket: "shruti-storage-app",
    Key: key,
    ResponseContentDisposition: `${download ? 'attachment' : 'inline'};filename=${encodeURIComponent(filename)}`
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 300,

  });

  return url;

}


export const getS3FileMetaData = async (key) => {

  const command = new HeadObjectCommand({
    Bucket: "shruti-storage-app",
    Key: key,

  });
  return await s3Client.send(command)

}

export const deleteS3File = async (key) => {

  const command = new DeleteObjectCommand({
    Bucket: "shruti-storage-app",
    Key: key,

  });
  return await s3Client.send(command)

}

export const deleteS3Files = async (keys) => {

  const command = new DeleteObjectsCommand({
    Bucket: "shruti-storage-app",
    Delete: {
      Objects: keys,
      Quiet: false,
      
    }
  })
  return await s3Client.send(command)

}

