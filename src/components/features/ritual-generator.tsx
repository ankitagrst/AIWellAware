
"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateRitualAction } from "@/app/actions";
import type { GeneratePersonalizedRitualOutput } from "@/ai/flows/generate-personalized-ritual";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, BookHeart, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  preferences: z
    .string()
    .min(10, "Please describe your preferences in a bit more detail."),
  historicalPractices: z.string().optional(),
  scientificInsights: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type State = {
  success: boolean;
  data?: GeneratePersonalizedRitualOutput;
  error?: string;
} | null;

const initialState: State = null;

function parseContent(content: string) {
    if (!content) return [];
    const lines = content.trim().split('\n').filter(line => line.trim().length > 0);
    const elements: JSX.Element[] = [];
    let listItems: { text: string, type: 'ul' | 'ol' }[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            const listType = listItems[0].type;
            const ListTag = listType;
            elements.push(
                <ListTag key={`list-${elements.length}`} className={`pl-6 space-y-1 my-2 ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}>
                    {listItems.map((item, index) => <li key={index}>{parseLine(item.text)}</li>)}
                </ListTag>
            );
            listItems = [];
        }
    };
    
    const parseLine = (line: string) => {
        return line.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((text, i) => {
            if (text.startsWith('**') && text.endsWith('**')) {
                return <strong key={`strong-${i}`} className="font-semibold">{text.slice(2, -2)}</strong>;
            }
            if (text.startsWith('*') && text.endsWith('*')) {
                return <strong key={`italic-${i}`} className="font-semibold">{text.slice(1, -1)}</strong>;
            }
            return text;
        });
    }

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        const isUnorderedListItem = trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ');
        const isOrderedListItem = /^\d+\.\s/.test(trimmedLine);

        if (trimmedLine.startsWith('## ')) {
            flushList();
            elements.push(<h2 key={index} className="text-xl font-semibold mt-4 mb-2 font-headline">{trimmedLine.substring(3)}</h2>);
        } else if (isUnorderedListItem) {
            if (listItems.length > 0 && listItems[0].type !== 'ul') flushList();
            listItems.push({ text: trimmedLine.substring(2), type: 'ul' });
        } else if (isOrderedListItem) {
            if (listItems.length > 0 && listItems[0].type !== 'ol') flushList();
            listItems.push({ text: trimmedLine.replace(/^\d+\.\s/, ''), type: 'ol' });
        } else {
            flushList();
            elements.push(<p key={index} className="leading-relaxed">{parseLine(trimmedLine)}</p>);
        }
    });

    flushList();

    return elements;
}


export function RitualGenerator() {
  const [state, formAction] = useActionState(generateRitualAction, initialState);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferences: "",
      historicalPractices: "",
      scientificInsights: "",
    },
  });

  useEffect(() => {
    if (state?.error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: state.error,
        });
    }
  }, [state, toast]);

  const onSubmit = (data: FormValues) => {
    startTransition(() => {
        formAction(data);
    });
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Your Preferences</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I prefer morning activities, need help with stress reduction, and enjoy gentle yoga."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe your wellness goals, preferred time of day, and any activities you enjoy.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="historicalPractices"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Historical Interests (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Interested in Ayurvedic doshas or specific Vedic chants." {...field} />
                    </FormControl>
                    <FormDescription>
                      Mention any specific Sanatan, Ayurvedic, or Vedic practices you'd like to include.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scientificInsights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Scientific Focus (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Based on research about mindfulness and cortisol levels." {...field} />
                    </FormControl>
                    <FormDescription>
                      Include any scientific research or principles you want the ritual to consider.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SubmitButton isPending={isPending} />
            </form>
          </Form>
        </CardContent>
      </Card>

      {state?.success && state.data && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <h2 className="text-2xl font-headline font-bold text-center">Your Personalized Wellness Ritual</h2>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary" />
                        Ritual Description
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none prose-p:my-2 prose-h2:my-4 prose-ul:my-2 prose-ol:my-2">
                    {parseContent(state.data.ritualDescription)}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="text-primary" />
                        Potential Benefits
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                    {parseContent(state.data.benefits)}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookHeart className="text-primary" />
                        Traditions Involved
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                     {parseContent(state.data.traditionsInvolved)}
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}

function SubmitButton({ isPending }: { isPending: boolean }) {
    return (
        <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate My Ritual
                </>
            )}
        </Button>
    )
}
