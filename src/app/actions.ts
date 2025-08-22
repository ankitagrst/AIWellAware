"use server";

import { generatePersonalizedRitual, GeneratePersonalizedRitualInput } from "@/ai/flows/generate-personalized-ritual";
import { answerWellnessQuestion, AnswerWellnessQuestionInput } from "@/ai/flows/answer-wellness-questions";
import { generateDailyPlan, GenerateDailyPlanInput } from "@/ai/flows/generate-daily-plan";
import { textToSpeech, TextToSpeechInput } from "@/ai/flows/text-to-speech";

export async function generateRitualAction(
  prevState: any,
  input: GeneratePersonalizedRitualInput
) {
  try {
    const result = await generatePersonalizedRitual(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate ritual. Please try again." };
  }
}

export async function answerQuestionAction(input: AnswerWellnessQuestionInput) {
  try {
    const result = await answerWellnessQuestion(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to get an answer. Please try again." };
  }
}

export async function generateDailyPlanAction(
  prevState: any,
  input: GenerateDailyPlanInput
) {
  try {
    const result = await generateDailyPlan(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate daily plan. Please try again." };
  }
}

export async function textToSpeechAction(input: TextToSpeechInput) {
    try {
        const result = await textToSpeech(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to generate audio. Please try again." };
    }
}
