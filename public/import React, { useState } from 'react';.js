import React, { useState } from 'react';
import { Wallet, Building2, Zap, Droplets, FileText, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PaymentPortal = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  const connectWallet = async () => {
    // Simulating wallet connection - in real implementation, use ethers.js or web3.js
    setIsConnected(true);
    setWalletAddress('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  };

  const services = [
    {
      title: 'Electricity Board',
      icon: <Zap className="h-6 w-6" />,
      description: 'Pay electricity bills and new connection fees',
      amount: '0.01 ETH'
    },
    {
      title: 'Water Connection',
      icon: <Droplets className="h-6 w-6" />,
      description: 'Process water connection requests and pay bills',
      amount: '0.015 ETH'
    },
    {
      title: 'Building Permits',
      icon: <Building2 className="h-6 w-6" />,
      description: 'Apply and pay for construction permits',
      amount: '0.02 ETH'
    },
    {
      title: 'Document Verification',
      icon: <FileText className="h-6 w-6" />,
      description: 'Get official documents verified',
      amount: '0.005 ETH'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold">GovChain Pay</h1>
          </div>
          
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
            >
              <Wallet className="h-5 w-5" />
              <span>Connect Wallet</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-lg">
              <Wallet className="h-5 w-5 text-blue-400" />
              <span className="text-sm">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          )}
        </div>

        {/* Network Badge */}
        <Alert className="mb-8 bg-blue-900/50 border-blue-500">
          <AlertDescription className="flex items-center text-blue-400">
            Connected to Sepolia Test Network
          </AlertDescription>
        </Alert>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    {service.icon}
                  </div>
                  <span>{service.title}</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-blue-400 font-semibold">{service.amount}</span>
                  <button className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm transition-colors">
                    <span>Pay Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentPortal;