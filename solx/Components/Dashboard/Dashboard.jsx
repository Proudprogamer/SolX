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
import Swap from "../Swap/Swap";

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


// Main Dashboard Component
function DashBoard() {
    const [activeTab, setActiveTab] = useState('create');

    const navItems = [
        { id: 'create', label: 'Create Token', icon: Rocket },
        { id: 'swap', label: 'Swap', icon: ArrowLeftRight }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'create':
                return <LaunchPad />;
            case 'swap':
                return <Swap />;
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