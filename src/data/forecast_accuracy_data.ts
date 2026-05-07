// Auto-generated forecast accuracy mock data — Phase 5
// 12 weeks of historical predicted vs actual per district
// Hit rate ~67-100% (mean 84%) — honest mock reflecting realistic model performance

export interface AccuracyHistoryEntry {
  week_ending: string;
  predicted: number;
  actual: number;
  predicted_class: 'Low'|'Moderate'|'High'|'Very High';
  actual_class: 'Low'|'Moderate'|'High'|'Very High';
  class_hit: boolean;
  abs_error: number;
  pct_error: number;
}

export interface AccuracyMetrics {
  mae: number;
  mape_pct: number;
  hit_rate_pct: number;
  n_weeks: number;
}

export interface ModelRun {
  run_date: string;
  window_start: string;
  window_end: string;
  districts_covered: number;
  model_version: string;
}

export const FORECAST_ACCURACY: Record<string, {
  history: AccuracyHistoryEntry[];
  metrics: AccuracyMetrics;
}> = {
  "Bengaluru Urban": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 73,
        "actual": 86,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 13,
        "pct_error": 15.1
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 54,
        "actual": 50,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 8.0
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 39,
        "actual": 46,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 7,
        "pct_error": 15.2
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 47,
        "actual": 43,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 9.3
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 41,
        "actual": 37,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 10.8
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 30,
        "actual": 34,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 11.8
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 118,
        "actual": 41,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 77,
        "pct_error": 187.8
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 28,
        "actual": 33,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 5,
        "pct_error": 15.2
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 124,
        "actual": 29,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 95,
        "pct_error": 327.6
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 27,
        "actual": 28,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 3.6
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 28,
        "actual": 31,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 9.7
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 133,
        "actual": 35,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 98,
        "pct_error": 280.0
      }
    ],
    "metrics": {
      "mae": 26.2,
      "mape_pct": 74.5,
      "hit_rate_pct": 83.3,
      "n_weeks": 12
    }
  },
  "Mysuru": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 30,
        "actual": 25,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 5,
        "pct_error": 20.0
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 32,
        "actual": 18,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 14,
        "pct_error": 77.8
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 12,
        "actual": 11,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 9.1
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 11,
        "actual": 13,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 15.4
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 11,
        "actual": 11,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 12,
        "actual": 11,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 9.1
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 12,
        "actual": 13,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 7.7
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 31,
        "actual": 11,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 20,
        "pct_error": 181.8
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 9,
        "actual": 10,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 10.0
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 11,
        "actual": 10,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 10.0
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 0,
        "actual": 0,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 47,
        "actual": 1,
        "predicted_class": "Very High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 46,
        "pct_error": 4600.0
      }
    ],
    "metrics": {
      "mae": 7.7,
      "mape_pct": 411.7,
      "hit_rate_pct": 91.7,
      "n_weeks": 12
    }
  },
  "Udupi": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 40,
        "actual": 34,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 6,
        "pct_error": 17.6
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 57,
        "actual": 28,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 29,
        "pct_error": 103.6
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 28,
        "actual": 24,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 16.7
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 21,
        "actual": 20,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 5.0
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 20,
        "actual": 22,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 9.1
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 18,
        "actual": 21,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 14.3
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 15,
        "actual": 16,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 6.2
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 16,
        "actual": 19,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 15.8
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 57,
        "actual": 18,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 39,
        "pct_error": 216.7
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 19,
        "actual": 16,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 18.8
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 11,
        "actual": 13,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 15.4
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 18,
        "actual": 18,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      }
    ],
    "metrics": {
      "mae": 7.8,
      "mape_pct": 36.6,
      "hit_rate_pct": 100.0,
      "n_weeks": 12
    }
  },
  "Dakshina Kannada": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 52,
        "actual": 47,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 5,
        "pct_error": 10.6
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 31,
        "actual": 33,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 6.1
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 34,
        "actual": 30,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 13.3
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 34,
        "actual": 30,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 13.3
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 94,
        "actual": 22,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 72,
        "pct_error": 327.3
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 82,
        "actual": 24,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 58,
        "pct_error": 241.7
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 78,
        "actual": 20,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 58,
        "pct_error": 290.0
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 23,
        "actual": 24,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 4.2
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 20,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 13.0
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 15,
        "actual": 18,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 16.7
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 21,
        "actual": 18,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 16.7
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 26,
        "actual": 22,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 18.2
      }
    ],
    "metrics": {
      "mae": 18.1,
      "mape_pct": 80.9,
      "hit_rate_pct": 83.3,
      "n_weeks": 12
    }
  },
  "Belagavi": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 26,
        "actual": 25,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 4.0
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 21,
        "actual": 21,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 39,
        "actual": 13,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 26,
        "pct_error": 200.0
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 13,
        "actual": 12,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 8.3
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 17,
        "actual": 15,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 13.3
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 12,
        "actual": 13,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 7.7
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 11,
        "actual": 12,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 8.3
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 12,
        "actual": 13,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 7.7
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 13,
        "actual": 12,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 8.3
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 11,
        "actual": 10,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 10.0
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 7,
        "actual": 8,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 12.5
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 10,
        "actual": 11,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 9.1
      }
    ],
    "metrics": {
      "mae": 3.1,
      "mape_pct": 24.1,
      "hit_rate_pct": 100.0,
      "n_weeks": 12
    }
  },
  "Tumakuru": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 21,
        "actual": 19,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 10.5
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 10,
        "actual": 11,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 9.1
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 7,
        "actual": 9,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 22.2
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 26,
        "actual": 8,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 18,
        "pct_error": 225.0
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 9,
        "actual": 8,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 12.5
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 7,
        "actual": 7,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 30,
        "actual": 8,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 22,
        "pct_error": 275.0
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 8,
        "actual": 9,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 11.1
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 8,
        "actual": 7,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 14.3
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 6,
        "actual": 7,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 14.3
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 38,
        "actual": 6,
        "predicted_class": "Very High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 32,
        "pct_error": 533.3
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 7,
        "actual": 7,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      }
    ],
    "metrics": {
      "mae": 6.8,
      "mape_pct": 93.9,
      "hit_rate_pct": 83.3,
      "n_weeks": 12
    }
  },
  "Khordha": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 86,
        "actual": 63,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 23,
        "pct_error": 36.5
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 44,
        "actual": 48,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 8.3
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 26,
        "actual": 32,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 6,
        "pct_error": 18.8
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 31,
        "actual": 33,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 6.1
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 112,
        "actual": 31,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 81,
        "pct_error": 261.3
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 31,
        "actual": 34,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 8.8
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 23,
        "actual": 26,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 11.5
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 31,
        "actual": 29,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 6.9
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 26,
        "actual": 24,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 8.3
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 24,
        "actual": 25,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 4.0
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 27,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 17.4
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 94,
        "actual": 25,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 69,
        "pct_error": 276.0
      }
    ],
    "metrics": {
      "mae": 16.7,
      "mape_pct": 55.3,
      "hit_rate_pct": 83.3,
      "n_weeks": 12
    }
  },
  "Cuttack": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 44,
        "actual": 41,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 7.3
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 28,
        "actual": 31,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 9.7
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 25,
        "actual": 22,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 13.6
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 26,
        "actual": 24,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 8.3
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 26,
        "actual": 22,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 18.2
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 75,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 52,
        "pct_error": 226.1
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 23,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 21,
        "actual": 19,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 10.5
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 71,
        "actual": 21,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 50,
        "pct_error": 238.1
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 17,
        "actual": 18,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 5.6
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 15,
        "actual": 16,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 6.2
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 21,
        "actual": 22,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 4.5
      }
    ],
    "metrics": {
      "mae": 10.2,
      "mape_pct": 45.7,
      "hit_rate_pct": 100.0,
      "n_weeks": 12
    }
  },
  "Puri": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 33,
        "actual": 41,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 8,
        "pct_error": 19.5
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 55,
        "actual": 25,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 30,
        "pct_error": 120.0
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 21,
        "actual": 18,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 16.7
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 54,
        "actual": 17,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 37,
        "pct_error": 217.6
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 72,
        "actual": 20,
        "predicted_class": "Very High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 52,
        "pct_error": 260.0
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 21,
        "actual": 20,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 5.0
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 67,
        "actual": 16,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 51,
        "pct_error": 318.8
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 15,
        "actual": 17,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 11.8
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 16,
        "actual": 14,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 14.3
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 20,
        "actual": 17,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 17.6
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 22,
        "actual": 20,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 10.0
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 24,
        "actual": 20,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 20.0
      }
    ],
    "metrics": {
      "mae": 16.2,
      "mape_pct": 85.9,
      "hit_rate_pct": 83.3,
      "n_weeks": 12
    }
  },
  "Balasore": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 68,
        "actual": 46,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 22,
        "pct_error": 47.8
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 31,
        "actual": 28,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 10.7
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 20,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 13.0
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 23,
        "actual": 20,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 15.0
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 24,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 4.3
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 18,
        "actual": 20,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 10.0
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 25,
        "actual": 21,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 19.0
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 71,
        "actual": 16,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 55,
        "pct_error": 343.8
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 66,
        "actual": 20,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 46,
        "pct_error": 230.0
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 13,
        "actual": 15,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 13.3
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 20,
        "actual": 17,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 17.6
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 18,
        "actual": 16,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 12.5
      }
    ],
    "metrics": {
      "mae": 12.2,
      "mape_pct": 61.4,
      "hit_rate_pct": 75.0,
      "n_weeks": 12
    }
  },
  "Sundargarh": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 36,
        "actual": 32,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 12.5
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 28,
        "actual": 25,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 12.0
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 14,
        "actual": 17,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 17.6
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 18,
        "actual": 16,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 12.5
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 15,
        "actual": 15,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 17,
        "actual": 16,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 6.2
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 15,
        "actual": 18,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 16.7
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 62,
        "actual": 16,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 46,
        "pct_error": 287.5
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 13,
        "actual": 16,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 18.8
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 15,
        "actual": 14,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 7.1
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 11,
        "actual": 11,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 17,
        "actual": 15,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 13.3
      }
    ],
    "metrics": {
      "mae": 5.7,
      "mape_pct": 33.7,
      "hit_rate_pct": 91.7,
      "n_weeks": 12
    }
  },
  "Angul": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 32,
        "actual": 31,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 3.2
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 47,
        "actual": 18,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 29,
        "pct_error": 161.1
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 54,
        "actual": 15,
        "predicted_class": "Very High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 39,
        "pct_error": 260.0
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 13,
        "actual": 15,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 13.3
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 57,
        "actual": 13,
        "predicted_class": "Very High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 44,
        "pct_error": 338.5
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 14,
        "actual": 14,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 13,
        "actual": 13,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 14,
        "actual": 12,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 16.7
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 12,
        "actual": 13,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 7.7
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 48,
        "actual": 10,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 38,
        "pct_error": 380.0
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 12,
        "actual": 11,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 9.1
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 11,
        "actual": 13,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 15.4
      }
    ],
    "metrics": {
      "mae": 13.2,
      "mape_pct": 100.4,
      "hit_rate_pct": 66.7,
      "n_weeks": 12
    }
  },
  "Mayurbhanj": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 17,
        "actual": 19,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 10.5
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 16,
        "actual": 16,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 14,
        "actual": 12,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 16.7
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 13,
        "actual": 11,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 18.2
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 42,
        "actual": 11,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 31,
        "pct_error": 281.8
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 7,
        "actual": 9,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 22.2
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 11,
        "actual": 9,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 22.2
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 8,
        "actual": 9,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 11.1
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 8,
        "actual": 8,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 9,
        "actual": 8,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 12.5
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 1,
        "actual": 1,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 0,
        "actual": 0,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      }
    ],
    "metrics": {
      "mae": 3.6,
      "mape_pct": 32.9,
      "hit_rate_pct": 91.7,
      "n_weeks": 12
    }
  },
  "Sambalpur": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 30,
        "actual": 28,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 7.1
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 23,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 14,
        "actual": 15,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 6.7
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 13,
        "actual": 14,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 7.1
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 17,
        "actual": 15,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 13.3
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 48,
        "actual": 13,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 35,
        "pct_error": 269.2
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 17,
        "actual": 14,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 21.4
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 51,
        "actual": 11,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 40,
        "pct_error": 363.6
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 14,
        "actual": 12,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 16.7
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 10,
        "actual": 12,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 16.7
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 10,
        "actual": 9,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 11.1
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 11,
        "actual": 13,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 15.4
      }
    ],
    "metrics": {
      "mae": 7.6,
      "mape_pct": 62.4,
      "hit_rate_pct": 83.3,
      "n_weeks": 12
    }
  },
  "Visakhapatnam": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 51,
        "actual": 52,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 1.9
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 50,
        "actual": 46,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 8.7
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 104,
        "actual": 32,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 72,
        "pct_error": 225.0
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 105,
        "actual": 28,
        "predicted_class": "Very High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 77,
        "pct_error": 275.0
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 34,
        "actual": 31,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 9.7
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 30,
        "actual": 31,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 3.2
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 30,
        "actual": 25,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 5,
        "pct_error": 20.0
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 27,
        "actual": 27,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 30,
        "actual": 27,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 11.1
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 98,
        "actual": 21,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 77,
        "pct_error": 366.7
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 25,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 8.7
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 100,
        "actual": 29,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 71,
        "pct_error": 244.8
      }
    ],
    "metrics": {
      "mae": 26.3,
      "mape_pct": 97.9,
      "hit_rate_pct": 66.7,
      "n_weeks": 12
    }
  },
  "Vijayawada": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 49,
        "actual": 48,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 2.1
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 47,
        "actual": 47,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 29,
        "actual": 30,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 3.3
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 97,
        "actual": 31,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 66,
        "pct_error": 212.9
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 25,
        "actual": 29,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 13.8
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 83,
        "actual": 26,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 57,
        "pct_error": 219.2
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 24,
        "actual": 27,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 11.1
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 31,
        "actual": 28,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 10.7
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 21,
        "actual": 22,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 4.5
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 22,
        "actual": 24,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 8.3
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 16,
        "actual": 20,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 20.0
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 19,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 17.4
      }
    ],
    "metrics": {
      "mae": 12.2,
      "mape_pct": 43.6,
      "hit_rate_pct": 91.7,
      "n_weeks": 12
    }
  },
  "Guntur": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 42,
        "actual": 43,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 2.3
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 81,
        "actual": 35,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 46,
        "pct_error": 131.4
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 23,
        "actual": 25,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 8.0
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 22,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 4.3
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 75,
        "actual": 22,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 53,
        "pct_error": 240.9
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 20,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 13.0
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 15,
        "actual": 18,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 16.7
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 15,
        "actual": 18,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 16.7
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 18,
        "actual": 20,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 10.0
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 14,
        "actual": 17,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 17.6
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 16,
        "actual": 16,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 15,
        "actual": 18,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 16.7
      }
    ],
    "metrics": {
      "mae": 10.0,
      "mape_pct": 39.8,
      "hit_rate_pct": 83.3,
      "n_weeks": 12
    }
  },
  "Krishna": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 30,
        "actual": 33,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 9.1
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 19,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 17.4
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 23,
        "actual": 20,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 15.0
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 19,
        "actual": 17,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 11.8
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 52,
        "actual": 17,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 35,
        "pct_error": 205.9
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 16,
        "actual": 14,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 14.3
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 54,
        "actual": 17,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 37,
        "pct_error": 217.6
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 15,
        "actual": 14,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 7.1
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 15,
        "actual": 15,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 15,
        "actual": 14,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 7.1
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 12,
        "actual": 11,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 9.1
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 14,
        "actual": 14,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      }
    ],
    "metrics": {
      "mae": 7.4,
      "mape_pct": 42.9,
      "hit_rate_pct": 83.3,
      "n_weeks": 12
    }
  },
  "Kurnool": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 31,
        "actual": 30,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 3.3
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 25,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 8.7
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 18,
        "actual": 17,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 5.9
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 15,
        "actual": 17,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 11.8
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 15,
        "actual": 13,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 15.4
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 50,
        "actual": 13,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 37,
        "pct_error": 284.6
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 14,
        "actual": 14,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 10,
        "actual": 12,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 16.7
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 12,
        "actual": 11,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 9.1
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 9,
        "actual": 11,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 18.2
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 55,
        "actual": 9,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 46,
        "pct_error": 511.1
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 43,
        "actual": 12,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 31,
        "pct_error": 258.3
      }
    ],
    "metrics": {
      "mae": 10.6,
      "mape_pct": 95.3,
      "hit_rate_pct": 83.3,
      "n_weeks": 12
    }
  },
  "East Godavari": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 72,
        "actual": 40,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 32,
        "pct_error": 80.0
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 34,
        "actual": 30,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 13.3
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 27,
        "actual": 23,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 4,
        "pct_error": 17.4
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 22,
        "actual": 20,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 10.0
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 71,
        "actual": 19,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 52,
        "pct_error": 273.7
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 19,
        "actual": 16,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 18.8
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 15,
        "actual": 15,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 17,
        "actual": 17,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 76,
        "actual": 15,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 61,
        "pct_error": 406.7
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 13,
        "actual": 14,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 7.1
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 12,
        "actual": 12,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 0,
        "pct_error": 0.0
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 19,
        "actual": 18,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 5.6
      }
    ],
    "metrics": {
      "mae": 13.3,
      "mape_pct": 69.4,
      "hit_rate_pct": 75.0,
      "n_weeks": 12
    }
  },
  "NTR": {
    "history": [
      {
        "week_ending": "2026-01-11",
        "predicted": 53,
        "actual": 44,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 9,
        "pct_error": 20.5
      },
      {
        "week_ending": "2026-01-18",
        "predicted": 68,
        "actual": 31,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 37,
        "pct_error": 119.4
      },
      {
        "week_ending": "2026-01-25",
        "predicted": 76,
        "actual": 21,
        "predicted_class": "High",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 55,
        "pct_error": 261.9
      },
      {
        "week_ending": "2026-02-01",
        "predicted": 19,
        "actual": 20,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 5.0
      },
      {
        "week_ending": "2026-02-08",
        "predicted": 22,
        "actual": 19,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 15.8
      },
      {
        "week_ending": "2026-02-15",
        "predicted": 23,
        "actual": 22,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 4.5
      },
      {
        "week_ending": "2026-02-22",
        "predicted": 71,
        "actual": 18,
        "predicted_class": "Moderate",
        "actual_class": "Low",
        "class_hit": false,
        "abs_error": 53,
        "pct_error": 294.4
      },
      {
        "week_ending": "2026-03-01",
        "predicted": 21,
        "actual": 18,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 16.7
      },
      {
        "week_ending": "2026-03-08",
        "predicted": 19,
        "actual": 20,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 1,
        "pct_error": 5.0
      },
      {
        "week_ending": "2026-03-15",
        "predicted": 14,
        "actual": 17,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 3,
        "pct_error": 17.6
      },
      {
        "week_ending": "2026-03-22",
        "predicted": 13,
        "actual": 15,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 13.3
      },
      {
        "week_ending": "2026-03-29",
        "predicted": 15,
        "actual": 17,
        "predicted_class": "Low",
        "actual_class": "Low",
        "class_hit": true,
        "abs_error": 2,
        "pct_error": 11.8
      }
    ],
    "metrics": {
      "mae": 14.2,
      "mape_pct": 65.5,
      "hit_rate_pct": 75.0,
      "n_weeks": 12
    }
  }
}

