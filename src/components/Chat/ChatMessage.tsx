
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

interface ChatMessageProps {
  content: string;
  isBot?: boolean;
  timestamp?: Date;
}

const ChatMessage = ({ content, isBot = false, timestamp = new Date() }: ChatMessageProps) => {
  return (
    <div className={cn("flex w-full gap-3", isBot ? "flex-row" : "flex-row-reverse")}>
      <Avatar className="h-8 w-8" />
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isBot ? "bg-secondary" : "bg-primary text-primary-foreground"
        )}
      >
        <p className="text-sm">{content}</p>
        <span className="text-xs opacity-50 mt-1 block">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
