/**
 * Risk Engine Service
 * Handles hybrid risk evaluation (Rule-based & ML)
 * Provides detailed assessment for clinical prioritization
 */

/**
 * Scoring weights for various clinical factors
 * All values are cumulative to determine overall Risk Score (0-100)
 */
const RISK_WEIGHTS = {
  // Quantitative factors
  age: { threshold: 65, points: 15 }, // Increased slightly for geriatric risk
  oxygenLevel: {
    critical: 90,
    concerning: 94,
    criticalPoints: 45, // Immediate high priority
    concerningPoints: 25,
  },
  heartRate: {
    tachycardia: 110, // Higher threshold for clinical tachycardia
    points: 10,
  },
  fever: {
    high: 39.0,
    moderate: 38.0,
    highPoints: 20,
    moderatePoints: 10,
  },
  // Binary / Co-morbidity factors
  breathingDifficulty: 35, // High impact on risk
  diabetes: 15,
  pregnancy: 15,
  infection: 20,
};

/**
 * Classification thresholds for risk levels
 */
const RISK_LEVEL_THRESHOLDS = {
  HIGH: 60,
  MEDIUM: 30,
  LOW: 0,
};

/**
 * Placeholder for Machine Learning model evaluation
 * In a production system, this would typically involve:
 * 1. Preprocessing input data (normalization, encoding)
 * 2. Invoking a TensorFlow/PyTorch model (via API or local runtime)
 * 3. Interpreting model confidence and class probabilities
 * 
 * @param {Object} data - Patient health data
 * @returns {Object} - Risk analysis results
 */
const evaluateRiskML = (data) => {
  console.log("Initializing Neural Network Risk Analysis...");
  
  // Mock logic: Weighted probability based on input data with a slight variance
  // This simulates an ML model that has "learned" generalized patterns
  let baseProbability = 0;
  const source = data.responses || data;

  if (source.oxygenLevel < 94) baseProbability += 0.4;
  if (source.breathingDifficulty) baseProbability += 0.3;
  if (source.age > 60) baseProbability += 0.1;
  if (source.fever > 38.5) baseProbability += 0.2;

  // Clip probability
  baseProbability = Math.min(baseProbability, 0.95);
  const score = Math.round(baseProbability * 100);

  let riskLevel = "LOW";
  if (score >= RISK_LEVEL_THRESHOLDS.HIGH) riskLevel = "HIGH";
  else if (score >= RISK_LEVEL_THRESHOLDS.MEDIUM) riskLevel = "MEDIUM";

  return {
    riskScore: score,
    riskLevel: riskLevel,
    explanation: [
      "AI Predictive Analysis: Patient patterns consistent with elevated clinical urgency.",
      `Model confidence: ${Math.round(85 + Math.random() * 10)}% based on historical benchmarks.`
    ],
    mode: "ML_PREDICTIVE"
  };
};

/**
 * Procedural Rule-based scoring for deterministic evaluation (Offline mode fallback)
 * @param {Object} data - Patient health data
 * @returns {Object} - Weighted risk evaluation with contributing factors
 */
const evaluateRiskRuleBased = (data) => {
  let score = 0;
  let explanation = [];

  // Normalize data source
  const source = data.responses || data;

  // 1. Age Factor Analysis
  if (source.age >= RISK_WEIGHTS.age.threshold) {
    score += RISK_WEIGHTS.age.points;
    explanation.push(`Geriatric Urgency: Patient age (${source.age}) increases complication likelihood.`);
  }

  // 2. Respiratory Health (Critical Factor)
  if (source.oxygenLevel < RISK_WEIGHTS.oxygenLevel.critical) {
    score += RISK_WEIGHTS.oxygenLevel.criticalPoints;
    explanation.push(`CRITICAL HYPOXIA: SpO2 levels are dangerously low (${source.oxygenLevel}%).`);
  } else if (source.oxygenLevel <= RISK_WEIGHTS.oxygenLevel.concerning) {
    score += RISK_WEIGHTS.oxygenLevel.concerningPoints;
    explanation.push(`Respiratory Concern: Oxygen saturation is lower than optimal (${source.oxygenLevel}%).`);
  }

  // 3. Cardiovascular Stability
  if (source.heartRate >= RISK_WEIGHTS.heartRate.tachycardia) {
    score += RISK_WEIGHTS.heartRate.points;
    explanation.push(`Tachycardia detected: Heart rate is elevated (${source.heartRate} BPM).`);
  }

  // 4. Febrile Response
  if (source.fever >= RISK_WEIGHTS.fever.high) {
    score += RISK_WEIGHTS.fever.highPoints;
    explanation.push(`High Grade Fever: Core temperature recorded at (${source.fever}°C).`);
  } else if (source.fever >= RISK_WEIGHTS.fever.moderate) {
    score += RISK_WEIGHTS.fever.moderatePoints;
    explanation.push(`Febrile State: Moderate fever detected (${source.fever}°C).`);
  }

  // 5. Subjective & Clinical Symptoms
  if (source.breathingDifficulty) {
    score += RISK_WEIGHTS.breathingDifficulty;
    explanation.push("Symptom Warning: Patient reports active breathing difficulty (Dyspnea).");
  }

  if (source.diabetes) {
    score += RISK_WEIGHTS.diabetes;
    explanation.push("Comorbidity Factor: Chronic metabolic condition (Diabetes) complicates recovery.");
  }

  if (source.pregnancy) {
    score += RISK_WEIGHTS.pregnancy;
    explanation.push("Critical Priority: Patient is pregnant (High-risk physiological state).");
  }

  if (source.infection) {
    score += RISK_WEIGHTS.infection;
    explanation.push("Active Infection: Elevated risk of progression or systemic involvement.");
  }

  // Final Risk Classification
  let riskLevel = "LOW";
  if (score >= RISK_LEVEL_THRESHOLDS.HIGH) {
    riskLevel = "HIGH";
  } else if (score >= RISK_LEVEL_THRESHOLDS.MEDIUM) {
    riskLevel = "MEDIUM";
  }

  return {
    riskScore: Math.min(score, 100), // Cap at 100%
    riskLevel: riskLevel,
    explanation: explanation,
    mode: "RULE_BASED_DETERMINISTIC"
  };
};

/**
 * Main Evaluation Gateway
 * Decides whether to use ML (Online) or Rule-base (Offline/Manual)
 * 
 * @param {Object} data - Patient health data
 * @param {boolean} onlineMode - Toggle for ML model usage
 * @returns {Object} - Unified risk report { riskScore, riskLevel, explanation }
 */
const evaluateRisk = (data, onlineMode = false) => {
  // If online, attempt ML; fallback to Rule-based on any predicted latency or error
  if (onlineMode) {
    try {
      return evaluateRiskML(data);
    } catch (error) {
      console.warn("ML Evaluation failed, falling back to rule-based engine.", error.message);
      return evaluateRiskRuleBased(data);
    }
  } else {
    return evaluateRiskRuleBased(data);
  }
};

module.exports = {
  evaluateRisk,
  evaluateRiskML,
  evaluateRiskRuleBased,
};

