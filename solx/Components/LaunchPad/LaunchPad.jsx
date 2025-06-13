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
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/3 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gray-500/3 rounded-full blur-3xl"></div>
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8 lg:mb-12">
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative">
                                <Rocket className="w-12 h-12 lg:w-16 lg:h-16 text-white mr-4" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white">
                                    LaunchPad
                                </h1>
                                <div className="h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mt-2"></div>
                            </div>
                        </div>
                        <p className="text-gray-300 text-base lg:text-lg max-w-2xl mx-auto">
                            Create your own Solana SPL Token with metadata on the  solana blockchain
                        </p>
                    </div>

                    {/* Success Message */}
                    {created && associatedToken && (
                        <div className="mb-8 p-4 lg:p-6 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl">
                            <div className="flex items-center mb-4">
                                <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                                <h3 className="text-lg lg:text-xl font-semibold text-green-400">Token Created Successfully!</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-300 mb-2">Token Mint Address:</p>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 p-3 bg-black/40 rounded-lg border border-white/10">
                                        <code className="text-sm text-green-400 font-mono break-all flex-1">
                                            {mintKeypair?.publicKey.toBase58()}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(mintKeypair?.publicKey.toBase58())}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 self-center"
                                            title="Copy mint address"
                                        >
                                            {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-300 mb-2">Associated Token Address:</p>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 p-3 bg-black/40 rounded-lg border border-white/10">
                                        <code className="text-sm text-blue-400 font-mono break-all flex-1">
                                            {associatedToken.toBase58()}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(associatedToken.toBase58())}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 self-center"
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
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                                <p className="text-red-400 text-sm lg:text-base">{errors.general}</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-2xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Token Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white">
                                    Token Name *
                                </label>
                                <input
                                    type="text"
                                    value={tokenName}
                                    onChange={(e) => setTokenName(e.target.value)}
                                    className={`w-full px-4 py-3 bg-black/20 backdrop-blur-sm border ${
                                        errors.tokenName ? 'border-red-500/50' : 'border-white/20 focus:border-white/40'
                                    } rounded-xl focus:ring-2 focus:ring-white/20 focus:outline-none text-white placeholder-gray-400 transition-all duration-200`}
                                    placeholder="e.g., My Awesome Token"
                                    disabled={isLoading}
                                />
                                {errors.tokenName && <p className="text-red-400 text-sm">{errors.tokenName}</p>}
                            </div>

                            {/* Token Symbol */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white">
                                    Token Symbol *
                                </label>
                                <input
                                    type="text"
                                    value={tokenSymbol}
                                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                                    className={`w-full px-4 py-3 bg-black/20 backdrop-blur-sm border ${
                                        errors.tokenSymbol ? 'border-red-500/50' : 'border-white/20 focus:border-white/40'
                                    } rounded-xl focus:ring-2 focus:ring-white/20 focus:outline-none text-white placeholder-gray-400 transition-all duration-200`}
                                    placeholder="e.g., MAT"
                                    maxLength={10}
                                    disabled={isLoading}
                                />
                                {errors.tokenSymbol && <p className="text-red-400 text-sm">{errors.tokenSymbol}</p>}
                            </div>

                            {/* Decimals */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white">
                                    Decimals (1-9) *
                                </label>
                                <select
                                    value={decimals}
                                    onChange={(e) => setDecimals(e.target.value)}
                                    className={`w-full px-4 py-3 bg-black/20 backdrop-blur-sm border ${
                                        errors.decimals ? 'border-red-500/50' : 'border-white/20 focus:border-white/40'
                                    } rounded-xl focus:ring-2 focus:ring-white/20 focus:outline-none text-white transition-all duration-200`}
                                    disabled={isLoading}
                                >
                                    <option value="" className="bg-gray-900">Select decimals</option>
                                    {[1,2,3,4,5,6,7,8,9].map(num => (
                                        <option key={num} value={num} className="bg-gray-900">{num}</option>
                                    ))}
                                </select>
                                {errors.decimals && <p className="text-red-400 text-sm">{errors.decimals}</p>}
                            </div>

                            {/* Initial Supply */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white">
                                    Initial Supply *
                                </label>
                                <input
                                    type="number"
                                    value={initialSupply}
                                    onChange={(e) => setInitialSupply(e.target.value)}
                                    className={`w-full px-4 py-3 bg-black/20 backdrop-blur-sm border ${
                                        errors.initialSupply ? 'border-red-500/50' : 'border-white/20 focus:border-white/40'
                                    } rounded-xl focus:ring-2 focus:ring-white/20 focus:outline-none text-white placeholder-gray-400 transition-all duration-200`}
                                    placeholder="e.g., 1000000"
                                    min="0"
                                    step="any"
                                    disabled={isLoading}
                                />
                                {errors.initialSupply && <p className="text-red-400 text-sm">{errors.initialSupply}</p>}
                            </div>

                            {/* Description */}
                            <div className="lg:col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-white">
                                    Description *
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`w-full px-4 py-3 bg-black/20 backdrop-blur-sm border ${
                                        errors.description ? 'border-red-500/50' : 'border-white/20 focus:border-white/40'
                                    } rounded-xl focus:ring-2 focus:ring-white/20 focus:outline-none text-white placeholder-gray-400 transition-all duration-200 h-24 resize-none`}
                                    placeholder="Describe your token's purpose and features..."
                                    disabled={isLoading}
                                />
                                {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
                            </div>

                            {/* Image URL */}
                            <div className="lg:col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-white">
                                    Image URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={imageURL}
                                    onChange={(e) => setImageURL(e.target.value)}
                                    className={`w-full px-4 py-3 bg-black/20 backdrop-blur-sm border ${
                                        errors.imageURL ? 'border-red-500/50' : 'border-white/20 focus:border-white/40'
                                    } rounded-xl focus:ring-2 focus:ring-white/20 focus:outline-none text-white placeholder-gray-400 transition-all duration-200`}
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
                                className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 disabled:bg-gray-600/30 backdrop-blur-sm border border-white/20 hover:border-white/40 disabled:border-gray-600/30 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.01] disabled:scale-100 shadow-lg disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        <span className="hidden sm:inline">Creating Token...</span>
                                        <span className="sm:hidden">Creating...</span>
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
                            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                                    <p className="text-yellow-400 text-sm lg:text-base">
                                        Please connect your Solana wallet to create tokens
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LaunchPad;