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
    negotiation?: {
      order_id?: string;
      product_id?: string;
      seller_id?: string;
      proposed_price?: number;
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

  const handleNegotiation = async (message: string) => {
    const negotiation = chatSession?.session_data?.negotiation;
    
    if (!negotiation?.product_id) {
      const productMatch = message.match(/negotiate .* (\d+)/i);
      if (productMatch) {
        const { data: product } = await supabase
          .from('products')
          .select('*, profiles!products_farmer_id_fkey(full_name)')
          .eq('id', productMatch[1])
          .single();

        if (product) {
          await updateSession({
            negotiation: {
              product_id: product.id,
              seller_id: product.farmer_id,
              proposed_price: product.price
            }
          });
          return `Current price is ₹${product.price}/${product.unit}. What price would you like to propose?`;
        }
      }
      return "Please specify the product you want to negotiate for.";
    }

    const priceMatch = message.match(/(?:₹|rs\.? )?(\d+)/i);
    if (priceMatch) {
      const proposedPrice = parseInt(priceMatch[1]);
      
      // Create a new message in the negotiations
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          sender_id: session?.user.id,
          receiver_id: negotiation.seller_id,
          content: `Proposed price: ₹${proposedPrice}`,
          order_id: negotiation.order_id
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return "Sorry, there was an error sending your proposal.";
      }

      await updateSession({
        negotiation: { ...negotiation, proposed_price: proposedPrice }
      });

      return "Your price proposal has been sent to the seller. They will respond shortly.";
    }

    return "Please specify your proposed price.";
  };

  const handleOrderManagement = async (message: string) => {
    if (message.toLowerCase().includes('my orders')) {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            name,
            price,
            unit
          ),
          reviews (
            rating,
            comment
          )
        `)
        .eq('buyer_id', session?.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return "Sorry, I couldn't fetch your orders.";
      }

      if (!orders.length) {
        return "You haven't placed any orders yet.";
      }

      return `Here are your orders:\n${orders.map(order => 
        `• ${order.products.name} - ${order.quantity} ${order.products.unit}
         Price: ₹${order.total_price}
         Status: ${order.status}
         ${order.reviews.length ? `Rating: ${order.reviews[0].rating}/5` : '(Not reviewed yet)'}`
      ).join('\n\n')}`;
    }

    return "You can view your orders by saying 'show my orders'";
  };

  const handleProductAnalytics = async (message: string) => {
    if (message.toLowerCase().includes('analytics') || message.toLowerCase().includes('insights')) {
      const { data: products } = await supabase
        .from('products')
        .select(`
          *,
          reviews!inner (
            rating,
            comment
          )
        `)
        .eq('farmer_id', session?.user.id);

      const analytics = products?.reduce((acc: any, product) => {
        const avgRating = product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length;
        acc[product.name] = {
          avgRating,
          totalReviews: product.reviews.length,
          price: product.price
        };
        return acc;
      }, {});

      if (!analytics || Object.keys(analytics).length === 0) {
        return "No analytics available yet. You need some orders and reviews first.";
      }

      return `Here are your product insights:\n${Object.entries(analytics).map(([product, data]: [string, any]) =>
        `• ${product}:
         Average Rating: ${data.avgRating.toFixed(1)}/5
         Total Reviews: ${data.totalReviews}
         Current Price: ₹${data.price}`
      ).join('\n\n')}`;
    }

    return "You can view product analytics by saying 'show analytics' or 'show insights'";
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

      if (content.toLowerCase().includes('negotiate')) {
        response = await handleNegotiation(content);
      } else if (content.toLowerCase().includes('orders')) {
        response = await handleOrderManagement(content);
      } else if (content.toLowerCase().includes('analytics') || content.toLowerCase().includes('insights')) {
        response = await handleProductAnalytics(content);
      } else if (profile?.is_farmer && content.toLowerCase().includes('add product')) {
        response = await handleProductListing(content);
      } else if (content.toLowerCase().includes('search') || content.toLowerCase().includes('show')) {
        response = await handleProductSearch(content);
      } else {
        response = "How can I help you today? You can:\n" +
          (profile?.is_farmer ?
            "- Add a new product\n- Update product details\n- View your listings\n- Check product analytics" :
            "- Search for products\n- Compare prices\n- Place an order\n- Negotiate prices\n- View your orders");
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
