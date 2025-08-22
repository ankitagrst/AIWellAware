'use server';

/**
 * @fileOverview Personalized wellness ritual generation flow.
 *
 * - generatePersonalizedRitual - A function that generates a personalized wellness ritual.
 * - GeneratePersonalizedRitualInput - The input type for the generatePersonalizedRitual function.
 * - GeneratePersonalizedRitualOutput - The return type for the generatePersonalizedRitual function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedRitualInputSchema = z.object({
  preferences: z
    .string()
    .describe(
      'User preferences for the wellness ritual, including preferred activities, time of day, and focus areas (e.g., stress reduction, energy boost).'      
    ),
  historicalPractices: z
    .string()
    .optional()
    .describe(
      'Any specific historical Sanatan, Ayurvedic, or Vedic practices the user is interested in incorporating.'
    ),
  scientificInsights: z
    .string()
    .optional()
    .describe(
      'Any scientific insights or research the user wants the ritual to be based on.'
    ),
});
export type GeneratePersonalizedRitualInput = z.infer<typeof GeneratePersonalizedRitualInputSchema>;

const GeneratePersonalizedRitualOutputSchema = z.object({
  ritualDescription: z
    .string()
    .describe('A detailed description of the personalized wellness ritual.'),
  benefits: z
    .string()
    .describe('A description of the potential benefits of following the ritual.'),
  traditionsInvolved: z
    .string()
    .describe("The Sanatan, Ayurvedic, and Vedic traditions that the ritual is derived from."),
});
export type GeneratePersonalizedRitualOutput = z.infer<typeof GeneratePersonalizedRitualOutputSchema>;

export async function generatePersonalizedRitual(
  input: GeneratePersonalizedRitualInput
): Promise<GeneratePersonalizedRitualOutput> {
  return generatePersonalizedRitualFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedRitualPrompt',
  input: {schema: GeneratePersonalizedRitualInputSchema},
  output: {schema: GeneratePersonalizedRitualOutputSchema},
  prompt: `You are an expert in Sanatan, Ayurvedic, and Vedic traditions, specializing in creating personalized wellness rituals.

  Based on the user's preferences, historical practices of interest, and any scientific insights they want to incorporate, create a detailed wellness ritual.

  Preferences: {{{preferences}}}
  Historical Practices: {{{historicalPractices}}}
  Scientific Insights: {{{scientificInsights}}}

  Provide a detailed description of the ritual, including specific activities, timings, and guidelines.
  Also, describe the potential benefits of following the ritual and which traditions it is derived from.
  Make it easy to incorporate into daily life.
  Always cite your sources if you leverage scientific insights.`, // added citation instruction to the prompt.
});

const generatePersonalizedRitualFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedRitualFlow',
    inputSchema: GeneratePersonalizedRitualInputSchema,
    outputSchema: GeneratePersonalizedRitualOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
