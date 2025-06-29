
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConnectionStatus from './ConnectionStatus';
import ConnectorPanel from './ConnectorPanel';
import FirmwarePanel from './FirmwarePanel';
import MessageLog from './MessageLog';
import { useOCPPConnection } from '../hooks/useOCPPConnection';
import { Zap, Settings, Wifi } from 'lucide-react';

const ChargingStation = () => {
  const {
    connectionStatus,
    connectors,
    firmwareStatus,
    messages,
    connect,
    disconnect,
    startTransaction,
    stopTransaction,
    sendHeartbeat,
    sendStatusNotification,
    sendMeterValues,
    setPowerLimit,
    startFirmwareUpdate
  } = useOCPPConnection();

  const [stationInfo] = useState({
    id: 'CP001',
    model: 'FastCharge Pro X2',
    vendor: 'ElectroTech',
    firmwareVersion: '2.1.4',
    serialNumber: 'FC-2024-001',
    connectorCount: 2
  });

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
          OCPP 1.6J Multi-Connector Charge Point
        </h1>
        <p className="text-muted-foreground mt-2">Station ID: {stationInfo.id} | {stationInfo.connectorCount} Connectors</p>
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
              <div className="grid md:grid-cols-3 gap-4">
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
                <div>
                  <p className="text-sm text-muted-foreground">Connectors</p>
                  <p className="font-semibold">{stationInfo.connectorCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Protocol</p>
                  <p className="font-semibold">OCPP 1.6J</p>
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

          {/* Connector Management */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Connector Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConnectorPanel
                connectors={connectors}
                onStartTransaction={startTransaction}
                onStopTransaction={stopTransaction}
                onStatusChange={sendStatusNotification}
                onPowerLimitChange={setPowerLimit}
                onSendMeterValues={sendMeterValues}
              />
            </CardContent>
          </Card>

          {/* Firmware Management */}
          <FirmwarePanel
            firmwareStatus={firmwareStatus}
            onStartFirmwareUpdate={startFirmwareUpdate}
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
