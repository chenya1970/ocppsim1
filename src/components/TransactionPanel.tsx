
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Play, Square, Timer, Zap } from 'lucide-react';
import { Transaction, StationStatus } from '../hooks/useOCPPConnection';

interface TransactionPanelProps {
  transaction: Transaction | null;
  stationStatus: StationStatus;
  onStartTransaction: (idTag: string) => void;
  onStopTransaction: () => void;
}

const TransactionPanel: React.FC<TransactionPanelProps> = ({
  transaction,
  stationStatus,
  onStartTransaction,
  onStopTransaction
}) => {
  const [idTag, setIdTag] = useState('RFID_12345678');

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
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Transaction Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!transaction ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">RFID Tag / ID Token</label>
              <Input
                value={idTag}
                onChange={(e) => setIdTag(e.target.value)}
                placeholder="Enter RFID tag or user ID"
              />
            </div>
            <Button 
              onClick={() => onStartTransaction(idTag)}
              disabled={stationStatus !== 'Available' || !idTag.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Transaction
            </Button>
            {stationStatus !== 'Available' && (
              <p className="text-sm text-muted-foreground text-center">
                Station must be Available to start a transaction
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-semibold">{transaction.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID Tag</p>
                <p className="font-semibold">{transaction.idTag}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {formatDuration(transaction.startTime)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Energy Delivered</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {formatEnergy(transaction.currentMeter - transaction.meterStart)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Current Meter</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {transaction.currentMeter.toLocaleString()} Wh
                </Badge>
              </div>
            </div>

            <Button 
              onClick={onStopTransaction}
              variant="destructive"
              className="w-full"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Transaction
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionPanel;
