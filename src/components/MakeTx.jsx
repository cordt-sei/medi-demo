// MakeTx.jsx

import React, { useState } from "react";
import PropTypes from "prop-types";
import { parseEther, createWalletClient, createPublicClient, http, custom } from "viem";
import { fetchFromIPFS, uploadToIPFS } from "../utils/ipfs";
import { Buffer } from "buffer";

export const MakeTx = ({ metadataCID, walletAddress, walletClient }) => {
  console.log("MakeTx Props:", { metadataCID, walletAddress, walletClient });

  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(false);

  // Check MetaMask connection
  const checkMetaMaskConnection = async () => {
    const isMetaMaskConnected = window.ethereum && window.ethereum.isConnected();
    if (!isMetaMaskConnected) {
      throw new Error("MetaMask is not connected. Please reconnect.");
    }
  };

  const handleSubmit = async () => {
    try {
        if (!window.ethereum || !window.ethereum.isMetaMask) {
            throw new Error("MetaMask is not installed or not active.");
        }

        if (!walletClient || !publicClient) {
            console.error("Wallet client or public client is not initialized.");
            return;
        }

        setLoading(true);
        console.log("Fetching metadata from IPFS...");
        const metadata = await fetchFromIPFS(metadataCID);

        console.log("Hashing metadata...");
        const metadataHashBuffer = await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(JSON.stringify(metadata))
        );
        const metadataHash = Array.from(new Uint8Array(metadataHashBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        console.log("Uploading metadata hash to IPFS...");
        const metadataHashCID = await uploadToIPFS({ hash: metadataHash });

        console.log("Building transaction data...");
        const txData = {
            image: { cid: metadataCID, hash: metadataHash },
            uploader: walletAddress,
            license: {
                type: "CC-BY-4.0",
                repository:
                    "https://gist.githubusercontent.com/cordt-sei/bbcc2356d3c8d7f6c2b8f2e082751fdc/raw/8b52e2120b8b6a4209b1ef3c89925a667c4903e2/license.txt",
                hash_of_full_text: metadataHashCID,
            },
        };

        const tx = {
            from: walletAddress,
            to: walletAddress,
            value: parseEther("0.0000000001"),
            data: `0x${Buffer.from(JSON.stringify(txData)).toString("hex")}`,
        };

        console.log("Estimating gas...");
        let gasEstimate;
        try {
            gasEstimate = await walletClient.request({
                method: "eth_estimateGas",
                params: [tx],
            });
        } catch (error) {
            console.warn("Gas estimation failed, using fallback:", error);
            gasEstimate = "0x5208"; // 21000 gas units
        }

        console.log("Sending transaction...");
        const transactionHash = await walletClient.request({
            method: "eth_sendTransaction",
            params: [{ ...tx, gas: gasEstimate }],
        });

        setTransactionHash(transactionHash);
        alert(
            `Transaction submitted! View it at https://testnet.seistream.app/transactions/${transactionHash}`
        );
    } catch (error) {
        console.error("Error submitting transaction:", error);
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
};
