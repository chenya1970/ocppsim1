
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, ArrowUp, ArrowDown, Trash2, Copy } from 'lucide-react';
import { OCPPMessage } from '../hooks/useOCPPConnection';

interface MessageLogProps {
  messages: OCPPMessage[];
}

const MessageLog: React.FC<MessageLogProps> = ({ messages }) => {
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const copyToClipboard = (message: OCPPMessage) => {
    const content = JSON.stringify(message.payload, null, 2);
    navigator.clipboard.writeText(content);
  };

  const clearMessages = () => {
    // This would need to be implemented in the parent component
    console.log('Clear messages requested');
  };

  return (
    <Card className="border-0 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            OCPP Messages
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{messages.length}</Badge>
            <Button size="sm" variant="outline" onClick={clearMessages}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Connect to see OCPP communication</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={message.id} className="space-y-2">
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      message.direction === 'sent' 
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                        : 'bg-green-50 border-green-200 hover:bg-green-100'
                    }`}
                    onClick={() => setExpandedMessage(
                      expandedMessage === message.id ? null : message.id
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {message.direction === 'sent' ? (
                          <ArrowUp className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-green-600" />
                        )}
                        <span className="font-medium text-sm">{message.messageType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(message);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {expandedMessage === message.id && (
                      <div className="mt-3">
                        <pre className="text-xs bg-white/50 p-2 rounded border overflow-x-auto">
                          {JSON.stringify(message.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                  {index < messages.length - 1 && <Separator />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MessageLog;
