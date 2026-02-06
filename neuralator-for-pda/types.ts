
export enum WitnessStatus {
  MONITORING = 'Monitoring...',
  THREAT_DETECTED = '⚠️ UNCIVILISED BEHAVIOUR DETECTED',
}

export interface AnalysisResult {
  isAggressive: boolean;
  severity: number;
  reason: string;
  stressAdjustment: number; // Impact on stress level (-20 to +50)
}

export interface QuietZone {
  name: string;
  distance: string;
  description: string;
  lat: number;
  lng: number;
}

export interface Incident {
  timestamp: string;
  quote: string;
  reason: string;
}
