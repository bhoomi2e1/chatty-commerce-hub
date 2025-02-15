
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import ChatMessage from "../components/Chat/ChatMessage";
import ChatInput from "../components/Chat/ChatInput";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  context: string[];
  session_data: {
    current_flow?: string;
    product_draft?: {
      name?: string;
      category?: string;
      price?: number;
      quantity?: number;
      unit?: string;
      location?: string;
      harvest_date?: string;
    };
    search_params?: {
      category?: string;
      max_price?: number;
      location?: string;
    };
  };
}

export default function Index() {
  const { session, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const initializeSession = async () => {
      if (session?.user) {
        // Check for existing session
        const { data: existingSession } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('last_interaction', { ascending: false })
          .limit(1)
          .single();

        if (existingSession) {
          setChatSession(existingSession);
        } else {
          // Create new session
          const { data: newSession, error } = await supabase
            .from('chat_sessions')
            .insert({
              user_id: session.user.id,
              context: [],
              session_data: {}
            })
            .select()
            .single();

          if (error) {
            toast.error("Failed to create chat session");
          } else {
            setChatSession(newSession);
          }
        }
      }
    };

    initializeSession();
  }, [session]);

  useEffect(() => {
    // Initial welcome message
    if (messages.length === 0) {
      const welcomeMessage = session?.user
        ? `Welcome ${profile?.full_name || 'back'}! What would you like to do today?
        
${profile?.is_farmer ? `As a farmer, you can:
1. Add a new product
2. Update product details
3. View your listings
4. Check market prices` 
: `You can:
1. Search for products
2. Compare prices
3. Place an order
4. View your orders`}`
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

  const updateSession = async (sessionData: any) => {
    if (!chatSession?.id || !session?.user) return;

    const { error } = await supabase
      .from('chat_sessions')
      .update({
        last_interaction: new Date().toISOString(),
        session_data: {
          ...chatSession.session_data,
          ...sessionData
        }
      })
      .eq('id', chatSession.id);

    if (error) {
      console.error('Failed to update session:', error);
    }
  };

  const handleProductListing = async (message: string) => {
    const currentFlow = chatSession?.session_data?.current_flow;
    const productDraft = chatSession?.session_data?.product_draft || {};

    if (!currentFlow) {
      await updateSession({
        current_flow: 'product_listing',
        product_draft: {}
      });
      return "Please provide the product name:";
    }

    if (!productDraft.name) {
      await updateSession({
        product_draft: { ...productDraft, name: message }
      });
      return "What category does this product belong to? (vegetables, fruits, grains, dairy)";
    }

    if (!productDraft.category) {
      await updateSession({
        product_draft: { ...productDraft, category: message }
      });
      return "What is the price per unit? (e.g., '50 per kg' or '100 per dozen')";
    }

    // Continue with other product details...
    return "Product listing in progress...";
  };

  const handleProductSearch = async (message: string) => {
    const searchParams = chatSession?.session_data?.search_params || {};
    
    if (message.toLowerCase().includes('under')) {
      const priceMatch = message.match(/under (?:₹|rs\.? )?(\d+)/i);
      if (priceMatch) {
        const maxPrice = parseInt(priceMatch[1]);
        await updateSession({
          search_params: { ...searchParams, max_price: maxPrice }
        });
      }
    }

    // Perform the search based on parameters
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .lt('price', searchParams.max_price || 999999)
      .order('price');

    if (error) {
      return "Sorry, I couldn't find any products matching your criteria.";
    }

    if (products.length === 0) {
      return "No products found matching your criteria.";
    }

    return `Here are the available products:\n${products
      .map(p => `• ${p.name} (₹${p.price}/${p.unit}) - ${p.location}`)
      .join('\n')}`;
  };

  const handleSendMessage = async (content: string) => {
    if (!session?.user) {
      setMessages(prev => [
        ...prev,
        { content: "Please sign in to continue.", isBot: true, timestamp: new Date() }
      ]);
      return;
    }

    // Add user message
    setMessages(prev => [
      ...prev,
      { content, isBot: false, timestamp: new Date() }
    ]);

    setIsLoading(true);

    try {
      let response: string;

      if (profile?.is_farmer && content.toLowerCase().includes('add product')) {
        response = await handleProductListing(content);
      } else if (content.toLowerCase().includes('search') || content.toLowerCase().includes('show')) {
        response = await handleProductSearch(content);
      } else {
        response = "How can I help you today? You can:\n" +
          (profile?.is_farmer ?
            "- Add a new product\n- Update product details\n- View your listings" :
            "- Search for products\n- Compare prices\n- Place an order");
      }

      setMessages(prev => [
        ...prev,
        { content: response, isBot: true, timestamp: new Date() }
      ]);
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error("An error occurred while processing your request");
    } finally {
      setIsLoading(false);
    }
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
