
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { StationStatus as StationStatusType } from '../hooks/useOCPPConnection';

interface StationStatusProps {
  status: StationStatusType;
  onStatusChange: (status: StationStatusType) => void;
}

const StationStatus: React.FC<StationStatusProps> = ({ status, onStatusChange }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'Available': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Preparing': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Charging': return <Zap className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'Finishing': return <Clock className="h-5 w-5 text-orange-500" />;
      case 'Unavailable': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'Faulted': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
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

  const statusOptions: StationStatusType[] = [
    'Available', 'Preparing', 'Charging', 'SuspendedEV', 'SuspendedEVSE', 
    'Finishing', 'Reserved', 'Unavailable', 'Faulted'
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Connector Status
          </div>
          <Badge className={getStatusColor()}>
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Connector ID</p>
              <p className="font-semibold">1</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connector Type</p>
              <p className="font-semibold">CCS2</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Change Status (for testing)</label>
            <Select value={status} onValueChange={(value: StationStatusType) => onStatusChange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(statusOption => (
                  <SelectItem key={statusOption} value={statusOption}>
                    {statusOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StationStatus;
