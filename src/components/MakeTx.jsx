// MakeTx.jsx

import React, { useState } from "react";
import PropTypes from "prop-types";
import { parseEther } from "viem";
import { fetchFromIPFS, uploadToIPFS } from "../utils/ipfs";
import { Buffer } from "buffer";

export const MakeTx = ({ metadataCID, walletAddress, walletClient, publicClient }) => {
  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      // MetaMask readiness check
      if (!window.ethereum || !window.ethereum.isMetaMask) {
        throw new Error("MetaMask is not installed or not active.");
      }

      // Validate walletClient and publicClient
      if (!walletClient || !publicClient) {
        console.error("Wallet client or public client is not initialized.");
        alert("Please connect your wallet properly.");
        return;
      }

      setLoading(true);

      // Fetch metadata from IPFS
      console.log("Fetching metadata from IPFS...");
      const metadata = await fetchFromIPFS(metadataCID);

      // Hash the metadata
      console.log("Hashing metadata...");
      const metadataHashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(JSON.stringify(metadata))
      );
      const metadataHash = Array.from(new Uint8Array(metadataHashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Upload metadata hash to IPFS
      console.log("Uploading metadata hash to IPFS...");
      const metadataHashCID = await uploadToIPFS({ hash: metadataHash });

      // Build transaction data
      console.log("Building transaction data...");
      const txData = {
        image: { cid: metadataCID, hash: metadataHash },
        uploader: walletAddress,
        license: {
          type: "CC-BY-4.0",
          repository:
            "https://gist.githubusercontent.com/cordt-sei/license.txt",
          hash_of_full_text: metadataHashCID,
        },
      };

      const tx = {
        from: walletAddress,
        to: walletAddress,
        value: parseEther("0.0000000001"),
        data: `0x${Buffer.from(JSON.stringify(txData)).toString("hex")}`,
      };

      // Estimate gas
      console.log("Estimating gas...");
      let gasEstimate;
      try {
        gasEstimate = await walletClient.estimateGas({
          ...tx,
        });
      } catch (error) {
        console.warn("Gas estimation failed, using fallback:", error);
        gasEstimate = "21000"; // Default to 21000 gas units
      }

      // Send transaction
      console.log("Sending transaction...");
      const transactionHash = await walletClient.sendTransaction({
        ...tx,
        gas: gasEstimate,
      });

      setTransactionHash(transactionHash);
      alert(`Transaction submitted! Hash: ${transactionHash}`);
    } catch (error) {
      console.error("Transaction Error:", error);
      alert(error.message || "An error occurred while submitting the transaction.");
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
  publicClient: PropTypes.object.isRequired,
};
