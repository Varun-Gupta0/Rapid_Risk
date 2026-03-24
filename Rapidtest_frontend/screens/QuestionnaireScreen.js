import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import Questionnaire from '../components/Questionnaire';
import { getAllCategories, getQuestionsForCategory } from '../utils/questionnaireHelper';

export default function QuestionnaireScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [questions, setQuestions] = useState([]);
  const categories = getAllCategories();

  useEffect(() => {
    if (selectedCategory) {
      setQuestions(getQuestionsForCategory(selectedCategory));
    }
  }, [selectedCategory]);

  const handleSubmit = (answers) => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>System Questionnaires</Text>
          <Text style={styles.subtitle}>Select a clinical specialized category to begin</Text>
        </View>

        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <TouchableOpacity 
              key={category} 
              style={[
                styles.categoryCard, 
                selectedCategory === category && styles.selectedCard
              ]} 
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedText
              ]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {questions.length > 0 && (
          <View style={styles.questionnaireSection}>
            <View style={styles.divider} />
            <Text style={styles.activeCategoryTitle}>{selectedCategory} Assessment</Text>
            <Questionnaire questions={questions} onSubmit={handleSubmit} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundWhite,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBlue,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  selectedText: {
    color: colors.primaryBlue,
  },
  questionnaireSection: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 32,
  },
  activeCategoryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
