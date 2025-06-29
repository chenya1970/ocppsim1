
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2, Heart } from 'lucide-react';
import { ConnectionStatus as ConnectionStatusType } from '../hooks/useOCPPConnection';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  onConnect: () => void;
  onDisconnect: () => void;
  onHeartbeat: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  onConnect,
  onDisconnect,
  onHeartbeat
}) => {
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
      <CardContent>
        <div className="flex gap-2">
          {status === 'disconnected' && (
            <Button onClick={onConnect} className="bg-green-600 hover:bg-green-700">
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
        <div className="mt-4 text-sm text-muted-foreground">
          <p><strong>Central Station URL:</strong> wss://central-station.example.com/ocpp/CP001</p>
          <p><strong>Protocol:</strong> OCPP 1.6J over WebSocket</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionStatus;
