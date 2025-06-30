import { useParams } from "wouter";
import ChatInterface from "@/components/chat/ChatInterface";

export default function ChatPage() {
  const { id } = useParams<{ id?: string }>();
  const chatId = id ? parseInt(id) : undefined;

  return <ChatInterface initialChatId={chatId} />;
}
