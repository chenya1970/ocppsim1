
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2, Heart } from 'lucide-react';
import { ConnectionStatus as ConnectionStatusType } from '../hooks/useOCPPConnection';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  onConnect: (url: string) => void;
  onDisconnect: () => void;
  onHeartbeat: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  onConnect,
  onDisconnect,
  onHeartbeat
}) => {
  const [centralStationUrl, setCentralStationUrl] = useState('wss://central-station.example.com/ocpp/CP001');

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      case 'disconnected': return 'bg-red-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return <Wifi className="h-5 w-5" />;
      case 'connecting': return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'disconnected': return <WifiOff className="h-5 w-5" />;
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Central Station Connection
          </div>
          <Badge variant={status === 'connected' ? 'default' : 'secondary'} className={getStatusColor()}>
            {status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Central Station URL</label>
          <Input
            value={centralStationUrl}
            onChange={(e) => setCentralStationUrl(e.target.value)}
            placeholder="Enter central station WebSocket URL"
            disabled={status === 'connecting' || status === 'connected'}
          />
        </div>
        
        <div className="flex gap-2">
          {status === 'disconnected' && (
            <Button 
              onClick={() => onConnect(centralStationUrl)} 
              className="bg-green-600 hover:bg-green-700"
              disabled={!centralStationUrl.trim()}
            >
              Connect to Central Station
            </Button>
          )}
          {status === 'connected' && (
            <>
              <Button onClick={onDisconnect} variant="destructive">
                Disconnect
              </Button>
              <Button onClick={onHeartbeat} variant="outline" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Send Heartbeat
              </Button>
            </>
          )}
          {status === 'connecting' && (
            <Button disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Current URL:</strong> {centralStationUrl}</p>
          <p><strong>Protocol:</strong> OCPP 1.6J over WebSocket</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionStatus;
