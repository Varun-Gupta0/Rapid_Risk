export function calculateRisk(age, fever, breathingDifficulty, chronicDisease, heartRate, oxygenLevel, mlProbability) {
  let riskScore = 0;
  const explanation = [];
  const mlWeight = 0.3; // Adjust this to control the influence of the ML model

  // Age
  if (age > 60) {
    riskScore += 20;
    explanation.push("Age over 60");
  }

  // Oxygen Level
  if (oxygenLevel < 92) {
    riskScore += 50;
    explanation.push("Low oxygen level (<92)");
  }

  // Breathing Difficulty
  if (breathingDifficulty) {
    riskScore += 60;
    explanation.push("Breathing difficulty");
  }

  // Fever
  if (fever) {
    riskScore += 10;
    explanation.push("Fever");
  }

  // Chronic Disease
  if (chronicDisease) {
    riskScore += 10;
    explanation.push("Chronic disease");
  }

  // Heart Rate
  if (heartRate > 100) {
    riskScore += 5;
    explanation.push("Elevated heart rate (>100)");
  } else if (heartRate < 60) {
    riskScore += 5;
    explanation.push("Low heart rate (<60)");
  }

  // Incorporate ML Probability
  riskScore += mlProbability * 100 * mlWeight;
  explanation.push(`ML Model Probability: ${mlProbability.toFixed(2)}`);

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  // Determine Risk Level
  let riskLevel;
  if (riskScore <= 30) {
    riskLevel = "LOW";
  } else if (riskScore <= 70) {
    riskLevel = "MEDIUM";
  } else {
    riskLevel = "HIGH";
  }

  return {
    riskScore: Math.round(riskScore),
    riskLevel,
    explanation,
  };
}

export function calculateRiskEnhanced(age, fever, breathingDifficulty, chronicDisease, heartRate, oxygenLevel, hasDiabetes, isPregnant, hasInfection, additionalNotes, mlProbability) {
  let riskData = calculateRisk(age, fever, breathingDifficulty, chronicDisease, heartRate, oxygenLevel, mlProbability);
  let riskScore = riskData.riskScore;
  const explanation = [...riskData.explanation];

  // Respiratory Risk
  if (breathingDifficulty) {
    riskScore += 30;
    explanation.push("Respiratory risk factor");
  }

  // Cardiac Risk
  if (heartRate > 100 || heartRate < 60) {
    riskScore += 20;
    explanation.push("Cardiac risk factor");
  }

  // Diabetes Risk
  if (hasDiabetes) {
    riskScore += 25;
    explanation.push("Diabetes risk factor");
  }

  // Pregnancy Risk
  if (isPregnant) {
    riskScore += 15;
    explanation.push("Pregnancy risk factor");
  }

  // General Infection Risk
  if (hasInfection) {
    riskScore += 35;
    explanation.push("General infection risk factor");
  }

  // Additional Notes - rudimentary keyword check
  const notes = additionalNotes?.toLowerCase() || "";
  const keywords = ["pain", "dizziness", "bleeding"];
  for (const keyword of keywords) {
    if (notes.includes(keyword)) {
      riskScore += 10;
      explanation.push(`Keyword "${keyword}" found in notes`);
    }
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  let riskLevel;
  if (riskScore <= 30) {
    riskLevel = "LOW";
  } else if (riskScore <= 70) {
    riskLevel = "MEDIUM";
  } else {
    riskLevel = "HIGH";
  }

  return {
    riskScore: Math.round(riskScore),
    riskLevel,
    explanation,
  };
}
