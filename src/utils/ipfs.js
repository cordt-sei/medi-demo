import axios from "axios";

const pinataJwt = import.meta.env.VITE_PINATA_JWT;

if (!pinataJwt) {
  throw new Error("Pinata JWT is missing. Check your .env file.");
}

export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

/**
 * Upload a file to Pinata's IPFS service
 * @param {File|Blob|Buffer} file - File to upload
 * @returns {Promise<string>} - CID of the uploaded file
 */
export const uploadToIPFS = async (file) => {
  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: file,
  });
  return response.json();
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
