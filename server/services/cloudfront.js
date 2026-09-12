import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY;
const keyPairId = "K1461ZHAZUY59G";
const distributionName = "d1rnyyplodicpd.cloudfront.net";

export const createCloudFrontGetSignedUrl = ({
  key,
  download = false,
  filename,
}) => {
  const dateLessThan = new Date(Date.now() + 1000 * 60 * 60).toISOString();
  const disposition = `${download ? "attachment" : "inline"}; filename=${filename}`;
  const url = `https://${distributionName}/${key}?response-content-disposition=${encodeURIComponent(disposition)}`;

  const signedUrl = getSignedUrl({
    url,
    keyPairId,
    dateLessThan,
    privateKey,
  });

  return signedUrl;
};
