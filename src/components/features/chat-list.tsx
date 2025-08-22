
"use client";

import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
};

interface ChatListProps {
  chats: ChatSession[];
  activeChatId?: string;
  deleteChat: (chatId: string) => void;
}

export function ChatList({ chats, activeChatId, deleteChat }: ChatListProps) {
    if (chats.length === 0) {
        return <p className="text-sm text-muted-foreground text-center mt-4">No conversations yet.</p>;
    }

  return (
    <ScrollArea className="flex-1 -mx-4">
      <div className="flex flex-col gap-2 px-4">
        {chats.map((chat) => (
          <div key={chat.id} className="group relative">
             <Link
                href={`/chats/${chat.id}`}
                className={`block p-3 rounded-lg text-sm truncate ${
                activeChatId === chat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {chat.title}
                <span className="block text-xs opacity-70 mt-1">
                {new Date(chat.createdAt).toLocaleDateString()}
                </span>
            </Link>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this chat session. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteChat(chat.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
