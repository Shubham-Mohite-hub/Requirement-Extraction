
import spacy
import re

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
        "product manager",
        "project manager",
        "manager",
        "user",
        "customer",
        "admin",
        "developer",
        "client",
        "team",
        "qa lead",
        "scrum master"
    ]

    priority_words = ["urgent","high priority","critical","important","asap"]
    timeline_words = ["week","month","sprint","deadline","tomorrow"]

    sentences = re.split(r'\n|\.', text)

    for s in sentences:

        s = s.strip()
        if not s:
            continue

        lower_s = s.lower()
        doc = nlp(s)

        # -------- Functional Requirements --------
        for token in doc:
            if token.tag_ == "MD":
                if "secure" not in lower_s and "performance" not in lower_s:
                    result["Functional Requirements"].append(s)
                    break

        # -------- Non Functional Requirements --------
        if "performance" in lower_s or "secure" in lower_s or "scalable" in lower_s:
            result["Non Functional Requirements"].append(s)

        # -------- Stakeholder Roles Only --------
        for role in stakeholder_roles:
            if role in lower_s:

                role_name = role.title()

                if role_name == "Manager" and "Product Manager" in result["Stakeholders"]:
                    continue

                if role_name not in result["Stakeholders"]:
                    result["Stakeholders"].append(role_name)

        # -------- Decisions --------
        if "approved" in lower_s or "decided" in lower_s or "confirmed" in lower_s:
            result["Decisions"].append(s)

        # -------- Timeline --------
        for word in timeline_words:
            if word in lower_s:
                result["Timelines"].append(s)
                break

        # -------- Feature Priority --------
        for word in priority_words:
            if word in lower_s:
                result["Feature Priority"].append(s)
                break

    return result

