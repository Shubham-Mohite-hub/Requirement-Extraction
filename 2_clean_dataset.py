import pandas as pd
import re

data = pd.read_csv("combined_dataset.csv")

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z ]',' ',text)
    text = re.sub(r'\s+',' ',text)
    return text

data['text'] = data['text'].apply(clean_text)
data['summary'] = data['summary'].apply(clean_text)

data.to_csv("clean_dataset.csv",index=False)

print("Cleaning completed")