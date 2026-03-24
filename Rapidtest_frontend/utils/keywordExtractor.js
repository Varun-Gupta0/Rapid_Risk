export const extractKeywords = (text) => {
  if (!text) {
    return [];
  }

  const keywords = ['pain', 'bleeding', 'dizziness', 'weakness', 'vomiting'];
  const foundKeywords = [];
  const lowerCaseText = text.toLowerCase();

  for (const keyword of keywords) {
    if (lowerCaseText.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }

  return foundKeywords;
};
