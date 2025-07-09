import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Upload, FileText, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useSources } from '@/hooks/useSources';
import MarkdownRenderer from '@/components/chat/MarkdownRenderer';
import SaveToNoteButton from './SaveToNoteButton';
import AddSourcesDialog from './AddSourcesDialog';
import { Citation } from '@/types/message';

interface ChatAreaProps {
  hasSource: boolean;
  notebookId?: string;
  notebook?: {
    id: string;
    title: string;
    description?: string;
    generation_status?: string;
    icon?: string;
    example_questions?: string[];
  } | null;
  onCitationClick?: (citation: Citation) => void;
}

const ChatArea = ({
  hasSource,
  notebookId,
  notebook,
  onCitationClick
}: ChatAreaProps) => {
  const [message, setMessage] = useState('');
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const [showAiLoading, setShowAiLoading] = useState(false);
  const [clickedQuestions, setClickedQuestions] = useState<Set<string>>(new Set());
  const [showAddSourcesDialog, setShowAddSourcesDialog] = useState(false);
  
  const isGenerating = notebook?.generation_status === 'generating';
  
  const {
    messages,
    sendMessage,
    isSending,
    deleteChatHistory,
    isDeletingChatHistory
  } = useChatMessages(notebookId);
  
  const {
    sources
  } = useSources(notebookId);
  
  const sourceCount = sources?.length || 0;

  // Check if at least one source has been successfully processed
  const hasProcessedSource = sources?.some(source => source.processing_status === 'completed') || false;

  // Chat should be disabled if there are no processed sources
  const isChatDisabled = !hasProcessedSource;

  // Track when we send a message to show loading state
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Ref for auto-scrolling to the most recent message
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // If we have new messages and we have a pending message, clear it
    if (messages.length > lastMessageCount && pendingUserMessage) {
      setPendingUserMessage(null);
      setShowAiLoading(false);
    }
    setLastMessageCount(messages.length);
  }, [messages.length, lastMessageCount, pendingUserMessage]);

  // Auto-scroll when pending message is set, when messages update, or when AI loading appears
  useEffect(() => {
    if (latestMessageRef.current && scrollAreaRef.current) {
      // Find the viewport within the ScrollArea
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        // Use a small delay to ensure the DOM has updated
        setTimeout(() => {
          latestMessageRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 50);
      }
    }
  }, [pendingUserMessage, messages.length, showAiLoading]);
  
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (textToSend && notebookId) {
      try {
        // Store the pending message to display immediately
        setPendingUserMessage(textToSend);
        await sendMessage({
          notebookId: notebookId,
          role: 'user',
          content: textToSend
        });
        setMessage('');

        // Show AI loading after user message is sent
        setShowAiLoading(true);
      } catch (error) {
        console.error('Failed to send message:', error);
        // Clear pending message on error
        setPendingUserMessage(null);
        setShowAiLoading(false);
      }
    }
  };
  
  const handleRefreshChat = () => {
    if (notebookId) {
      console.log('Refresh button clicked for notebook:', notebookId);
      deleteChatHistory(notebookId);
      // Reset clicked questions when chat is refreshed
      setClickedQuestions(new Set());
    }
  };
  
  const handleCitationClick = (citation: Citation) => {
    onCitationClick?.(citation);
  };
  
  const handleExampleQuestionClick = (question: string) => {
    // Add question to clicked set to remove it from display
    setClickedQuestions(prev => new Set(prev).add(question));
    setMessage(question);
    handleSendMessage(question);
  };

  // Helper function to determine if message is from user
  const isUserMessage = (msg: any) => {
    const messageType = msg.message?.type || msg.message?.role;
    return messageType === 'human' || messageType === 'user';
  };

  // Helper function to determine if message is from AI
  const isAiMessage = (msg: any) => {
    const messageType = msg.message?.type || msg.message?.role;
    return messageType === 'ai' || messageType === 'assistant';
  };

  // Get the index of the last message for auto-scrolling
  const shouldShowScrollTarget = () => {
    return messages.length > 0 || pendingUserMessage || showAiLoading;
  };

  // Show refresh button if there are any messages (including system messages)
  const shouldShowRefreshButton = messages.length > 0;

  // Get example questions from the notebook, filtering out clicked ones
  const exampleQuestions = notebook?.example_questions?.filter(q => !clickedQuestions.has(q)) || [];

  // Update placeholder text based on processing status
  const getPlaceholderText = () => {
    if (isChatDisabled) {
      if (sourceCount === 0) {
        return "העלה מקור כדי להתחיל...";
      } else {
        return "אנא המתן בזמן שהמקורות שלך מעובדים...";
      }
    }
    return "התחל לכתוב...";
  };
  
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {hasSource ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Clean Chat Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  {isGenerating ? (
                    <Loader2 className="text-gray-600 w-5 h-5 animate-spin" />
                  ) : (
                    <span className="text-xl">{notebook?.icon || '💬'}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">צ'אט</h2>
                  <p className="text-sm text-gray-500">{sourceCount} מקור{sourceCount !== 1 ? 'ות' : ''}</p>
                </div>
              </div>
              {shouldShowRefreshButton && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefreshChat} 
                  disabled={isDeletingChatHistory || isChatDisabled}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className={`h-4 w-4 ml-2 ${isDeletingChatHistory ? 'animate-spin' : ''}`} />
                  {isDeletingChatHistory ? 'מנקה...' : 'נקה צ\'אט'}
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 h-full bg-gray-50" ref={scrollAreaRef}>
            {/* Document Summary */}
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                {/* Notebook Info Card */}
                <Card className="p-6 mb-6 bg-white border-0 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0">
                      {isGenerating ? (
                        <Loader2 className="text-gray-600 w-6 h-6 animate-spin" />
                      ) : (
                        <span className="text-2xl">{notebook?.icon || '📝'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl font-semibold text-gray-900 mb-2">
                        {isGenerating ? 'יוצר תוכן...' : notebook?.title || 'מחברת ללא כותרת'}
                      </h1>
                      {isGenerating ? (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <p className="text-sm">הבינה המלאכותית מנתחת את המקור שלך ויוצרת כותרת ותיאור...</p>
                        </div>
                      ) : (
                        <div className="prose prose-sm prose-gray max-w-none text-gray-600">
                          <MarkdownRenderer 
                            content={notebook?.description || 'אין תיאור זמין למחברת זו.'} 
                            className="text-sm leading-relaxed" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Chat Messages */}
                {(messages.length > 0 || pendingUserMessage || showAiLoading) && (
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div key={msg.id} className={`flex ${isUserMessage(msg) ? 'justify-end' : 'justify-start'}`}>
                        <div className={`${
                          isUserMessage(msg) 
                            ? 'max-w-xs lg:max-w-md px-4 py-3 bg-blue-600 text-white rounded-2xl rounded-br-md' 
                            : 'max-w-full'
                        }`}>
                          {isUserMessage(msg) ? (
                            <MarkdownRenderer 
                              content={msg.message.content} 
                              className="text-sm" 
                              isUserMessage={true} 
                            />
                          ) : (
                            <Card className="p-4 bg-white border-0 shadow-sm">
                              <div className="prose prose-sm prose-gray max-w-none">
                                <MarkdownRenderer 
                                  content={msg.message.content} 
                                  onCitationClick={handleCitationClick} 
                                  isUserMessage={false} 
                                />
                              </div>
                              <div className="mt-3 flex justify-start">
                                <SaveToNoteButton content={msg.message.content} notebookId={notebookId} />
                              </div>
                            </Card>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Pending user message */}
                    {pendingUserMessage && (
                      <div className="flex justify-end">
                        <div className="max-w-xs lg:max-w-md px-4 py-3 bg-blue-600 text-white rounded-2xl rounded-br-md">
                          <MarkdownRenderer content={pendingUserMessage} className="text-sm" isUserMessage={true} />
                        </div>
                      </div>
                    )}
                    
                    {/* AI Loading Indicator */}
                    {showAiLoading && (
                      <div className="flex justify-start" ref={latestMessageRef}>
                        <Card className="p-4 bg-white border-0 shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                              animationDelay: '0.1s'
                            }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                              animationDelay: '0.2s'
                            }}></div>
                          </div>
                        </Card>
                      </div>
                    )}
                    
                    {/* Scroll target for when no AI loading is shown */}
                    {!showAiLoading && shouldShowScrollTarget() && <div ref={latestMessageRef} />}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Clean Chat Input */}
          <div className="p-6 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <Input 
                    placeholder={getPlaceholderText()} 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && !isChatDisabled && !isSending && !pendingUserMessage && handleSendMessage()} 
                    className="pr-4 pl-16 py-3 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500" 
                    disabled={isChatDisabled || isSending || !!pendingUserMessage}
                    dir="auto"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                    {sourceCount} מקור{sourceCount !== 1 ? 'ות' : ''}
                  </div>
                </div>
                <Button 
                  onClick={() => handleSendMessage()} 
                  disabled={!message.trim() || isChatDisabled || isSending || !!pendingUserMessage}
                  className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  {isSending || pendingUserMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Example Questions */}
              {!isChatDisabled && !pendingUserMessage && !showAiLoading && exampleQuestions.length > 0 && (
                <div className="mt-4">
                  <Carousel className="w-full max-w-4xl">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {exampleQuestions.map((question, index) => (
                        <CarouselItem key={index} className="pl-2 md:pl-4 basis-auto">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-right whitespace-nowrap h-auto py-2 px-4 text-sm rounded-full border-gray-200 hover:bg-gray-50" 
                            onClick={() => handleExampleQuestionClick(question)}
                          >
                            {question}
                          </Button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {exampleQuestions.length > 2 && (
                      <>
                        <CarouselPrevious className="right-0" />
                        <CarouselNext className="left-0" />
                      </>
                    )}
                  </Carousel>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Clean Empty State
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
          <Card className="p-8 text-center bg-white border-0 shadow-sm max-w-md">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-blue-50">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">הוסף מקור כדי להתחיל</h2>
            <p className="text-gray-600 mb-6">העלה מסמכים, קישורים או טקסט כדי להתחיל לשוחח עם הבינה המלאכותית</p>
            <Button onClick={() => setShowAddSourcesDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 ml-2" />
              העלה מקור
            </Button>
          </Card>
        </div>
      )}
      
      {/* Add Sources Dialog */}
      <AddSourcesDialog open={showAddSourcesDialog} onOpenChange={setShowAddSourcesDialog} notebookId={notebookId} />
    </div>
  );
};

export default ChatArea;