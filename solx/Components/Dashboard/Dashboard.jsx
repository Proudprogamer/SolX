"use client"
import { useState } from "react";
import LaunchPad from "../LaunchPad/LaunchPad";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Rocket, ArrowLeftRight, Send, Wallet, X, Menu } from 'lucide-react';
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
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-300 shadow-lg hover:shadow-white/10"
                >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <Wallet className="w-4 h-4" />
                    <span className="hidden sm:inline">Connected</span>
                </button>
                {showDisconnect && (
                    <div className="absolute top-full right-0 mt-3 bg-black/90 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-2xl z-50 min-w-[160px]">
                        <button
                            onClick={() => {
                                disconnect();
                                setShowDisconnect(false);
                            }}
                            className="flex items-center space-x-2 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg w-full text-left transition-all duration-200"
                        >
                            <X className="w-4 h-4" />
                            <span>Disconnect</span>
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="wallet-adapter-button-trigger">
            <WalletMultiButton 
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: '500',
                    padding: '10px 16px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
            />
        </div>
    );
}

// Main Dashboard Component
function DashBoard() {
    const [activeTab, setActiveTab] = useState('create');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
                        {/* Subtle Background Elements */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-500/5 rounded-full blur-3xl"></div>
                            <div className="absolute top-1/2 left-0 w-64 h-64 bg-white/3 rounded-full blur-2xl"></div>
                        </div>

                        {/* Grid Pattern Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

                        {/* Fixed Navbar */}
                        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex items-center justify-between h-16 lg:h-20">
                                    {/* Logo */}
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <h1 className="text-2xl lg:text-3xl font-bold text-white relative z-10">
                                                SolX
                                            </h1>
                                            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-white via-gray-300 to-white"></div>
                                        </div>
                                    </div>

                                    {/* Desktop Navigation */}
                                    <div className="hidden lg:flex items-center space-x-2">
                                        {navItems.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = activeTab === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setActiveTab(item.id)}
                                                    className={`group relative flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                                                        isActive
                                                            ? 'bg-white/15 text-white shadow-lg border border-white/20 backdrop-blur-md'
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5 backdrop-blur-sm border border-transparent hover:border-white/10'
                                                    }`}
                                                >
                                                    <Icon className={`w-5 h-5 transition-all duration-300 ${
                                                        isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'
                                                    }`} />
                                                    <span className="text-sm font-medium">{item.label}</span>
                                                    {isActive && (
                                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-white rounded-full"></div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Mobile Menu Button & Wallet */}
                                    <div className="flex items-center space-x-3">
                                        <CustomWalletButton />
                                        <button
                                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm"
                                        >
                                            <Menu className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile Navigation Slide-down */}
                                <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                                    mobileMenuOpen ? 'max-h-48 pb-4' : 'max-h-0'
                                }`}>
                                    <div className="pt-4 space-y-2">
                                        {navItems.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = activeTab === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        setActiveTab(item.id);
                                                        setMobileMenuOpen(false);
                                                    }}
                                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                                                        isActive
                                                            ? 'bg-white/15 text-white border border-white/20 backdrop-blur-md'
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5 backdrop-blur-sm border border-transparent hover:border-white/10'
                                                    }`}
                                                >
                                                    <Icon className={`w-5 h-5 ${
                                                        isActive ? 'text-white' : 'text-gray-500'
                                                    }`} />
                                                    <span className="text-sm">{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        </nav>

                        {/* Content */}
                        <div className="pt-16 lg:pt-20 relative z-10">
                            <div className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]">
                                {renderContent()}
                            </div>
                        </div>
                    </div>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default DashBoard;