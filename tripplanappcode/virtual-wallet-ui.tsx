import React, { useState, useEffect } from 'react';
import { 
  Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, 
  Gift, Shield, Smartphone 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const VirtualWallet = ({ currentUser }) => {
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');

  // Virtual Card Display
  const VirtualCard = () => (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-sm opacity-80">Virtual Travel Card</p>
            <p className="font-mono text-xl mt-1">
              {walletData?.card_number}
            </p>
          </div>
          <CreditCard size={24} />
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm opacity-80">Balance</p>
            <p className="text-2xl font-semibold">
              ${walletData?.balance.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Rewards Level</p>
            <p className="font-semibold capitalize">
              {walletData?.rewards_level}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Quick Actions
  const QuickActions = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button
        onClick={() => setShowAddFunds(true)}
        className="p-4 border rounded hover:bg-gray-50 flex flex-col items-center"
      >
        <ArrowDownLeft className="mb-2" />
        <span>Add Funds</span>
      </button>
      <button
        onClick={() => {/* Implement transfer */}}
        className="p-4 border rounded hover:bg-gray-50 flex flex-col items-center"
      >
        <ArrowUpRight className="mb-2" />
        <span>Transfer</span>
      </button>
    </div>
  );

  // Add Funds Modal
  const AddFundsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Add Funds to Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter amount"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[50, 100, 200, 500].map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(value)}
                  className="p-2 border rounded hover:bg-gray-50"
                >
                  ${value}
                </button>
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  // Implement add funds
                  setShowAddFunds(false);
                }}
                className="flex-1 bg-blue-500 text-white p-2 rounded"
              >
                Add Funds
              </button>
              <button
                onClick={() => setShowAddFunds(false)}
                className="flex-1 border p-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Rewards Section
  const RewardsSection = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gift className="mr-2" />
          Rewards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Points Balance</span>
            <span className="font-semibold">{walletData?.rewards_points}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Cash Value</span>
            <span className="font-semibold">
              ${(walletData?.rewards_points * 0.01).toFixed(2)}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm">
              Earn 2% back on all trip expenses and 1% on all other transactions
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-md mx-auto p-4">
      <VirtualCard />
      <QuickActions />
      <RewardsSection />
      {showAddFunds && <AddFundsModal />}
    </div>
  );
};

export default VirtualWallet;
