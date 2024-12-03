import { simpleFetch, SimpleFetchResponse } from "@keplr-wallet/simple-fetch";

type Response = {
  otp: string;
} | null;

export async function uploadToS3(
  encryptedData: string
): Promise<SimpleFetchResponse<Response>["data"]> {
  const postEndpoint =
    process.env["KEPLR_EXT_LINK_MOBILE_POST_ENDPOINT"] ??
    "https://p56p7lfgkbcssbsroxjb6amexu0ybdxt.lambda-url.us-west-2.on.aws";

  if (!postEndpoint) {
    throw new Error("KEPLR_EXT_LINK_MOBILE_POST_ENDPOINT is not set");
  }

  const response = await simpleFetch<Response>(postEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: encryptedData }),
  });

  if (response.status !== 200) {
    throw new Error("Failed to upload to S3");
  }

  return response.data;
}
