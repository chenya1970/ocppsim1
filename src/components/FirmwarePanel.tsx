
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { FirmwareStatus } from '../hooks/useOCPPConnection';

interface FirmwarePanelProps {
  firmwareStatus: FirmwareStatus;
  onStartFirmwareUpdate: (downloadUrl: string) => void;
}

const FirmwarePanel: React.FC<FirmwarePanelProps> = ({
  firmwareStatus,
  onStartFirmwareUpdate
}) => {
  const [downloadUrl, setDownloadUrl] = useState('https://firmware.example.com/v2.1.5.bin');

  const getStatusIcon = () => {
    switch (firmwareStatus.status) {
      case 'Idle': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'Downloading': return <Download className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'Downloaded': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Installing': return <Upload className="h-4 w-4 text-orange-500 animate-pulse" />;
      case 'Installed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'DownloadFailed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'InstallationFailed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (firmwareStatus.status) {
      case 'Idle': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Downloading': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Downloaded': return 'bg-green-100 text-green-800 border-green-200';
      case 'Installing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Installed': return 'bg-green-100 text-green-800 border-green-200';
      case 'DownloadFailed': return 'bg-red-100 text-red-800 border-red-200';
      case 'InstallationFailed': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Firmware Management
          </div>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">{firmwareStatus.status}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Firmware Download URL</label>
          <Input
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
            placeholder="Enter firmware download URL"
            disabled={firmwareStatus.status === 'Downloading' || firmwareStatus.status === 'Installing'}
          />
        </div>

        {firmwareStatus.status === 'Downloading' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Download Progress</span>
              <span>{firmwareStatus.downloadProgress}%</span>
            </div>
            <Progress value={firmwareStatus.downloadProgress} className="w-full" />
          </div>
        )}

        {firmwareStatus.status === 'Installing' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Installation Progress</span>
              <span>{firmwareStatus.installProgress}%</span>
            </div>
            <Progress value={firmwareStatus.installProgress} className="w-full" />
          </div>
        )}

        <Button
          onClick={() => onStartFirmwareUpdate(downloadUrl)}
          disabled={
            !downloadUrl.trim() || 
            firmwareStatus.status === 'Downloading' || 
            firmwareStatus.status === 'Installing'
          }
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Start Firmware Update
        </Button>

        <div className="text-sm text-muted-foreground">
          <p><strong>Current Version:</strong> 2.1.4</p>
          <p><strong>Status:</strong> {firmwareStatus.status}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirmwarePanel;