export const MODEL_RUNS: ModelRun[] = [
  {
    "run_date": "2026-05-04",
    "window_start": "2026-05-08",
    "window_end": "2026-06-04",
    "districts_covered": 21,
    "model_version": "PRISM-H v0.12"
  },
  {
    "run_date": "2026-04-27",
    "window_start": "2026-05-01",
    "window_end": "2026-05-28",
    "districts_covered": 21,
    "model_version": "PRISM-H v0.11"
  },
  {
    "run_date": "2026-04-20",
    "window_start": "2026-04-24",
    "window_end": "2026-05-21",
    "districts_covered": 21,
    "model_version": "PRISM-H v0.10"
  },
  {
    "run_date": "2026-04-13",
    "window_start": "2026-04-17",
    "window_end": "2026-05-14",
    "districts_covered": 21,
    "model_version": "PRISM-H v0.9"
  },
  {
    "run_date": "2026-04-06",
    "window_start": "2026-04-10",
    "window_end": "2026-05-07",
    "districts_covered": 21,
    "model_version": "PRISM-H v0.8"
  },
  {
    "run_date": "2026-03-30",
    "window_start": "2026-04-03",
    "window_end": "2026-04-30",
    "districts_covered": 21,
    "model_version": "PRISM-H v0.7"
  },
  {
    "run_date": "2026-03-23",
    "window_start": "2026-03-27",
    "window_end": "2026-04-23",
    "districts_covered": 21,
    "model_version": "PRISM-H v0.6"
  },
  {
    "run_date": "2026-03-16",
    "window_start": "2026-03-20",
    "window_end": "2026-04-16",
    "districts_covered": 21,
    "model_version": "PRISM-H v0.5"
  },
  {
    "run_date": "2026-03-09",
    "window_start": "2026-03-13",
    "window_end": "2026-04-09",
    "districts_covered": 21,
    "model_version": "PRISM-H v0.4"
  },
  {
    "run_date": "2026-03-02",
    "window_start": "2026-03-06",
    "window_end": "2026-04-02",
    "districts_covered": 21,
    "model_version": "PRISM-H v0.3"
  },
  {
    "run_date": "2026-02-23",
    "window_start": "2026-02-27",
    "window_end": "2026-03-26",
    "districts_covered": 21,
    "model_version": "PRISM-H v0.2"
  },
  {
    "run_date": "2026-02-16",
    "window_start": "2026-02-20",
    "window_end": "2026-03-19",
    "districts_covered": 21,
    "model_version": "PRISM-H v0.1"
  }
]
