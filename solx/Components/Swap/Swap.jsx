import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, VersionedTransaction } from "@solana/web3.js";
// Note: axios is used for API calls - replace with fetch if needed
import { useState } from 'react';
import { ArrowUpDown, Loader2, TrendingUp, Settings, ChevronDown } from 'lucide-react';

// Popular Solana tokens
const POPULAR_TOKENS = [
  { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', name: 'Solana', decimals: 9 },
  { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', name: 'USD Coin', decimals: 6 },
  { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', name: 'Tether USD', decimals: 6 },
  { symbol: 'RAY', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', name: 'Raydium', decimals: 6 },
  { symbol: 'BONK', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', name: 'Bonk', decimals: 5 },
];

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0, 3.0];

function Swap() {
  const [quoteResponse, setQuoteResponse] = useState();
  const [inputToken, setInputToken] = useState(POPULAR_TOKENS[0]);
  const [outputToken, setOutputToken] = useState(POPULAR_TOKENS[1]);
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [inputDropdownOpen, setInputDropdownOpen] = useState(false);
  const [outputDropdownOpen, setOutputDropdownOpen] = useState(false);

  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const wallet = useWallet();

  const swapTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setQuoteResponse(null);
  };

  const swapfunction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const amountInSmallestUnit = Math.floor(parseFloat(amount) * Math.pow(10, inputToken.decimals));
      const slippageBps = Math.floor((customSlippage || slippage) * 100);
      
      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken.mint}&outputMint=${outputToken.mint}&amount=${amountInSmallestUnit}&slippageBps=${slippageBps}`
      );
      
      const quoteData = await response.json();
      console.log(quoteData);
      setQuoteResponse(quoteData);
    } catch (error) {
      console.error('Error getting quote:', error);
      alert('Failed to get quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendOrder = async (e) => {
    e.preventDefault();
    if (!wallet.publicKey) {
      alert("Please connect your wallet first");
      return;
    }
    
    if (!quoteResponse) {
      alert("Please get a quote first");
      return;
    }

    setIsSwapping(true);
    try {
      const response = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: wallet.publicKey.toString(),
        }),
      });
      
      const responseData = await response.json();
      const swapTransaction = responseData.swapTransaction;
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      
      const txid = await wallet.sendTransaction(transaction, connection);
      console.log("Transaction submitted! TxID:", txid);
      alert(`Swap successful! Transaction ID: ${txid}`);
      setQuoteResponse(null);
      setAmount('');
    } catch (e) {
      console.error("There was an error in swapping the tokens:", e);
      alert('Swap failed. Please try again.');
    } finally {
      setIsSwapping(false);
    }
  };

  const TokenSelector = ({ token, onSelect, isOpen, setIsOpen, label }) => (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {token.symbol[0]}
          </div>
          <span className="font-medium text-white">{token.symbol}</span>
          <span className="text-sm text-gray-400">{token.name}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
          {POPULAR_TOKENS.map((t) => (
            <button
              key={t.mint}
              onClick={() => {
                onSelect(t);
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-2 p-3 hover:bg-gray-700 transition-colors text-left border-b border-gray-700 last:border-b-0"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {t.symbol[0]}
              </div>
              <div>
                <div className="font-medium text-white">{t.symbol}</div>
                <div className="text-sm text-gray-400">{t.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 mt-[-50px] to-black flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-black to-gray-800 p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">🚀 Token Swapper</h1>
                <p className="text-purple-100 mt-1 text-sm">Swap tokens on Solana</p>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 bg-gray-750 border-b border-gray-700">
              <h3 className="font-semibold text-white mb-3">Slippage Settings</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {SLIPPAGE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSlippage(option);
                      setCustomSlippage('');
                    }}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      slippage === option && !customSlippage
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {option}%
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom slippage %"
                value={customSlippage}
                onChange={(e) => setCustomSlippage(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                step="0.1"
                min="0"
                max="50"
              />
            </div>
          )}

          {/* Swap Interface */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* From Token */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">From</label>
              <TokenSelector
                token={inputToken}
                onSelect={setInputToken}
                isOpen={inputDropdownOpen}
                setIsOpen={setInputDropdownOpen}
                label="From"
              />
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 text-lg bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                step="any"
                min="0"
              />
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={swapTokens}
                className="p-2 bg-gray-800 border-2 border-gray-800 rounded-full hover:bg-gray-700 transition-colors group"
              >
                <ArrowUpDown className="w-5 h-5 text-purple-400 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">To</label>
              <TokenSelector
                token={outputToken}
                onSelect={setOutputToken}
                isOpen={outputDropdownOpen}
                setIsOpen={setOutputDropdownOpen}
                label="To"
              />
              <div className="px-4 py-3 bg-gray-800 rounded-lg border border-gray-700">
                <span className="text-lg text-gray-400">
                  {quoteResponse ? 
                    (parseInt(quoteResponse.outAmount) / Math.pow(10, outputToken.decimals)).toFixed(6) : 
                    '0.0'
                  }
                </span>
              </div>
            </div>

            {/* Quote Button */}
            <button
              onClick={swapfunction}
              disabled={isLoading || !amount}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting Quote...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Get Quote
                </>
              )}
            </button>

            {/* Quote Display */}
            {quoteResponse && (
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">You'll receive:</span>
                  <span className="font-semibold text-green-400">
                    {(parseInt(quoteResponse.outAmount) / Math.pow(10, outputToken.decimals)).toFixed(6)} {outputToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Price Impact:</span>
                  <span className="text-sm text-gray-300">
                    {quoteResponse.priceImpactPct ? `${(parseFloat(quoteResponse.priceImpactPct) * 100).toFixed(2)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Slippage:</span>
                  <span className="text-sm text-gray-300">{customSlippage || slippage}%</span>
                </div>
              </div>
            )}

            {/* Swap Button */}
            {quoteResponse && (
              <button
                onClick={sendOrder}
                disabled={isSwapping || !wallet.publicKey}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {isSwapping ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Swapping...
                  </>
                ) : !wallet.publicKey ? (
                  'Connect Wallet'
                ) : (
                  'Confirm Swap'
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Swap;