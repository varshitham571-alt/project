
import { GoogleGenAI } from "@google/genai";
import { SimulationState } from "../types";

// getAssistantResponse uses the Gemini API to provide intelligent feedback on the simulation state.
export const getAssistantResponse = async (
  userMessage: string,
  state: SimulationState
) => {
  // Always use a named parameter for the API key and pull it directly from process.env.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are the "ACC Simulation Assistant", an AI expert specialized in Adaptive Cruise Control systems.
    Current System State:
    - Speed: ${state.speed.toFixed(1)} km/h
    - Distance to vehicle ahead: ${state.distance.toFixed(1)} meters
    - Fuel Level: ${state.fuel.toFixed(1)}%
    - ACC Status: ${state.drivingMode === 'ACC' ? 'ACTIVE' : 'MANUAL'}
    - Road Type: ${state.roadType.toUpperCase()}
    - IMU Status: ${state.imuState}
    - Safety Level: ${state.safetyStatus.toUpperCase()}
    - Emergency Mode: ${state.emergencyActive ? 'ACTIVE' : 'INACTIVE'}

    Guidelines:
    1. Provide concise, professional, and technically accurate responses.
    2. Reference the live state data, safety status, and fuel levels in your answers.
    3. If the user asks why the speed is changing, explain based on the adaptive logic or fuel status.
    4. Keep the tone academic and professional, suitable for an engineering demonstration.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Diagnostic data unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with the central logic unit.";
  }
};
