
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import ChatMessage from "../components/Chat/ChatMessage";
import ChatInput from "../components/Chat/ChatInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Message {
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export default function Index() {
  const { session, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Initial welcome message
    if (messages.length === 0) {
      const welcomeMessage = session?.user 
        ? `Welcome back${profile?.full_name ? ', ' + profile.full_name : ''}! How can I help you today?`
        : "Welcome to FarmMarket! Please sign in to start buying or selling products.";
      
      setMessages([
        {
          content: welcomeMessage,
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    }
  }, [session, profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    setMessages((prev) => [
      ...prev,
      { content, isBot: false, timestamp: new Date() },
    ]);

    setIsLoading(true);

    // Simulate bot response (replace with actual chatbot logic later)
    setTimeout(() => {
      let response = "I'm sorry, but you need to sign in first to access this feature.";
      
      if (session?.user) {
        if (content.toLowerCase().includes("sell")) {
          response = "To sell products, you'll need to provide details like product name, price, quantity, and location. Would you like to list a product now?";
        } else if (content.toLowerCase().includes("buy")) {
          response = "I can help you find products. What type of products are you looking for?";
        } else if (content.toLowerCase().includes("price")) {
          response = "I can show you current market prices. Which product would you like to know about?";
        } else {
          response = "How can I help you? You can:\n- Buy products\n- Sell products\n- Check prices\n- View your orders";
        }
      }

      setMessages((prev) => [
        ...prev,
        { content: response, isBot: true, timestamp: new Date() },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto pt-20 px-4">
        <Card className="h-[calc(100vh-8rem)] mt-4 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} {...message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t">
            <ChatInput 
              onSend={handleSendMessage} 
              disabled={isLoading || !session?.user}
            />
            {!session?.user && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Please sign in to start chatting
              </p>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
