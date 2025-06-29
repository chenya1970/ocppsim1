
import { useState, useCallback, useRef } from 'react';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
export type StationStatus = 'Available' | 'Preparing' | 'Charging' | 'SuspendedEV' | 'SuspendedEVSE' | 'Finishing' | 'Reserved' | 'Unavailable' | 'Faulted';

export interface Transaction {
  transactionId: number;
  idTag: string;
  startTime: Date;
  meterStart: number;
  currentMeter: number;
}

export interface OCPPMessage {
  id: string;
  timestamp: Date;
  direction: 'sent' | 'received';
  messageType: string;
  payload: any;
}

export const useOCPPConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [stationStatus, setStationStatus] = useState<StationStatus>('Available');
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [messages, setMessages] = useState<OCPPMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const messageIdRef = useRef(1);
  const transactionIdRef = useRef(1000);

  const addMessage = useCallback((direction: 'sent' | 'received', messageType: string, payload: any) => {
    const message: OCPPMessage = {
      id: `msg_${Date.now()}`,
      timestamp: new Date(),
      direction,
      messageType,
      payload
    };
    setMessages(prev => [message, ...prev].slice(0, 100)); // Keep last 100 messages
  }, []);

  const sendMessage = useCallback((messageType: string, payload: any) => {
    const messageId = messageIdRef.current++;
    const ocppMessage = [2, messageId.toString(), messageType, payload];
    
    addMessage('sent', messageType, payload);
    
    // Simulate WebSocket send
    console.log('OCPP Message Sent:', JSON.stringify(ocppMessage, null, 2));
    
    // Simulate response after delay
    setTimeout(() => {
      const response = [3, messageId.toString(), {}];
      addMessage('received', `${messageType}Response`, {});
      console.log('OCPP Response Received:', JSON.stringify(response, null, 2));
    }, 500 + Math.random() * 1000);
  }, [addMessage]);

  const connect = useCallback(() => {
    if (connectionStatus !== 'disconnected') return;
    
    setConnectionStatus('connecting');
    addMessage('sent', 'Connection', { url: 'wss://central-station.example.com/ocpp/CP001' });
    
    // Simulate connection
    setTimeout(() => {
      setConnectionStatus('connected');
      addMessage('received', 'ConnectionAccepted', {});
      
      // Send BootNotification
      sendMessage('BootNotification', {
        chargePointModel: 'FastCharge Pro X1',
        chargePointVendor: 'ElectroTech',
        firmwareVersion: '2.1.4'
      });
      
      // Start heartbeat
      const heartbeatInterval = setInterval(() => {
        if (connectionStatus === 'connected') {
          sendMessage('Heartbeat', {});
        } else {
          clearInterval(heartbeatInterval);
        }
      }, 30000);
    }, 2000);
  }, [connectionStatus, sendMessage, addMessage]);

  const disconnect = useCallback(() => {
    setConnectionStatus('disconnected');
    addMessage('sent', 'Disconnect', {});
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

  const sendStatusNotification = useCallback((status: StationStatus, errorCode: string = 'NoError') => {
    setStationStatus(status);
    sendMessage('StatusNotification', {
      connectorId: 1,
      status,
      errorCode,
      timestamp: new Date().toISOString()
    });
  }, [sendMessage]);

  const startTransaction = useCallback((idTag: string) => {
    if (stationStatus !== 'Available') return;
    
    const transactionId = transactionIdRef.current++;
    const meterStart = Math.floor(Math.random() * 10000);
    
    const transaction: Transaction = {
      transactionId,
      idTag,
      startTime: new Date(),
      meterStart,
      currentMeter: meterStart
    };
    
    setCurrentTransaction(transaction);
    sendStatusNotification('Preparing');
    
    sendMessage('StartTransaction', {
      connectorId: 1,
      idTag,
      meterStart,
      timestamp: new Date().toISOString()
    });
    
    // Simulate charging progression
    setTimeout(() => {
      sendStatusNotification('Charging');
      
      const chargingInterval = setInterval(() => {
        setCurrentTransaction(prev => {
          if (!prev) {
            clearInterval(chargingInterval);
            return null;
          }
          return {
            ...prev,
            currentMeter: prev.currentMeter + Math.floor(Math.random() * 5) + 1
          };
        });
      }, 2000);
    }, 3000);
  }, [stationStatus, sendMessage, sendStatusNotification]);

  const stopTransaction = useCallback(() => {
    if (!currentTransaction) return;
    
    sendStatusNotification('Finishing');
    
    sendMessage('StopTransaction', {
      transactionId: currentTransaction.transactionId,
      meterStop: currentTransaction.currentMeter,
      timestamp: new Date().toISOString(),
      reason: 'Local'
    });
    
    setTimeout(() => {
      setCurrentTransaction(null);
      sendStatusNotification('Available');
    }, 2000);
  }, [currentTransaction, sendMessage, sendStatusNotification]);

  return {
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
  };
};
