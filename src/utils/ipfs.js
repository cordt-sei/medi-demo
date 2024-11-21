import axios from "axios";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

if (!PINATA_JWT) {
  throw new Error("Pinata JWT is missing. Check your .env file.");
}

export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

/**
 * Upload a file to Pinata's IPFS service
 * @param {File|Blob|Buffer} file - File to upload
 * @returns {Promise<string>} - CID of the uploaded file
 */
export const uploadFileToIPFS = async (file) => {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.IpfsHash; // Returns the CID
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw new Error("Failed to upload file to IPFS.");
  }
};

/**
 * Upload JSON metadata to Pinata's IPFS service
 * @param {Object} json - JSON object to upload
 * @returns {Promise<string>} - CID of the uploaded JSON
 */
export const uploadJsonToIPFS = async (json) => {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

  try {
    const response = await axios.post(url, json, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.IpfsHash; // Returns the CID
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error);
    throw new Error("Failed to upload JSON to IPFS.");
  }
};

/**
 * Fetch a file or JSON from IPFS
 * @param {string} cid - IPFS CID of the file or JSON
 * @returns {Promise<any>} - The file or JSON content
 */
export const fetchFromIPFS = async (cid) => {
  const url = `${IPFS_GATEWAY}${cid}`;
  try {
    const response = await axios.get(url);
    return response.data; // Return the file or JSON content
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    throw new Error("Failed to fetch content from IPFS.");
  }
};
