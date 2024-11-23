// ipfs.js

import axios from "axios";

// Load Pinata JWT from environment variables
const pinataJwt = import.meta.env.VITE_PINATA_JWT;

// Validate the Pinata JWT presence
if (!pinataJwt) {
  throw new Error("Pinata JWT is missing. Check your .env file.");
}

// Define the IPFS gateway URL
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

/**
 * Upload content to Pinata's IPFS service
 * @param {Object|Blob|File} content - The content to upload. Can be a JSON object or a file/blob.
 * @param {boolean} isFile - Whether the content is a file/blob. Defaults to `false`.
 * @returns {Promise<string>} - The CID of the uploaded content
 */
export const uploadToIPFS = async (content, isFile = false) => {
  const url = isFile
    ? "https://api.pinata.cloud/pinning/pinFileToIPFS"
    : "https://api.pinata.cloud/pinning/pinJSONToIPFS";

  const headers = {
    Authorization: `Bearer ${pinataJwt}`,
    ...(isFile ? {} : { "Content-Type": "application/json" }),
  };

  // Prepare body for file or JSON upload
  const body = isFile
    ? (() => {
        const formData = new FormData();
        formData.append("file", content);
        return formData;
      })()
    : content;

  // Log the content being uploaded for debugging
  console.log("Uploading to IPFS:", content);

  try {
    const response = await axios.post(url, body, { headers });
    console.log('Uploaded to IPFS. CID:', response.data.IpfsHash);
    alert(`Content uploaded to IPFS. CID: ${response.data.IpfsHash}`);
    return response.data.IpfsHash; // Return the IPFS CID
  } catch (error) {
    console.error("Error uploading to IPFS:", error.response?.data || error.message);
    throw new Error("Failed to upload content to IPFS.");
  }
};

/**
 * Fetch content from IPFS
 * @param {string} cid - IPFS CID of the file or JSON
 * @returns {Promise<any>} - The content retrieved from IPFS
 */
export const fetchFromIPFS = async (cid) => {
  const url = `${IPFS_GATEWAY}${cid}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching from IPFS:", error.message || error);
    throw new Error("Failed to fetch content from IPFS. Check the CID or IPFS gateway.");
  }
};

/**
 * Verify content integrity using SHA-256 hash
 * @param {Object|Blob|File} content - The content to verify
 * @param {string} expectedHash - The expected SHA-256 hash
 * @returns {Promise<boolean>} - Whether the hash matches
 */
export const verifyContentHash = async (content, expectedHash) => {
  try {
    const contentString =
      content instanceof Blob || content instanceof File
        ? await content.text()
        : JSON.stringify(content);
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(contentString)
    );
    const calculatedHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return calculatedHash === expectedHash;
  } catch (error) {
    console.error("Error verifying content hash:", error);
    throw new Error("Failed to verify content hash.");
  }
};
