import questionsData from '../data/questions.json';

export function getAllCategories() {
  return Object.keys(questionsData.categories);
}

export function getQuestionsForCategory(category) {
  const baseQuestions = questionsData.base || [];

  if (!category || !questionsData.categories[category]) {
    return baseQuestions;
  }

  const categoryQuestions = questionsData.categories[category];
  return [...baseQuestions, ...categoryQuestions];
}
