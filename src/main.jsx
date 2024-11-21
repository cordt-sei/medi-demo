import React, { useState } from "react";
import { WalletConnect } from "./components/WalletConnect";
import MetadataClient from "./components/MetadataClient";
import { MakeTx } from "./components/MakeTx";

const App = () => {
  const [metadataCID, setMetadataCID] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  return (
    <WalletConnect>
      <div>
        <h1>IPFS License Demo</h1>
        <MetadataClient setMetadataCID={setMetadataCID} />
        <MakeTx metadataCID={metadataCID} walletAddress={walletAddress} />
      </div>
    </WalletConnect>
  );
};

export default App;
