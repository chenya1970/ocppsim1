
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Zap, Play, Square, Timer, Gauge, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ConnectorInfo, StationStatus } from '../hooks/useOCPPConnection';

interface ConnectorPanelProps {
  connectors: ConnectorInfo[];
  onStartTransaction: (connectorId: number, idTag: string) => void;
  onStopTransaction: (connectorId: number) => void;
  onStatusChange: (connectorId: number, status: StationStatus) => void;
  onPowerLimitChange: (connectorId: number, powerLimit: number) => void;
  onSendMeterValues: (connectorId: number) => void;
}

const ConnectorPanel: React.FC<ConnectorPanelProps> = ({
  connectors,
  onStartTransaction,
  onStopTransaction,
  onStatusChange,
  onPowerLimitChange,
  onSendMeterValues
}) => {
  const [idTags, setIdTags] = React.useState<{[key: number]: string}>({
    1: 'RFID_12345678',
    2: 'RFID_87654321'
  });

  const getStatusIcon = (status: StationStatus) => {
    switch (status) {
      case 'Available': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Preparing': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Charging': return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'Finishing': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'Unavailable': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Faulted': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Gauge className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: StationStatus) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
      case 'Preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Charging': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Finishing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Unavailable': return 'bg-red-100 text-red-800 border-red-200';
      case 'Faulted': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatEnergy = (wh: number) => {
    if (wh >= 1000) {
      return `${(wh / 1000).toFixed(2)} kWh`;
    }
    return `${wh} Wh`;
  };

  return (
    <div className="space-y-6">
      {connectors.map((connector) => (
        <Card key={connector.connectorId} className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Connector {connector.connectorId}
              </div>
              <Badge className={getStatusColor(connector.status)}>
                {getStatusIcon(connector.status)}
                <span className="ml-1">{connector.status}</span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Power Limitation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Power Limit</label>
                <Badge variant="outline" className="font-mono">
                  {(connector.powerLimit / 1000).toFixed(1)} kW
                </Badge>
              </div>
              <Slider
                value={[connector.powerLimit]}
                onValueChange={([value]) => onPowerLimitChange(connector.connectorId, value)}
                max={connector.maxPower}
                min={1000}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 kW</span>
                <span>{(connector.maxPower / 1000)} kW</span>
              </div>
            </div>

            <Separator />

            {/* Transaction Section */}
            {!connector.currentTransaction ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">RFID Tag / ID Token</label>
                  <Input
                    value={idTags[connector.connectorId] || ''}
                    onChange={(e) => setIdTags(prev => ({
                      ...prev,
                      [connector.connectorId]: e.target.value
                    }))}
                    placeholder="Enter RFID tag or user ID"
                  />
                </div>
                <Button 
                  onClick={() => onStartTransaction(connector.connectorId, idTags[connector.connectorId])}
                  disabled={connector.status !== 'Available' || !idTags[connector.connectorId]?.trim()}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Transaction
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-semibold">{connector.currentTransaction.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID Tag</p>
                    <p className="font-semibold">{connector.currentTransaction.idTag}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Duration</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {formatDuration(connector.currentTransaction.startTime)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Energy</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {formatEnergy(connector.currentTransaction.currentMeter - connector.currentTransaction.meterStart)}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => onStopTransaction(connector.connectorId)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                  <Button 
                    onClick={() => onSendMeterValues(connector.connectorId)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Gauge className="h-4 w-4 mr-2" />
                    Send Meter
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConnectorPanel;
