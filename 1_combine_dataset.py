from datasets import load_dataset, Dataset, concatenate_datasets
import pandas as pd

# -----------------------------
# 1. Load DialogSum dataset
# -----------------------------
dialogsum = load_dataset("knkarthick/dialogsum")

dialogsum_dataset = dialogsum["train"].map(lambda x: {
    "text": x["dialogue"],
    "summary": x["summary"]
})

dialogsum_dataset = dialogsum_dataset.remove_columns(['id','dialogue','topic'])


# -----------------------------
# 2. Load Emails dataset
# -----------------------------
emails_df = pd.read_csv("emails.csv")
emails_dataset = Dataset.from_pandas(emails_df)


# Convert email format
emails_dataset = emails_dataset.map(lambda x: {
    "text": x["message"],
    "summary": "email discussion"
})

emails_dataset = emails_dataset.remove_columns(['file','message'])


# -----------------------------
# 3. Reduce email size
# -----------------------------
emails_dataset = emails_dataset.select(range(20000))


# -----------------------------
# 4. Combine datasets
# -----------------------------
combined_dataset = concatenate_datasets([dialogsum_dataset, emails_dataset])


# -----------------------------
# 5. Save combined dataset
# -----------------------------
combined_dataset.to_csv("combined_dataset.csv")


# -----------------------------
# 6. Print result
# -----------------------------
print("Combined Dataset Created Successfully!")
print(combined_dataset)

