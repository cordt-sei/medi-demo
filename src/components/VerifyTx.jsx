// VerifyTx.jsx

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { fetchFromIPFS } from "../utils/ipfs";
import { LICENSE_TEXT } from "../assets/license";

const VerifyTx = ({ txHash, publicClient }) => {
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  VerifyTx.propTypes = {
    txHash: PropTypes.string.isRequired,
    publicClient: PropTypes.object.isRequired,
  };

  useEffect(() => {
    const verifyTransaction = async () => {
      if (!txHash || !publicClient) return;

      setLoading(true);

      try {
        console.log("Fetching transaction data...");
        const transaction = await publicClient.getTransaction({
          hash: txHash,
        });

        if (!transaction?.data) {
          throw new Error("Transaction data field is empty or invalid.");
        }

        console.log("Decoding transaction data...");
        const decodedData = JSON.parse(
          Buffer.from(transaction.data.slice(2), "hex").toString("utf-8")
        );

        console.log("Decoded data:", decodedData);

        console.log("Hashing license text for verification...");
        const licenseHashBuffer = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(LICENSE_TEXT.trim())
        );
        const calculatedLicenseHash = Array.from(
          new Uint8Array(licenseHashBuffer)
        )
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        console.log("Verifying license hash...");
        if (decodedData.license.hash_of_full_text !== calculatedLicenseHash) {
          throw new Error("License hash does not match!");
        }

        setVerificationResult({
          valid: true,
          decodedData,
        });
      } catch (error) {
        console.error("Error verifying transaction:", error);
        setVerificationResult({
          valid: false,
          error: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    verifyTransaction();
  }, [txHash, publicClient]);

  if (loading) {
    return <p>Verifying transaction...</p>;
  }

  return (
    <div>
      {verificationResult ? (
        verificationResult.valid ? (
          <div>
            <p>Transaction Verified Successfully!</p>
            <pre>{JSON.stringify(verificationResult.decodedData, null, 2)}</pre>
            <a
              href={`https://seitrace.com/tx/${txHash}?chain=atlantic-2`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on SeiTrace
            </a>
          </div>
        ) : (
          <div>
            <p style={{ color: "red" }}>Transaction Verification Failed!</p>
            <p>{verificationResult.error}</p>
          </div>
        )
      ) : (
        <p>No transaction to verify.</p>
      )}
    </div>
  );
};

export default VerifyTx;
