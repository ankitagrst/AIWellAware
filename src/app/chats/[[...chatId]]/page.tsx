
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatInterface } from "@/components/features/chat-interface";
import { ChatList } from "@/components/features/chat-list";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
};

export default function ChatsPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = Array.isArray(params.chatId) ? params.chatId[0] : undefined;

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // This function runs only on the client side
    const loadChats = () => {
        try {
            const savedChats = localStorage.getItem("chatSessions");
            if (savedChats) {
                setChats(JSON.parse(savedChats));
            }
        } catch (error) {
            console.error("Failed to load chats from localStorage", error);
        }
        setIsLoaded(true);
    };
    loadChats();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("chatSessions", JSON.stringify(chats));
      } catch (error) {
        console.error("Failed to save chats to localStorage", error);
      }
    }
  }, [chats, isLoaded]);

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      createdAt: new Date().toISOString(),
    };
    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    router.push(`/chats/${newChat.id}`);
  };

  const deleteChat = (idToDelete: string) => {
    const updatedChats = chats.filter((chat) => chat.id !== idToDelete);
    setChats(updatedChats);
    try {
      localStorage.removeItem(`chatHistory_${idToDelete}`);
    } catch (error) {
        console.error("Failed to delete chat history from localStorage", error);
    }
    // If the currently active chat is deleted, navigate back to the main chats page
    if (chatId === idToDelete) {
      router.push("/chats");
    }
  };

  const updateChatTitle = (id: string, newTitle: string) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === id ? { ...chat, title: newTitle } : chat
      )
    );
  };

  if (!isLoaded) {
    return (
        <div className="flex h-[calc(100vh-57px)] w-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-57px)]">
      <aside className="w-full max-w-xs border-r bg-card p-4 hidden md:flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <Button size="sm" variant="ghost" onClick={createNewChat}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Chat
            </Button>
        </div>
        <ChatList chats={chats} activeChatId={chatId} deleteChat={deleteChat} />
      </aside>
      <main className="flex-1">
        {chatId ? (
          <ChatInterface key={chatId} chatId={chatId} onFirstUserMessage={updateChatTitle} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
             <div className="md:hidden mb-6">
                <h1 className="text-2xl font-bold mb-4">Your Wellness Coach</h1>
                <p className="text-muted-foreground mb-4">Start a new conversation to begin your wellness journey.</p>
                <Button onClick={createNewChat}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Start New Chat
                </Button>
            </div>
             <div className="hidden md:flex flex-col items-center">
                <h1 className="text-2xl font-bold mb-2">Select a chat to begin</h1>
                <p className="text-muted-foreground">Or create a new conversation to start your wellness journey.</p>
             </div>
             <div className="mt-8 w-full max-w-md md:hidden">
               <h2 className="text-lg font-semibold mb-4">Your Conversations</h2>
               <ChatList chats={chats} activeChatId={chatId} deleteChat={deleteChat} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
