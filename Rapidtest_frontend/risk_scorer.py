import numpy as np
from sklearn.linear_model import LogisticRegression
import json

def generate_synthetic_data(n_samples=1000):
    """Generates synthetic data for demonstration."""
    age = np.random.randint(20, 80, n_samples)
    fever = np.random.randint(0, 2, n_samples)
    breathing_difficulty = np.random.randint(0, 2, n_samples)
    heart_rate = np.random.randint(60, 120, n_samples)
    oxygen_level = np.random.randint(90, 100, n_samples)
    chronic_disease = np.random.randint(0, 2, n_samples)

    # Create a target variable (risk) - this is a simplified example
    risk = (age > 65) + (fever == 1) + (breathing_difficulty == 1) + (heart_rate > 100) + (oxygen_level < 92) + (chronic_disease == 1)
    risk = np.clip(risk, 0, 1)  # Ensure risk is between 0 and 1

    return age, fever, breathing_difficulty, heart_rate, oxygen_level, chronic_disease, risk

def train_model():
    """Trains a logistic regression model."""
    age, fever, breathing_difficulty, heart_rate, oxygen_level, chronic_disease, risk = generate_synthetic_data()

    X = np.column_stack([age, fever, breathing_difficulty, heart_rate, oxygen_level, chronic_disease])
    
    model = LogisticRegression(solver='liblinear')
    model.fit(X, risk)

    # Export model coefficients as JSON
    coefficients = model.coef_.tolist()
    intercept = model.intercept_.tolist()
    model_data = {"coefficients": coefficients, "intercept": intercept}
    
    return model_data

if __name__ == '__main__':
    model_data = train_model()
    print(json.dumps(model_data, indent=4))
