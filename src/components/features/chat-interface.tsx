
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { answerQuestionAction, textToSpeechAction } from "@/app/actions";
import { Loader2, Send, Sparkles, User, BookOpen, Volume2, StopCircle, Paperclip, X } from "lucide-react";
import { Logo } from "../logo";
import Textarea from "react-textarea-autosize";
import type { AnswerWellnessQuestionInput } from "@/ai/flows/answer-wellness-questions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
  references?: string[];
  image?: string; // Data URI for images
};

type Persona = "holistic" | "medical" | "sanatana" | "ayurveda";

function parseContent(content: string) {
    const lines = content.trim().split('\n').filter(line => line.trim().length > 0);
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let listType: 'ol' | 'ul' | null = null;

    const flushList = () => {
        if (listItems.length > 0 && listType) {
            const ListTag = listType;
            elements.push(
                <ListTag key={`list-${elements.length}`} className={`pl-6 space-y-1 my-2 ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}>
                    {listItems.map((item, index) => <li key={index}>{parseLineForMarkdown(item)}</li>)}
                </ListTag>
            );
            listItems = [];
            listType = null;
        }
    };

    const parseLineForMarkdown = (line: string) => {
        return line.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((text, i) => {
            if (text.startsWith('**') && text.endsWith('**')) {
                return <strong key={`strong-${i}`} className="font-semibold">{text.slice(2, -2)}</strong>;
            }
            if (text.startsWith('*') && text.endsWith('*')) {
                return <strong key={`italic-${i}`} className="font-semibold">{text.slice(1, -1)}</strong>;
            }
            return text;
        });
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('## ')) {
            flushList();
            elements.push(<h2 key={index} className="text-xl font-semibold mt-4 mb-2 font-headline">{trimmedLine.substring(3)}</h2>);
        } else if (/^\d+\.\s/.test(trimmedLine)) {
            if (listType !== 'ol') flushList();
            listType = 'ol';
            listItems.push(trimmedLine.replace(/^\d+\.\s/, ''));
        } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            if (listType !== 'ul') flushList();
            listType = 'ul';
            listItems.push(trimmedLine.substring(2));
        } else {
            flushList();
            elements.push(<p key={index} className="leading-relaxed">{parseLineForMarkdown(trimmedLine)}</p>);
        }
    });

    flushList();

    return elements;
}


const examplePrompts = [
  "How can I reduce stress right now?",
  "I'm feeling anxious today.",
  "What's a simple morning routine for energy?",
  "आज मैं चिंतित महसूस कर रहा हूँ।",
];

interface ChatInterfaceProps {
    chatId: string;
    onFirstUserMessage: (chatId: string, title: string) => void;
}

export function ChatInterface({ chatId, onFirstUserMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userProfile, setUserProfile] = useState<AnswerWellnessQuestionInput['userProfile'] | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const [persona, setPersona] = useState<Persona>("holistic");
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);
  const [isTtsLoading, setIsTtsLoading] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const getChatHistoryKey = useCallback(() => `chatHistory_${chatId}`, [chatId]);

  useEffect(() => {
    setIsClient(true);
    try {
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
            const parsedProfile = JSON.parse(savedProfile);
            setUserProfile({
                age: parsedProfile.age,
                lifestyle: parsedProfile.lifestyle,
                healthGoals: parsedProfile.healthGoals
            });
        }
    } catch (error) {
        console.error("Failed to load user profile from localStorage", error);
    }
    
    try {
      const savedMessages = localStorage.getItem(getChatHistoryKey());
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([]);
      }
    } catch (error) {
        console.error("Failed to parse chat history:", error)
        setMessages([]);
    }
  }, [chatId, getChatHistoryKey]);
  
  useEffect(() => {
    if(isClient) {
        try {
            if (messages.length > 0) {
              localStorage.setItem(getChatHistoryKey(), JSON.stringify(messages));
            }
        } catch (error) {
            console.error("Failed to save chat history to localStorage", error);
        }
    }
  }, [messages, getChatHistoryKey, isClient]);


  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div');
            if (viewport) {
                viewport.scrollTo({
                    top: viewport.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSendMessage = useCallback(async (prompt?: string) => {
    const messageToSend = prompt || input;
    if (messageToSend.trim() === "" && !imagePreview) return;

    if (messages.length === 0) {
        onFirstUserMessage(chatId, messageToSend || "Image Message");
    }

    const userMessage: Message = { 
        role: "user", 
        content: messageToSend,
        image: imagePreview || undefined
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setImagePreview(null);
    setIsLoading(true);

    const inputData: AnswerWellnessQuestionInput = {
      question: messageToSend,
      persona: persona,
      history: messages.map(({ references, image, ...rest }) => rest),
      imageDataUri: imagePreview || undefined,
    };
    if (userProfile) {
      inputData.userProfile = userProfile;
    }

    const response = await answerQuestionAction(inputData);

    if (response.success && response.data) {
      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.answer,
        references: response.data.references,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      const errorMessage: Message = {
        role: "assistant",
        content:
          response.error || "Sorry, I couldn't process your request.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
    setIsLoading(false);
  }, [input, imagePreview, messages, persona, userProfile, chatId, onFirstUserMessage]);
  
  const handlePlayAudio = useCallback(async (text: string, index: number) => {
    if (playingMessageIndex === index) {
      audioPlayer?.pause();
      setPlayingMessageIndex(null);
      return;
    }
    
    if(audioPlayer) {
      audioPlayer.pause();
    }

    setIsTtsLoading(index);
    const response = await textToSpeechAction(text);
    setIsTtsLoading(null);

    if (response.success && response.data?.audio) {
      const newAudio = new Audio(response.data.audio);
      newAudio.onended = () => {
          setPlayingMessageIndex(null);
      };
      setAudioPlayer(newAudio);
      setPlayingMessageIndex(index);
      newAudio.play();
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: response.error || "Failed to generate audio.",
        });
    }
  }, [audioPlayer, playingMessageIndex, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const WelcomeMessage = () => (
    <div className="flex flex-col items-center justify-center text-center p-4 h-full">
       <div className="mb-4">
        <Logo className="h-16 w-16 text-primary" />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold font-headline mb-2">Welcome to your AI Wellness Coach</h1>
      <p className="text-muted-foreground mb-10 max-w-md">How can I support your well-being today? Select a persona and get started with one of the prompts below.</p>
       <div className="mb-8 w-full max-w-xs">
          <Select value={persona} onValueChange={(value: Persona) => setPersona(value)}>
              <SelectTrigger>
                  <SelectValue placeholder="Select Persona" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="holistic">Holistic Wellness Coach</SelectItem>
                  <SelectItem value="medical">Medical Professional</SelectItem>
                  <SelectItem value="sanatana">Sanatana Scholar</SelectItem>
                  <SelectItem value="ayurveda">Ayurvedic Expert</SelectItem>
              </SelectContent>
          </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {examplePrompts.map((prompt, i) => (
           <Button key={i} variant="outline" className="h-auto py-3 px-4 text-left whitespace-normal text-sm" onClick={() => handleSendMessage(prompt)}>
               {prompt}
           </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background relative">
        {messages.length > 0 && (
             <div className="p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto">
                     <Select value={persona} onValueChange={(value: Persona) => setPersona(value)}>
                        <SelectTrigger className="w-full md:w-64">
                            <SelectValue placeholder="Select Persona" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="holistic">Holistic Wellness Coach</SelectItem>
                            <SelectItem value="medical">Medical Professional</SelectItem>
                            <SelectItem value="sanatana">Sanatana Scholar</SelectItem>
                            <SelectItem value="ayurveda">Ayurvedic Expert</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
             </div>
        )}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="max-w-4xl w-full mx-auto pb-56">
            {messages.length === 0 && !isLoading ? (
                <WelcomeMessage />
            ) : (
            <div className="space-y-6">
                {messages.map((message, index) => (
                <div
                    key={index}
                    className={`flex items-start gap-4 ${
                    message.role === "user" ? "justify-end" : ""
                    }`}
                >
                    {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 border bg-background rounded-full">
                        <AvatarFallback className="bg-primary text-primary-foreground rounded-full">
                        <Sparkles className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    )}
                    <div
                      className={`max-w-xl rounded-lg p-3 text-sm break-words w-auto ${
                          message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border"
                      }`}
                    >
                        {message.image && (
                           <div className="relative w-full aspect-video rounded-md overflow-hidden mb-2">
                               <Image src={message.image} alt="User upload" layout="fill" objectFit="cover" />
                           </div>
                        )}
                        <div className="prose prose-sm max-w-none prose-p:m-0 prose-headings:m-0 text-inherit">
                            {parseContent(message.content)}
                        </div>
                        {message.references && message.references.length > 0 && (
                            <div className="mt-4 pt-3 border-t">
                                <h3 className="text-xs font-semibold flex items-center gap-2 mb-2 text-muted-foreground">
                                    <BookOpen className="h-4 w-4" />
                                    References
                                </h3>
                                <ul className="space-y-1 text-xs">
                                    {message.references.map((ref, i) => (
                                    <li key={i} className="truncate">
                                        <a href={ref} target="_blank" rel="noopener noreferrer" className="hover:underline">{ref}</a>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {message.role === "assistant" && message.content && (
                            <div className="mt-2 pt-2 border-t flex justify-end">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => handlePlayAudio(message.content, index)}
                                    disabled={isTtsLoading === index}
                                >
                                    {isTtsLoading === index ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : playingMessageIndex === index ? (
                                        <StopCircle className="h-4 w-4" />
                                    ) : (
                                        <Volume2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                    {message.role === "user" && (
                    <Avatar className="h-8 w-8 rounded-full">
                        <AvatarFallback className="rounded-full">
                        <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    )}
                </div>
                ))}
            </div>
            )}
            {isLoading && (
            <div className="flex items-start gap-4 mt-6">
                <Avatar className="h-8 w-8 border bg-background rounded-full">
                <AvatarFallback className="bg-primary text-primary-foreground rounded-full">
                    <Sparkles className="h-4 w-4" />
                </AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 text-sm bg-card border flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary"/>
                </div>
            </div>
            )}
        </div>
      </ScrollArea>
      <div className="p-4 bg-background/95 backdrop-blur-sm absolute bottom-0 left-0 right-0">
        <div className="max-w-4xl mx-auto">
          {imagePreview && (
            <div className="relative mb-2 w-32 h-32 rounded-lg overflow-hidden border">
              <Image src={imagePreview} alt="Preview" layout="fill" objectFit="cover" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6 bg-black/50 text-white rounded-full"
                onClick={() => setImagePreview(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="relative flex items-end">
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <Button
                size="icon"
                variant="ghost"
                className="absolute left-2.5 bottom-2 h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
            >
                <Paperclip className="h-4 w-4" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask your wellness coach..."
              className="flex-1 pl-12 pr-12 rounded-lg max-h-48 resize-none py-3 shadow-md bg-card border-input border"
              disabled={isLoading}
              rows={1}
              maxRows={5}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2.5 bottom-2 h-8 w-8 rounded-full"
              onClick={() => handleSendMessage()}
              disabled={isLoading || (input.trim() === "" && !imagePreview)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">WellAware AI can make mistakes. Consider checking important information.</p>
        </div>
      </div>
    </div>
  );
}
