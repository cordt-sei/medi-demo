// hash.js

/**
 * Hashes a file or data using the SHA-256 algorithm.
 * @param {File|Blob|Buffer|ArrayBuffer} file - The file or data to hash
 * @returns {Promise<string>} - The SHA-256 hash as a hex string
 */
export const hashFile = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (error) {
    console.error("Error hashing file:", error);
    throw new Error("Failed to hash file.");
  }
};

/**
 * Verifies that a given file matches a provided SHA-256 hash.
 * @param {File|Blob|Buffer|ArrayBuffer} file - The file or data to hash and verify
 * @param {string} expectedHash - The expected SHA-256 hash
 * @returns {Promise<boolean>} - True if the hash matches, false otherwise
 */
export const verifyFileHash = async (file, expectedHash) => {
  try {
    const calculatedHash = await hashFile(file);
    return calculatedHash === expectedHash;
  } catch (error) {
    console.error("Error verifying file hash:", error);
    return false;
  }
};
