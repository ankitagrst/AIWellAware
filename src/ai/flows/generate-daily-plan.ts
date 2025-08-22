'use server';

/**
 * @fileOverview A flow to generate a personalized daily wellness plan.
 *
 * - generateDailyPlan - A function that generates a personalized daily wellness plan.
 * - GenerateDailyPlanInput - The input type for the generateDailyPlan function.
 * - GenerateDailyPlanOutput - The return type for the generateDailyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyPlanInputSchema = z.object({
  healthGoals: z.string().describe("The user's primary health goals (e.g., reduce stress, improve sleep)."),
  preferences: z.string().describe('User preferences for activities (e.g., enjoys yoga, prefers quiet activities).'),
  lifestyle: z.string().optional().describe('The user’s lifestyle (e.g., sedentary, active).'),
});
export type GenerateDailyPlanInput = z.infer<typeof GenerateDailyPlanInputSchema>;

const DailyPlanSectionSchema = z.object({
    title: z.string().describe("The title for this section of the day (e.g., 'Morning Focus')."),
    activities: z.array(z.string()).describe('A list of 2-3 specific, actionable wellness activities for this part of the day.'),
    description: z.string().describe('A brief explanation of why these activities are beneficial for the user\'s goals.')
});

const GenerateDailyPlanOutputSchema = z.object({
  morning: DailyPlanSectionSchema,
  afternoon: DailyPlanSectionSchema,
  evening: DailyPlanSectionSchema,
});
export type GenerateDailyPlanOutput = z.infer<typeof GenerateDailyPlanOutputSchema>;

export async function generateDailyPlan(input: GenerateDailyPlanInput): Promise<GenerateDailyPlanOutput> {
  return generateDailyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyPlanPrompt',
  input: {schema: GenerateDailyPlanInputSchema},
  output: {schema: GenerateDailyPlanOutputSchema},
  prompt: `You are an expert holistic wellness coach. Your task is to create a personalized, actionable daily wellness plan for a user based on their profile. The plan should be divided into three sections: Morning, Afternoon, and Evening. Each section should contain a title, a short description of the benefits, and a list of 2-3 simple, actionable activities.

User Profile:
- Health Goals: {{{healthGoals}}}
- Preferences: {{{preferences}}}
- Lifestyle: {{{lifestyle}}}

Generate a plan that aligns with their goals and preferences, incorporating a mix of mindfulness, physical activity, and healthy habits. Ensure the activities are easy to understand and integrate into a daily routine.`,
});

const generateDailyPlanFlow = ai.defineFlow(
  {
    name: 'generateDailyPlanFlow',
    inputSchema: GenerateDailyPlanInputSchema,
    outputSchema: GenerateDailyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
