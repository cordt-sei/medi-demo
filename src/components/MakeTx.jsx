// MakeTx.jsx

import React, { useState } from "react";
import PropTypes from "prop-types";
import { parseEther } from "viem";
import { fetchFromIPFS, uploadToIPFS } from "../utils/ipfs";
import { Buffer } from "buffer";
import { hashFile } from "../utils/hash";

export const MakeTx = ({
  metadataCID,
  walletAddress,
  walletClient,
  selectedLicense,
  licenseRepo,
}) => {
  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLicenseText = async (repo) => {
    if (repo.startsWith('/licenses/')) {
      // Local file for development
      const response = await fetch(repo);
      if (!response.ok) {
        throw new Error(`Failed to fetch license text from ${repo}`);
      }
      return await response.text();
    } else if (repo.startsWith('http') || repo.startsWith('https')) {
      // Remote URL
      const response = await fetch(repo);
      if (!response.ok) {
        throw new Error(`Failed to fetch license text from ${repo}`);
      }
      return await response.text();
    } else {
      // IPFS CID
      return await fetchFromIPFS(repo);
    }
  };

  const handleSubmit = async () => {
    if (!metadataCID || !walletAddress || !walletClient || !selectedLicense || !licenseRepo) {
      alert("Missing required fields. Please ensure all inputs are provided.");
      return;
    }

    try {
      setLoading(true);

      // 1. Fetch the full file data from IPFS
      console.log("Fetching metadata from IPFS...");
      const fileData = await fetchFromIPFS(metadataCID);

      // 1.b) Add the metadata CID to the JSON
      const txData = {
        image: {
          cid: metadataCID,
        },
      };

      // 2.a) Hash the file data
      console.log("Hashing metadata...");
      const metadataHash = await hashFile(new Blob([JSON.stringify(fileData)]));

      // 2.b) Add the hash to the JSON
      txData.image.hash = metadataHash;

      // 3.a) Add the user-selected license type to the JSON
      txData.license = {
        type: selectedLicense,
      };

      // 3.b) Fetch the license text from the repository
      console.log("Fetching license text...");
      const licenseText = await fetchLicenseText(licenseRepo);

      // 3.c) Hash the full license text, then add it to the JSON
      console.log("Hashing license text...");
      const licenseHash = await hashFile(new Blob([licenseText]));
      txData.license.repository = licenseRepo;
      txData.license.hash_of_full_text = licenseHash;

      // 4. Add the user's wallet address to the JSON
      txData.uploader = walletAddress;

      // 5.a) Hash the finalized JSON locally before uploading
      console.log("Hashing transaction data...");
      const txDataHash = await hashFile(new Blob([JSON.stringify(txData)]));

      // 5.b) Upload the finalized JSON to IPFS
      console.log("Uploading transaction data to IPFS...");
      const uploadedJsonCID = await uploadToIPFS(txData);

      // 6. Convert the hash to hex for inclusion in the transaction data
      const hexData = `0x${Buffer.from(JSON.stringify(txData)).toString("hex")}`;

      console.log("Constructing transaction...");
      const tx = {
        from: walletAddress,
        to: walletAddress, // Assuming a self-signed transaction for simplicity
        value: parseEther("0.0000000001"), // Minimal transaction value
        data: hexData, // Include the transaction JSON as hex
      };

      // Estimate gas and sign/broadcast the transaction
      console.log("Estimating gas...");
      const gasEstimate = await walletClient.request({
        method: "eth_estimateGas",
        params: [tx],
      }).catch(() => "50000"); // Fallback if gas estimation fails

      console.log("Sending transaction...");
      const txHash = await walletClient.request({
        method: "eth_sendTransaction",
        params: [{ ...tx, gas: gasEstimate }],
      });

      console.log("Transaction submitted:", txHash);
      setTransactionHash(txHash);

      alert(`Transaction submitted! View it at https://testnet.seistream.app/transactions/${txHash}`);
    } catch (error) {
      console.error("Error during transaction processing:", error);
      alert("Transaction failed. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Submit Transaction</h3>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
      {transactionHash && (
        <p>
          Transaction Hash:{" "}
          <a
            href={`https://testnet.seistream.app/transactions/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {transactionHash}
          </a>
        </p>
      )}
    </div>
  );
};

MakeTx.propTypes = {
  metadataCID: PropTypes.string.isRequired,
  walletAddress: PropTypes.string.isRequired,
  walletClient: PropTypes.object.isRequired,
  selectedLicense: PropTypes.string.isRequired,
  licenseRepo: PropTypes.string.isRequired,
};
