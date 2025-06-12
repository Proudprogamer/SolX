"use client"
import { useState } from "react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_2022_PROGRAM_ID, getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType, getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, createMintToInstruction } from "@solana/spl-token"
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';

function LaunchPad(){

    const [tokenName, settokenName] = useState("");
    const [tokenSymbol, settokenSymbol] = useState("");
    const [decimals, setdecimals] = useState();
    const [description, setdescription] = useState("");
    const [imageURL, setimageURL] = useState("");
    const [created, setcreated] = useState(false);
    const [associatedToken, setassociatedToken] = useState();
    const [mintKeypair, setmintKeypair] = useState();
    const [initialSupply, setinitialSupply] = useState();

    const { connection } = useConnection();
    const wallet = useWallet();

    const handleSubmit=async(e)=>{

        const uri = {
            "name": tokenName,
            "symbol": tokenSymbol,
            "description": description,
            "image": imageURL,
            "attributes": [],
            "external_url": "",
            "properties": {
                "files": [],
                "category": "image"
            }
        }


        e.preventDefault();

        const mintKeypair = Keypair.generate();
        setmintKeypair(mintKeypair);
        const metadata = {
            mint: mintKeypair.publicKey,
            name: tokenName,
            symbol: tokenSymbol,
            uri,
            additionalMetadata: [],
        };

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(mintKeypair.publicKey, decimals, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: mintKeypair.publicKey,
                metadata: mintKeypair.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            }),
        );
            
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintKeypair);
        
        try{
            await wallet.sendTransaction(transaction, connection);
            const associatedToken = getAssociatedTokenAddressSync(
                mintKeypair.publicKey,
                wallet.publicKey,
                false,
                TOKEN_2022_PROGRAM_ID,
            );

            
            console.log("Token created!");
            setassociatedToken(associatedToken);
            setcreated(true);
            const transaction2 = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    associatedToken,
                    wallet.publicKey,
                    mintKeypair.publicKey,
                    TOKEN_2022_PROGRAM_ID,
                ),
            );

            await wallet.sendTransaction(transaction2, connection);

            const transaction3 = new Transaction().add(
                createMintToInstruction(mintKeypair.publicKey, associatedToken, wallet.publicKey, initialSupply * (10**decimals), [], TOKEN_2022_PROGRAM_ID)
            );

            try{
                await wallet.sendTransaction(transaction3, connection);
            }
            catch(error)
            {
                console.log("user rejected the transaction");
            }
        }
        catch(error)
        {
            console.log("user rejected the transaction!");
        }
    }
    
    return(
        <div>
           <form className="w-100" onSubmit={(e)=>handleSubmit(e)}>
            <div>Token LaunchPad</div>
            {
                associatedToken && 
                <div>
                    Token created successfully!
                    Token mint address : {associatedToken.toBase58()}
                </div>
            }

            <label htmlFor="token-name">Token Name :</label>
            <br></br>
            <input onChange={(e)=>{settokenName(e.target.value)}} className="border-1 border-bg-gray-700" id="token-name"></input>
            <br></br>

            <label htmlFor="token-symbol">Token Symbol :</label>
            <br></br>
            <input onChange={(e)=>{settokenSymbol(e.target.value)}} className="border-1 border-bg-gray-700" id="token-symbol"></input>
            <br></br>

            <label htmlFor="token-decimals">Token decimals :</label>
            <br></br>
            <input onChange={(e)=>{setdecimals(e.target.value)}} className="border-1 border-bg-gray-700" id="token-decimals"></input>
            <br></br>

            <label htmlFor="token-supply">Token supply :</label>
            <br></br>
            <input onChange={(e)=>{setinitialSupply(e.target.value)}} className="border-1 border-bg-gray-700" id="token-supply"></input>
            <br></br>

            <label htmlFor="token-description">Token description :</label>
            <br></br>
            <input onChange={(e)=>{setdescription(e.target.value)}} className="border-1 border-bg-gray-700" id="token-description"></input>
            <br></br>

            <label htmlFor="token-image-url">Image Url :</label>
            <br></br>
            <input onChange={(e)=>{setimageURL(e.target.value)}} className="border-1 border-bg-gray-700" id="token-image-url"></input>
            <br></br>

            <button type="submit" className="bg-white rounded-lg p-2 text-black">Launch Token</button>
            
           </form>
        </div>
    )
}

export default LaunchPad;