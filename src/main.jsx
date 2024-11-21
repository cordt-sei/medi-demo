import React, { useState } from "react";
import { WalletConnect } from "./components/WalletConnect";
import MetadataUploader from "./components/MetadataUploader";
import SubmitTransaction from "./components/SubmitTransaction";

const App = () => {
  const [metadataCID, setMetadataCID] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  return (
    <WalletConnect>
      <div>
        <h1>IPFS License Demo</h1>
        <MetadataUploader setMetadataCID={setMetadataCID} />
        <SubmitTransaction metadataCID={metadataCID} walletAddress={walletAddress} />
      </div>
    </WalletConnect>
  );
};

export default App;
