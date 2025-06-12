"use client"
import { useState } from "react";
import LaunchPad from "../LaunchPad/LaunchPad";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Rocket, ArrowLeftRight, Send, Wallet, X } from 'lucide-react';
import '@solana/wallet-adapter-react-ui/styles.css';

// Custom Wallet Button Component
function CustomWalletButton() {
    const { connected, disconnect } = useWallet();
    const [showDisconnect, setShowDisconnect] = useState(false);

    if (connected) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowDisconnect(!showDisconnect)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                >
                    <Wallet className="w-4 h-4" />
                    <span>Connected</span>
                </button>
                {showDisconnect && (
                    <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                        <button
                            onClick={() => {
                                disconnect();
                                setShowDisconnect(false);
                            }}
                            className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg w-full text-left"
                        >
                            <X className="w-4 h-4" />
                            <span>Disconnect</span>
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return <WalletMultiButton className="!bg-purple-600 !hover:bg-purple-700" />;
}

// Swap Component
function SwapComponent() {
    const [fromToken, setFromToken] = useState("");
    const [toToken, setToToken] = useState("");
    const [amount, setAmount] = useState("");

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 pt-24">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <ArrowLeftRight className="w-12 h-12 text-purple-400 mr-3" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                            Token Swap
                        </h1>
                    </div>
                    <p className="text-gray-300 text-lg">Swap your tokens instantly</p>
                </div>

                <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">From Token</label>
                            <input
                                type="text"
                                value={fromToken}
                                onChange={(e) => setFromToken(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                placeholder="Enter token address or symbol"
                            />
                        </div>

                        <div className="flex justify-center">
                            <button className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors">
                                <ArrowLeftRight className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">To Token</label>
                            <input
                                type="text"
                                value={toToken}
                                onChange={(e) => setToToken(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                placeholder="Enter token address or symbol"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                placeholder="0.00"
                            />
                        </div>

                        <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all">
                            Swap Tokens
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Send Token Component
function SendTokenComponent() {
    const [recipientAddress, setRecipientAddress] = useState("");
    const [tokenAddress, setTokenAddress] = useState("");
    const [amount, setAmount] = useState("");

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 pt-24">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Send className="w-12 h-12 text-purple-400 mr-3" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                            Send Tokens
                        </h1>
                    </div>
                    <p className="text-gray-300 text-lg">Send tokens to any Solana address</p>
                </div>

                <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Recipient Address</label>
                            <input
                                type="text"
                                value={recipientAddress}
                                onChange={(e) => setRecipientAddress(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                placeholder="Enter recipient's wallet address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Token Address</label>
                            <input
                                type="text"
                                value={tokenAddress}
                                onChange={(e) => setTokenAddress(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                placeholder="Enter token mint address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                placeholder="Enter amount to send"
                            />
                        </div>

                        <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all">
                            Send Tokens
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main Dashboard Component
function DashBoard() {
    const [activeTab, setActiveTab] = useState('create');

    const navItems = [
        { id: 'create', label: 'Create Token', icon: Rocket },
        { id: 'swap', label: 'Swap', icon: ArrowLeftRight },
        { id: 'send', label: 'Send Token', icon: Send }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'create':
                return <LaunchPad />;
            case 'swap':
                return <SwapComponent />;
            case 'send':
                return <SendTokenComponent />;
            default:
                return <LaunchPad />;
        }
    };

    return (
        <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
                        {/* Fixed Navbar */}
                        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex items-center justify-between h-16">
                                    {/* Logo */}
                                    <div className="flex items-center">
                                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-500 bg-clip-text text-transparent">
                                            SolX
                                        </h1>
                                    </div>

                                    {/* Navigation Tabs */}
                                    <div className="hidden md:flex items-center space-x-1">
                                        {navItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setActiveTab(item.id)}
                                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                        activeTab === item.id
                                                            ? 'bg-purple-600 text-white shadow-lg'
                                                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                                    }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span>{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Wallet Button */}
                                    <div className="flex items-center">
                                        <CustomWalletButton />
                                    </div>
                                </div>

                                {/* Mobile Navigation */}
                                <div className="md:hidden pb-4">
                                    <div className="flex space-x-1">
                                        {navItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setActiveTab(item.id)}
                                                    className={`flex-1 flex flex-col items-center space-y-1 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                                        activeTab === item.id
                                                            ? 'bg-purple-600 text-white'
                                                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                                    }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span>{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </nav>

                        {/* Content */}
                        <div className="pt-16">
                            {renderContent()}
                        </div>
                    </div>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default DashBoard;