import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';

export default function Questionnaire({ questions, onSubmit }) {
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const initial = {};
    questions.forEach(q => {
      if (q.type === 'toggle') initial[q.key] = false;
      else initial[q.key] = '';
    });
    setAnswers(initial);
  }, [questions]);

  const handleChange = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    for (const q of questions) {
      if (q.required) {
        const val = answers[q.key];
        if (val === '' || val === undefined || val === null) return false;
      }
    }
    return true;
  };

  return (
    <View style={styles.container}>
      {questions.map(question => (
        <View key={question.key} style={styles.questionContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{question.label}</Text>
            {question.required && <Text style={styles.requiredBadge}>Required</Text>}
          </View>

          {question.type === 'input' && (
            <TextInput
              style={styles.input}
              placeholder={`Enter ${question.label.toLowerCase()}...`}
              placeholderTextColor={colors.textSecondary + '70'}
              value={answers[question.key] || ''}
              onChangeText={text => handleChange(question.key, text)}
            />
          )}

          {question.type === 'toggle' && (
            <View style={styles.toggleRow}>
              <Text style={styles.toggleStatus}>{answers[question.key] ? 'YES' : 'NO'}</Text>
              <Switch
                trackColor={{ false: '#CBD5E1', true: colors.primaryBlue + '50' }}
                thumbColor={answers[question.key] ? colors.primaryBlue : '#F1F5F9'}
                ios_backgroundColor="#CBD5E1"
                value={answers[question.key] || false}
                onValueChange={val => handleChange(question.key, val)}
              />
            </View>
          )}

          {question.type === 'select' && (
            <View style={styles.selectGrid}>
              {question.options.map(option => (
                <TouchableOpacity 
                  key={option} 
                  style={[
                    styles.selectOption,
                    answers[question.key] === option && styles.selectedOption
                  ]}
                  onPress={() => handleChange(question.key, option)}
                >
                  <Text style={[
                    styles.optionText,
                    answers[question.key] === option && styles.selectedOptionText
                  ]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}

      <View style={styles.footer}>
        <PrimaryButton 
          title="Complete Assessment" 
          disabled={!isFormValid()}
          onPress={() => onSubmit(answers)}
        />
        {!isFormValid() && <Text style={styles.validationText}>Please complete all required clinical indicators</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  requiredBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentRed,
    backgroundColor: colors.accentRed + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleStatus: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryBlue,
  },
  selectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBlue,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  selectedOptionText: {
    color: colors.primaryBlue,
  },
  footer: {
    marginTop: 12,
  },
  validationText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.accentRed,
    marginTop: 12,
    fontWeight: '600',
  }
});
