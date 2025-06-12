"use client"
import { useState } from "react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_2022_PROGRAM_ID, getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType, getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, createMintToInstruction } from "@solana/spl-token"
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { Copy, CheckCircle, AlertCircle, Loader2, Rocket } from 'lucide-react';

function LaunchPad() {
    const [tokenName, setTokenName] = useState("");
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [decimals, setDecimals] = useState("");
    const [description, setDescription] = useState("");
    const [imageURL, setImageURL] = useState("");
    const [created, setCreated] = useState(false);
    const [associatedToken, setAssociatedToken] = useState(null);
    const [mintKeypair, setMintKeypair] = useState(null);
    const [initialSupply, setInitialSupply] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [copied, setCopied] = useState(false);

    const { connection } = useConnection();
    const wallet = useWallet();

    const validateForm = () => {
        const newErrors = {};

        if (!tokenName.trim()) newErrors.tokenName = "Token name is required";
        if (!tokenSymbol.trim()) newErrors.tokenSymbol = "Token symbol is required";
        if (tokenSymbol.length > 10) newErrors.tokenSymbol = "Symbol must be 10 characters or less";
        
        const decimalNum = parseInt(decimals);
        if (!decimals || isNaN(decimalNum) || decimalNum < 1 || decimalNum > 9) {
            newErrors.decimals = "Decimals must be between 1-9";
        }

        const supplyNum = parseFloat(initialSupply);
        if (!initialSupply || isNaN(supplyNum) || supplyNum <= 0) {
            newErrors.initialSupply = "Initial supply must be a positive number";
        }

        if (!description.trim()) newErrors.description = "Description is required";
        
        if (imageURL && !isValidUrl(imageURL)) {
            newErrors.imageURL = "Please enter a valid URL";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        if (!wallet.connected) {
            setErrors({ general: "Please connect your wallet first" });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
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
            };

            const mintKeypair = Keypair.generate();
            setMintKeypair(mintKeypair);
            
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
                createInitializeMintInstruction(mintKeypair.publicKey, parseInt(decimals), wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
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
            
            await wallet.sendTransaction(transaction, connection);
            
            const associatedToken = getAssociatedTokenAddressSync(
                mintKeypair.publicKey,
                wallet.publicKey,
                false,
                TOKEN_2022_PROGRAM_ID,
            );

            setAssociatedToken(associatedToken);
            setCreated(true);

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
                createMintToInstruction(
                    mintKeypair.publicKey, 
                    associatedToken, 
                    wallet.publicKey, 
                    parseFloat(initialSupply) * (10 ** parseInt(decimals)), 
                    [], 
                    TOKEN_2022_PROGRAM_ID
                )
            );

            await wallet.sendTransaction(transaction3, connection);

        } catch (error) {
            console.error("Transaction error:", error);
            setErrors({ general: error.message || "Transaction failed. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Rocket className="w-12 h-12 text-purple-400 mr-3" />
                        <h1 className="text-4xl md:text-6xl font-bold bg-white bg-clip-text text-transparent">
                            Token LaunchPad
                        </h1>
                    </div>
                    <p className="text-gray-300 text-lg">Create your own Solana SPL Token with metadata</p>
                </div>

                {/* Success Message */}
                {created && associatedToken && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center mb-4">
                            <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                            <h3 className="text-xl font-semibold text-green-400">Token Created Successfully!</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-300 mb-1">Token Mint Address:</p>
                                <div className="flex items-center space-x-2 p-3 bg-black/30 rounded-lg">
                                    <code className="text-sm text-green-400 font-mono flex-1 break-all">
                                        {mintKeypair?.publicKey.toBase58()}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(mintKeypair?.publicKey.toBase58())}
                                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Copy mint address"
                                    >
                                        {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-300 mb-1">Associated Token Address:</p>
                                <div className="flex items-center space-x-2 p-3 bg-black/30 rounded-lg">
                                    <code className="text-sm text-blue-400 font-mono flex-1 break-all">
                                        {associatedToken.toBase58()}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(associatedToken.toBase58())}
                                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Copy token address"
                                    >
                                        {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {errors.general && (
                    <div className="mb-6 p-4 bg-red-900/50 border border-red-500/30 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                            <p className="text-red-400">{errors.general}</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Token Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-200">
                                Token Name *
                            </label>
                            <input
                                type="text"
                                value={tokenName}
                                onChange={(e) => setTokenName(e.target.value)}
                                className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.tokenName ? 'border-red-500' : 'border-gray-600'} rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all`}
                                placeholder="e.g., My Awesome Token"
                                disabled={isLoading}
                            />
                            {errors.tokenName && <p className="text-red-400 text-sm">{errors.tokenName}</p>}
                        </div>

                        {/* Token Symbol */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-200">
                                Token Symbol *
                            </label>
                            <input
                                type="text"
                                value={tokenSymbol}
                                onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                                className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.tokenSymbol ? 'border-red-500' : 'border-gray-600'} rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all`}
                                placeholder="e.g., MAT"
                                maxLength={10}
                                disabled={isLoading}
                            />
                            {errors.tokenSymbol && <p className="text-red-400 text-sm">{errors.tokenSymbol}</p>}
                        </div>

                        {/* Decimals */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-200">
                                Decimals (1-9) *
                            </label>
                            <select
                                value={decimals}
                                onChange={(e) => setDecimals(e.target.value)}
                                className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.decimals ? 'border-red-500' : 'border-gray-600'} rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all`}
                                disabled={isLoading}
                            >
                                <option value="">Select decimals</option>
                                {[1,2,3,4,5,6,7,8,9].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                            {errors.decimals && <p className="text-red-400 text-sm">{errors.decimals}</p>}
                        </div>

                        {/* Initial Supply */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-200">
                                Initial Supply *
                            </label>
                            <input
                                type="number"
                                value={initialSupply}
                                onChange={(e) => setInitialSupply(e.target.value)}
                                className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.initialSupply ? 'border-red-500' : 'border-gray-600'} rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all`}
                                placeholder="e.g., 1000000"
                                min="0"
                                step="any"
                                disabled={isLoading}
                            />
                            {errors.initialSupply && <p className="text-red-400 text-sm">{errors.initialSupply}</p>}
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-sm font-medium text-gray-200">
                                Description *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.description ? 'border-red-500' : 'border-gray-600'} rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all h-24 resize-none`}
                                placeholder="Describe your token's purpose and features..."
                                disabled={isLoading}
                            />
                            {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
                        </div>

                        {/* Image URL */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-sm font-medium text-gray-200">
                                Image URL (Optional)
                            </label>
                            <input
                                type="url"
                                value={imageURL}
                                onChange={(e) => setImageURL(e.target.value)}
                                className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.imageURL ? 'border-red-500' : 'border-gray-600'} rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all`}
                                placeholder="https://example.com/token-image.png"
                                disabled={isLoading}
                            />
                            {errors.imageURL && <p className="text-red-400 text-sm">{errors.imageURL}</p>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !wallet.connected}
                            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Creating Token...
                                </div>
                            ) : !wallet.connected ? (
                                "Connect Wallet First"
                            ) : (
                                <div className="flex items-center justify-center">
                                    <Rocket className="w-5 h-5 mr-2" />
                                    Launch Token
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Wallet Connection Status */}
                    {!wallet.connected && (
                        <div className="mt-4 p-4 bg-yellow-900/50 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                                <p className="text-yellow-400">Please connect your Solana wallet to create tokens</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LaunchPad;