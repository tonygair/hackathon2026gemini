
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Fix: Initializing GoogleGenAI with exactly the named parameter as required by guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTranscript = async (text: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this social interaction transcript for a person with Pathological Demand Avoidance (PDA). 
      Determine the 'stressAdjustment' (an integer from -20 to +50) representing the immediate impact on their nervous system arousal.
      
      - High Positive (+20 to +50): Direct demands, threats, coercion, perceived loss of autonomy, injustice.
      - Low Positive (+1 to +15): Indirect expectations, social pressure, complex questions.
      - Neutral (0): Purely informational, low stakes.
      - Negative (-1 to -20): Validation, autonomy support, co-regulation, safe language.
      
      Transcript: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isAggressive: {
              type: Type.BOOLEAN,
              description: 'Whether the text contains aggressive or coercive content.',
            },
            severity: {
              type: Type.NUMBER,
              description: 'Severity score from 0.0 to 1.0',
            },
            reason: {
              type: Type.STRING,
              description: 'Short explanation of the trigger or safety signal.',
            },
            stressAdjustment: {
              type: Type.INTEGER,
              description: 'The estimated change in stress level (-20 to +50).',
            }
          },
          required: ['isAggressive', 'severity', 'reason', 'stressAdjustment'],
        },
      },
    });

    // Fix: Accessing response.text directly as a property (not a method)
    const result = JSON.parse(response.text || '{}');
    return {
      isAggressive: !!result.isAggressive,
      severity: result.severity || 0,
      reason: result.reason || 'No specific reason provided.',
      stressAdjustment: result.stressAdjustment || 0,
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { isAggressive: false, severity: 0, reason: "Analysis failed.", stressAdjustment: 0 };
  }
};

export const generateManagerNotification = async (zoneName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a polite, professional, but firm 1-sentence notification to a manager stating that the employee is utilizing the "${zoneName}" for sensory regulation as per their workplace accommodation agreement. Do not include greetings.`,
    });
    return response.text || `Employee is utilizing ${zoneName} for regulation.`;
  } catch (error) {
    return `Employee is utilizing ${zoneName} for regulation.`;
  }
};
