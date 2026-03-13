import spacy
import re

# Load spacy model
nlp = spacy.load("en_core_web_sm")

def extract_requirements(text):
    result = {
        "Functional Requirements": [],
        "Non Functional Requirements": [],
        "Stakeholders": [],
        "Decisions": [],
        "Timelines": [],
        "Feature Priority": []
    }

    stakeholder_roles = [
        "product manager", "project manager", "manager", "user", 
        "customer", "admin", "developer", "client", "team", 
        "qa lead", "scrum master"
    ]

    priority_words = ["urgent", "high priority", "critical", "important", "asap"]
    
    # We keep the keywords but NER will handle specific dates like "Friday"
    timeline_keywords = ["sprint", "deadline", "upcoming release", "asap"]

    doc_full = nlp(text)

    for sent in doc_full.sents:
        s = sent.text.strip()
        if not s:
            continue

        lower_s = s.lower()
        
        # 1. -------- Functional vs Non-Functional --------
        has_modal = any(token.tag_ == "MD" for token in sent)
        is_nfr = any(word in lower_s for word in ["performance", "secure", "scalable", "encryption", "speed"])
        
        if is_nfr:
            result["Non Functional Requirements"].append(s)
        elif has_modal:
            result["Functional Requirements"].append(s)

        # 2. -------- Stakeholders (Roles + NER for Names) --------
        # Catch Roles
        for role in stakeholder_roles:
            if role in lower_s:
                role_name = role.title()
                if role_name not in result["Stakeholders"]:
                    result["Stakeholders"].append(role_name)
        
        # Catch Actual Names using NER
        for ent in sent.ents:
            if ent.label_ == "PERSON":
                name = ent.text.strip()
                if name not in result["Stakeholders"] and len(name) > 2:
                    result["Stakeholders"].append(name)

        # 3. -------- Decisions --------
        if any(word in lower_s for word in ["approved", "decided", "confirmed", "agreed"]):
            result["Decisions"].append(s)

        # 4. -------- Timelines (Keywords + NER for Dates) --------
        # Catch Keywords
        has_time_keyword = any(word in lower_s for word in timeline_keywords)
        
        # Catch Specific Dates/Times using NER (e.g., "next Friday", "tomorrow")
        has_date_ent = any(ent.label_ in ["DATE", "TIME"] for ent in sent.ents)
        
        if has_time_keyword or has_date_ent:
            result["Timelines"].append(s)

        # 5. -------- Feature Priority --------
        if any(word in lower_s for word in priority_words):
            result["Feature Priority"].append(s)

    # Clean up: Remove duplicates across all lists
    for key in result:
        result[key] = list(set(result[key]))

    return result