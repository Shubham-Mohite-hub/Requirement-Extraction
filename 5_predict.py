import joblib
from requirement_extractor import extract_requirements

model = joblib.load("requirement_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

text = """
Subject: quick notes from today's discussion

Hi team,

Just writing down a few things before I forget.

For the login feature users should login using email and password instead of username because many customers said they forget usernames.

Also security is important here so the system must be secure and protect user data.

Product manager already approved this change so we can move forward.

Let's try to complete this module in the next sprint since release planning is close.

Also this feature is high priority for the upcoming release so please focus on this first.

Thanks

"""

X = vectorizer.transform([text])

prediction = model.predict(X)

print("Model Prediction:")
print(prediction)

print("\nExtracted Requirements:")

requirements = extract_requirements(text)

for key,value in requirements.items():
    print(key,":",value)