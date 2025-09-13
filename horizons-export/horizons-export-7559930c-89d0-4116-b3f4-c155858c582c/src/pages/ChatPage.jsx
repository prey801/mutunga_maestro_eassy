import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, User, Bot, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const ChatPage = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hello! Welcome to Maestro Essays support. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "Thank you for your message! Our support team will get back to you shortly.",
        "I understand your concern. Let me connect you with one of our specialists.",
        "That's a great question! Our writers are experts in that field and can definitely help.",
        "I'd be happy to help you with your order. Can you provide more details?",
        "Our quality guarantee ensures you'll be satisfied with your paper. Would you like to know more?",
        "We offer 24/7 support and unlimited revisions. How else can I assist you today?"
      ];

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: randomResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickActions = [
    "I need help with my order",
    "What are your prices?",
    "How do I place an order?",
    "Do you offer revisions?",
    "What subjects do you cover?",
    "How long does it take?"
  ];

  const handleQuickAction = (action) => {
    setNewMessage(action);
  };

  return (
    <div className="min-h-screen py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Live <span className="text-gradient">Chat Support</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get instant help from our support team. We're here 24/7 to answer your questions and assist with your orders.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="shadow-xl border-0 h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-6 h-6 text-sky-600" />
                    <span>Support Chat</span>
                    <Badge className="bg-green-100 text-green-700 ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Online
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 p-0 overflow-hidden">
                  {/* Messages */}
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-sky-600' : 'bg-gray-600'}`}>
                              {message.type === 'user' ? (
                                <User className="w-4 h-4 text-white" />
                              ) : (
                                <Bot className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div className={`rounded-lg p-3 ${message.type === 'user' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                              <p className="text-sm">{message.message}</p>
                              <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-sky-100' : 'text-gray-500'}`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="flex items-start space-x-2">
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="border-t p-4">
                      <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1"
                        />
                        <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
                          <Send className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Quick Actions */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-3 text-sm"
                      onClick={() => handleQuickAction(action)}
                    >
                      {action}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Support Info */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Support Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span className="text-sm">24/7 Live Support</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Our support team is available around the clock to help you with any questions or concerns.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Contact Methods:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Live Chat (Fastest)</li>
                      <li>• Email Support</li>
                      <li>• Phone Support</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Common Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">How do I track my order?</p>
                    <p className="text-xs text-gray-600">You'll receive email updates and can check status in your account.</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Do you offer revisions?</p>
                    <p className="text-xs text-gray-600">Yes, unlimited revisions until you're satisfied.</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Is my payment secure?</p>
                    <p className="text-xs text-gray-600">All payments are processed securely through PayPal.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => toast({ title: "🚧 FAQ page isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}
                  >
                    View All FAQs
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;