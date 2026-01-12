import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  aiTrainingChat,
  type ChatMessage,
  type TrainingSession,
} from '@/lib/aiTrainingChat';
import { Send, Plus, CheckCircle, AlertCircle, Brain } from 'lucide-react';

export const AITrainingPanel: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    loadChatHistory();
    loadSessions();
  }, []);

  // Auto-scroll para mensagens novas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = () => {
    const history = aiTrainingChat.getChatHistory(50);
    setMessages(history);
  };

  const loadSessions = () => {
    const trainingSessions = aiTrainingChat.getTrainingSessions();
    setSessions(trainingSessions);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);

    try {
      const { message, response } = aiTrainingChat.sendMessage(input);
      setMessages(prev => [...prev, message, response]);
      setInput('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = (topic: string) => {
    const session = aiTrainingChat.startTrainingSession(topic);
    // Feedback visual ou notificação
    alert(`Sessão de treinamento iniciada: ${topic}`);
  };

  const handleEndSession = () => {
    const session = aiTrainingChat.endTrainingSession();
    if (session) {
      setSessions(prev => [...prev, session]);
      alert(`Sessão finalizada com ${session.messages.length} mensagens`);
    }
  };

  const getAIStatus = () => {
    return aiTrainingChat.getAIStatus();
  };

  const status = getAIStatus();

  return (
    <Card className="h-full flex flex-col bg-slate-900 border-slate-800">
      <CardHeader className="border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              AI Training Hub
            </CardTitle>
            <CardDescription className="text-slate-400">
              Chat e treinamento contínuo da IA de Trading
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-purple-900/50 text-purple-300 border-purple-800">
            {status.totalMessagesProcessed} mensagens
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-b border-slate-700">
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="capabilities"
              className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
            >
              Capacidades
            </TabsTrigger>
            <TabsTrigger
              value="sessions"
              className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
            >
              Sessões
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col gap-3">
            <ScrollArea className="flex-1 border border-slate-700 rounded-lg bg-slate-800/50 p-3">
              <div ref={scrollRef} className="space-y-3 pr-4">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Inicie uma conversa para treinar a IA</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-700 text-slate-100'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-50 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Digite sua mensagem ou comando..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && !isLoading && handleSendMessage()}
                disabled={isLoading}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartSession('strategy_improvement')}
                className="flex-1 border-slate-700 hover:bg-slate-800"
              >
                <Plus className="w-3 h-3 mr-1" />
                Iniciar Sessão
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndSession}
                className="flex-1 border-slate-700 hover:bg-slate-800"
              >
                Finalizar Sessão
              </Button>
            </div>
          </TabsContent>

          {/* Capabilities Tab */}
          <TabsContent value="capabilities" className="flex-1 overflow-y-auto space-y-3">
            <div className="grid gap-2">
              {status.capabilityList.map(capability => (
                <Card key={capability.name} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm">{capability.name}</h4>
                      <Badge className="bg-green-900/50 text-green-300 text-xs">
                        {Math.round(capability.successRate * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{capability.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{capability.trainingSessions} sessões</span>
                      <span>{new Date(capability.lastImproved).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="flex-1 overflow-y-auto space-y-3">
            {sessions.length === 0 ? (
              <Alert className="bg-slate-800 border-slate-700 text-slate-300">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>Nenhuma sessão de treinamento ainda</AlertDescription>
              </Alert>
            ) : (
              sessions.slice(-10).map(session => (
                <Card key={session.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm">{session.topic}</h4>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      {session.messages.length} mensagens
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(session.startTime).toLocaleDateString('pt-BR')}</span>
                      <Badge
                        className={`text-xs ${
                          (session.rating || 0) > 3
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-yellow-900/50 text-yellow-300'
                        }`}
                      >
                        {session.rating}/5
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AITrainingPanel;
