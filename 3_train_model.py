import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

data = pd.read_csv("clean_dataset.csv")

# Reduce dataset size
data = data.sample(6000, random_state=42)

# Reduce TF-IDF vocabulary
vectorizer = TfidfVectorizer(max_features=1500)

X = vectorizer.fit_transform(data['text'])
y = data['summary']

model = LogisticRegression(max_iter=200)

model.fit(X, y)

joblib.dump(model, "requirement_model.pkl")
joblib.dump(vectorizer, "tfidf_vectorizer.pkl")

print("Model trained and saved successfully")