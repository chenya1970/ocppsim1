import { useState, useCallback, useRef } from 'react';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
export type StationStatus = 'Available' | 'Preparing' | 'Charging' | 'SuspendedEV' | 'SuspendedEVSE' | 'Finishing' | 'Reserved' | 'Unavailable' | 'Faulted';

export interface Transaction {
  transactionId: number;
  connectorId: number;
  idTag: string;
  startTime: Date;
  meterStart: number;
  currentMeter: number;
}

export interface ConnectorInfo {
  connectorId: number;
  status: StationStatus;
  currentTransaction: Transaction | null;
  powerLimit: number; // in Watts
  maxPower: number; // Maximum power capability
}

export interface OCPPMessage {
  id: string;
  timestamp: Date;
  direction: 'sent' | 'received';
  messageType: string;
  payload: any;
}

export interface FirmwareStatus {
  status: 'Idle' | 'Downloaded' | 'DownloadFailed' | 'Downloading' | 'InstallationFailed' | 'Installing' | 'Installed';
  downloadProgress?: number;
  installProgress?: number;
}

export const useOCPPConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [connectors, setConnectors] = useState<ConnectorInfo[]>([
    { connectorId: 1, status: 'Available', currentTransaction: null, powerLimit: 22000, maxPower: 22000 },
    { connectorId: 2, status: 'Available', currentTransaction: null, powerLimit: 22000, maxPower: 22000 }
  ]);
  const [firmwareStatus, setFirmwareStatus] = useState<FirmwareStatus>({ status: 'Idle' });
  const [messages, setMessages] = useState<OCPPMessage[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const messageIdRef = useRef(1);
  const transactionIdRef = useRef(1000);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const meterValuesIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addMessage = useCallback((direction: 'sent' | 'received', messageType: string, payload: any) => {
    const message: OCPPMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      direction,
      messageType,
      payload
    };
    setMessages(prev => [message, ...prev].slice(0, 100));
  }, []);

  const sendMessage = useCallback((messageType: string, payload: any) => {
    const messageId = messageIdRef.current++;
    const ocppMessage = [2, messageId.toString(), messageType, payload];
    
    addMessage('sent', messageType, payload);
    console.log('OCPP Message Sent:', JSON.stringify(ocppMessage, null, 2));
    
    // Simulate response after delay
    setTimeout(() => {
      const response = [3, messageId.toString(), {}];
      addMessage('received', `${messageType}Response`, {});
      console.log('OCPP Response Received:', JSON.stringify(response, null, 2));
    }, 500 + Math.random() * 1000);
  }, [addMessage]);

  const connect = useCallback((url: string) => {
    if (connectionStatus !== 'disconnected') return;
    
    setConnectionStatus('connecting');
    setCurrentUrl(url);
    addMessage('sent', 'Connection', { url });
    
    setTimeout(() => {
      setConnectionStatus('connected');
      addMessage('received', 'ConnectionAccepted', {});
      
      sendMessage('BootNotification', {
        chargePointModel: 'FastCharge Pro X2',
        chargePointVendor: 'ElectroTech',
        firmwareVersion: '2.1.4'
      });
      
      // Start heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        sendMessage('Heartbeat', {});
      }, 30000);

      // Start meter values reporting
      meterValuesIntervalRef.current = setInterval(() => {
        connectors.forEach(connector => {
          if (connector.currentTransaction) {
            sendMeterValues(connector.connectorId, connector.currentTransaction.transactionId);
          }
        });
      }, 60000); // Send meter values every minute
    }, 2000);
  }, [connectionStatus, sendMessage, addMessage, connectors]);

  const disconnect = useCallback(() => {
    setConnectionStatus('disconnected');
    addMessage('sent', 'Disconnect', {});
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (meterValuesIntervalRef.current) {
      clearInterval(meterValuesIntervalRef.current);
      meterValuesIntervalRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [addMessage]);

  const sendHeartbeat = useCallback(() => {
    if (connectionStatus === 'connected') {
      sendMessage('Heartbeat', {});
    }
  }, [connectionStatus, sendMessage]);

  const sendStatusNotification = useCallback((connectorId: number, status: StationStatus, errorCode: string = 'NoError') => {
    setConnectors(prev => prev.map(conn => 
      conn.connectorId === connectorId ? { ...conn, status } : conn
    ));
    
    sendMessage('StatusNotification', {
      connectorId,
      status,
      errorCode,
      timestamp: new Date().toISOString()
    });
  }, [sendMessage]);

  const sendMeterValues = useCallback((connectorId: number, transactionId?: number) => {
    const connector = connectors.find(c => c.connectorId === connectorId);
    if (!connector) return;

    const meterValue = connector.currentTransaction 
      ? connector.currentTransaction.currentMeter 
      : Math.floor(Math.random() * 100000);

    const payload: any = {
      connectorId,
      timestamp: new Date().toISOString(),
      meterValue: [{
        timestamp: new Date().toISOString(),
        sampledValue: [
          {
            value: meterValue.toString(),
            context: 'Sample.Periodic',
            format: 'Raw',
            measurand: 'Energy.Active.Import.Register',
            unit: 'Wh'
          },
          {
            value: Math.floor(Math.random() * connector.powerLimit).toString(),
            context: 'Sample.Periodic',
            format: 'Raw',
            measurand: 'Power.Active.Import',
            unit: 'W'
          }
        ]
      }]
    };

    if (transactionId) {
      payload.transactionId = transactionId;
    }

    sendMessage('MeterValues', payload);
  }, [connectors, sendMessage]);

  const startTransaction = useCallback((connectorId: number, idTag: string) => {
    const connector = connectors.find(c => c.connectorId === connectorId);
    if (!connector || connector.status !== 'Available') return;
    
    const transactionId = transactionIdRef.current++;
    const meterStart = Math.floor(Math.random() * 10000);
    
    const transaction: Transaction = {
      transactionId,
      connectorId,
      idTag,
      startTime: new Date(),
      meterStart,
      currentMeter: meterStart
    };
    
    setConnectors(prev => prev.map(conn => 
      conn.connectorId === connectorId 
        ? { ...conn, status: 'Preparing', currentTransaction: transaction }
        : conn
    ));
    
    sendMessage('StartTransaction', {
      connectorId,
      idTag,
      meterStart,
      timestamp: new Date().toISOString()
    });
    
    setTimeout(() => {
      sendStatusNotification(connectorId, 'Charging');
      
      const chargingInterval = setInterval(() => {
        setConnectors(prev => prev.map(conn => {
          if (conn.connectorId === connectorId && conn.currentTransaction) {
            return {
              ...conn,
              currentTransaction: {
                ...conn.currentTransaction,
                currentMeter: conn.currentTransaction.currentMeter + Math.floor(Math.random() * 5) + 1
              }
            };
          }
          return conn;
        }));
      }, 2000);

      // Store interval reference for cleanup
      setTimeout(() => clearInterval(chargingInterval), 300000); // Auto-stop after 5 minutes for demo
    }, 3000);
  }, [connectors, sendMessage, sendStatusNotification]);

  const stopTransaction = useCallback((connectorId: number) => {
    const connector = connectors.find(c => c.connectorId === connectorId);
    if (!connector?.currentTransaction) return;
    
    sendStatusNotification(connectorId, 'Finishing');
    
    sendMessage('StopTransaction', {
      transactionId: connector.currentTransaction.transactionId,
      meterStop: connector.currentTransaction.currentMeter,
      timestamp: new Date().toISOString(),
      reason: 'Local'
    });
    
    setTimeout(() => {
      setConnectors(prev => prev.map(conn => 
        conn.connectorId === connectorId 
          ? { ...conn, status: 'Available', currentTransaction: null }
          : conn
      ));
    }, 2000);
  }, [connectors, sendMessage, sendStatusNotification]);

  const setPowerLimit = useCallback((connectorId: number, powerLimit: number) => {
    setConnectors(prev => prev.map(conn => 
      conn.connectorId === connectorId ? { ...conn, powerLimit } : conn
    ));
  }, []);

  const startFirmwareUpdate = useCallback((downloadUrl: string) => {
    setFirmwareStatus({ status: 'Downloading', downloadProgress: 0 });
    
    sendMessage('FirmwareStatusNotification', {
      status: 'Downloading'
    });

    // Simulate download progress
    const downloadInterval = setInterval(() => {
      setFirmwareStatus(prev => {
        const newProgress = (prev.downloadProgress || 0) + 10;
        if (newProgress >= 100) {
          clearInterval(downloadInterval);
          setTimeout(() => {
            setFirmwareStatus({ status: 'Installing', installProgress: 0 });
            sendMessage('FirmwareStatusNotification', { status: 'Installing' });
            
            // Simulate installation
            const installInterval = setInterval(() => {
              setFirmwareStatus(prev => {
                const newInstallProgress = (prev.installProgress || 0) + 20;
                if (newInstallProgress >= 100) {
                  clearInterval(installInterval);
                  setFirmwareStatus({ status: 'Installed' });
                  sendMessage('FirmwareStatusNotification', { status: 'Installed' });
                  return { status: 'Installed' };
                }
                return { ...prev, installProgress: newInstallProgress };
              });
            }, 1000);
          }, 1000);
          return { status: 'Downloaded' };
        }
        return { ...prev, downloadProgress: newProgress };
      });
    }, 500);
  }, [sendMessage]);

  return {
    connectionStatus,
    connectors,
    firmwareStatus,
    messages,
    currentUrl,
    connect,
    disconnect,
    startTransaction,
    stopTransaction,
    sendHeartbeat,
    sendStatusNotification,
    sendMeterValues,
    setPowerLimit,
    startFirmwareUpdate
  };
};
