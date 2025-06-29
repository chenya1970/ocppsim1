
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StationStatus from './StationStatus';
import TransactionPanel from './TransactionPanel';
import MessageLog from './MessageLog';
import ConnectionStatus from './ConnectionStatus';
import { useOCPPConnection } from '../hooks/useOCPPConnection';
import { Zap, Settings, Wifi } from 'lucide-react';

const ChargingStation = () => {
  const {
    connectionStatus,
    stationStatus,
    currentTransaction,
    messages,
    connect,
    disconnect,
    startTransaction,
    stopTransaction,
    sendHeartbeat,
    sendStatusNotification
  } = useOCPPConnection();

  const [stationInfo] = useState({
    id: 'CP001',
    model: 'FastCharge Pro X1',
    vendor: 'ElectroTech',
    firmwareVersion: '2.1.4',
    serialNumber: 'FC-2024-001'
  });

  useEffect(() => {
    // Auto-connect on component mount
    connect();
  }, [connect]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-full">
            <Zap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          OCPP 1.6J Charge Point Simulator
        </h1>
        <p className="text-muted-foreground mt-2">Station ID: {stationInfo.id}</p>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Station Information */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Station Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="font-semibold">{stationInfo.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vendor</p>
                  <p className="font-semibold">{stationInfo.vendor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Firmware</p>
                  <p className="font-semibold">{stationInfo.firmwareVersion}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                  <p className="font-semibold">{stationInfo.serialNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connection Status */}
          <ConnectionStatus 
            status={connectionStatus}
            onConnect={connect}
            onDisconnect={disconnect}
            onHeartbeat={sendHeartbeat}
          />

          {/* Station Status */}
          <StationStatus 
            status={stationStatus}
            onStatusChange={sendStatusNotification}
          />

          {/* Transaction Panel */}
          <TransactionPanel
            transaction={currentTransaction}
            stationStatus={stationStatus}
            onStartTransaction={startTransaction}
            onStopTransaction={stopTransaction}
          />
        </div>

        {/* Right Column - Message Log */}
        <div className="lg:col-span-1">
          <MessageLog messages={messages} />
        </div>
      </div>
    </div>
  );
};

export default ChargingStation;
