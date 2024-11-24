// VerifyTx.jsx

import React, { useState } from "react";
import PropTypes from "prop-types";
import { fetchFromIPFS } from "../utils/ipfs";
import { hashFile } from "../utils/hash";
import axios from "axios";

export const VerifyTx = ({ 
  metadataCID, 
  licenseSource, // Either a URL or an IPFS CID
  expectedMetadataHash, 
  expectedLicenseHash 
}) => {
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLicenseContent = async (source) => {
    try {
      if (source.startsWith("http")) {
        // Fetch license content from a URL
        console.log("Fetching license content from URL...");
        const response = await axios.get(source);
        return response.data;
      } else {
        // Fetch license content from IPFS
        console.log("Fetching license content from IPFS...");
        return await fetchFromIPFS(source);
      }
    } catch (error) {
      console.error("Error fetching license content:", error);
      throw new Error("Failed to fetch license content.");
    }
  };

  const handleVerify = async () => {
    if (!metadataCID || !licenseSource || !expectedMetadataHash || !expectedLicenseHash) {
      alert("Missing required fields. Please ensure all inputs are provided.");
      return;
    }

    try {
      setLoading(true);
      let result = { metadataVerified: false, licenseVerified: false };

      // Step 1: Fetch metadata from IPFS
      console.log("Fetching metadata from IPFS...");
      const metadata = await fetchFromIPFS(metadataCID);

      // Step 2: Hash the metadata and compare with the expected hash
      console.log("Hashing metadata...");
      const metadataHash = await hashFile(new Blob([JSON.stringify(metadata)]));
      if (metadataHash === expectedMetadataHash) {
        result.metadataVerified = true;
        console.log("Metadata hash verified successfully.");
      } else {
        console.warn("Metadata hash does not match.");
      }

      // Step 3: Fetch license content
      console.log("Fetching license content...");
      const licenseContent = await fetchLicenseContent(licenseSource);

      // Step 4: Hash the license content and compare with the expected hash
      console.log("Hashing license content...");
      const licenseHash = await hashFile(new Blob([licenseContent]));
      if (licenseHash === expectedLicenseHash) {
        result.licenseVerified = true;
        console.log("License hash verified successfully.");
      } else {
        console.warn("License hash does not match.");
      }

      // Store verification results
      setVerificationResult(result);
    } catch (error) {
      console.error("Error during verification:", error);
      alert("Verification failed. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Verify Transaction Data</h3>
      <button onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </button>
      {verificationResult && (
        <div>
          <p>Metadata Verified: {verificationResult.metadataVerified ? "✅ Yes" : "❌ No"}</p>
          <p>License Verified: {verificationResult.licenseVerified ? "✅ Yes" : "❌ No"}</p>
        </div>
      )}
    </div>
  );
};

VerifyTx.propTypes = {
  metadataCID: PropTypes.string.isRequired, // IPFS CID of the metadata file
  licenseSource: PropTypes.string.isRequired, // URL or IPFS CID of the license text
  expectedMetadataHash: PropTypes.string.isRequired, // Expected hash of the metadata
  expectedLicenseHash: PropTypes.string.isRequired, // Expected hash of the license text
};
