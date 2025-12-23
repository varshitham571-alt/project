
export type RoadType = 'highway' | 'city';
export type IMUState = 'Accelerating' | 'Braking' | 'Stable';
export type DrivingMode = 'ACC' | 'Manual';
export type SafetyStatus = 'Safe' | 'Danger';

export interface WeatherData {
  temp: number;
  condition: string;
  location: string;
}

export interface TelemetryPoint {
  time: number;
  speed: number;
  distance: number;
  acceleration: number;
}

export interface SimulationState {
  speed: number;
  targetSpeed: number;
  distance: number;
  drivingMode: DrivingMode;
  emergencyActive: boolean;
  isPaused: boolean;
  roadType: RoadType;
  imuState: IMUState;
  safetyStatus: SafetyStatus;
  fuel: number;
  timestamp: number;
  weather?: WeatherData;
  history: TelemetryPoint[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
