import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import fs from "fs";
import path from "path";

function getPrivateKey() {
  if (process.env.CLOUDFRONT_PRIVATE_KEY) {
    return process.env.CLOUDFRONT_PRIVATE_KEY.replace(/\\n/g, "\n");
  }
  try {
    const keyPath = path.resolve("private_key.pem");
    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, "utf-8");
    }
  } catch (err) {
    console.warn("Could not read private_key.pem directly:", err.message);
  }
  return "";
}

const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID || "K1J5NOS60W19OC";
const distributionName =
  process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN || "d1rnyyplodicpd.cloudfront.net";

export const createCloudFrontGetSignedUrl = ({
  key,
  download = false,
  filename = "file",
}) => {
  const privateKey = getPrivateKey();
  const dateLessThan = new Date(Date.now() + 1000 * 60 * 60).toISOString();
  const safeFilename = filename.replace(/["\r\n]/g, "_");
  const disposition = `${download ? "attachment" : "inline"}; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
  const url = `https://${distributionName}/${key}?response-content-disposition=${encodeURIComponent(disposition)}`;

  const signedUrl = getSignedUrl({
    url,
    keyPairId,
    dateLessThan,
    privateKey,
  });

  return signedUrl;
};
