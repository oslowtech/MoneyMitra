# services/ml/recommendations/intervention_engine.py
from typing import Dict, Any, List

def generate_gig_interventions(
    risk_level: str,
    income_volatility: float,
    buffer_days: float,
    upcoming_emi: float,
    has_high_earning_day: bool = True
) -> Dict[str, Any]:
    """
    Gig-Worker Intervention Engine (PS4 + PS3 Intervention Ladder):
    Level 0: No action
    Level 1: Helpful insight
    Level 2: Personalized recommendation
    Level 3: Proactive warning
    Level 4: Financial assistance
    Level 5: Human advisor intervention
    """
    interventions = []

    # 1. Protection for upcoming EMI when income is volatile or buffer is low
    if upcoming_emi > 0 and (buffer_days < 14 or income_volatility > 0.35):
        interventions.append({
            "id": "rec-emi-protect",
            "level": 3,
            "level_label": "Proactive Warning",
            "type": "cashflow_protection",
            "priority": "HIGH",
            "title": "Protect your upcoming payment",
            "description": f"Your recent income is variable ({int(income_volatility*100)}% volatility) and your buffer is limited ({int(buffer_days)} days). Reserve money early for your upcoming ₹{int(upcoming_emi)} EMI.",
            "actions": [
                {"label": f"Reserve ₹{int(upcoming_emi)} for EMI", "type": "lock_funds", "target": upcoming_emi},
                {"label": "Reduce discretionary spending by ₹1,000 this week", "type": "spending_limit", "target": 1000}
            ]
        })

    # 2. Income-aware variable saving (Gig-worker specific!)
    if income_volatility > 0.25:
        interventions.append({
            "id": "rec-variable-save",
            "level": 2,
            "level_label": "Personalized Recommendation",
            "type": "variable_savings",
            "priority": "MEDIUM",
            "title": "Save on strong earning days",
            "description": "Because your gig income varies day to day, fixed monthly savings can cause stress. Instead, auto-save 10-15% on high-earning days.",
            "actions": [
                {"label": "Save 10% on days earning > ₹1,500", "type": "auto_save_percent", "target": 10}
            ]
        })

    # 3. Escalation for high risk (Human advisor intervention)
    if risk_level in ["At Risk", "Critical"]:
        interventions.append({
            "id": "rec-advisor-support",
            "level": 5 if risk_level == "Critical" else 4,
            "level_label": "Financial Support",
            "type": "financial_assistance",
            "priority": "URGENT",
            "title": "Connect with a Financial Wellbeing Officer",
            "description": "Your financial trajectory shows potential distress pressure in the next 60 days. Request free confidential guidance from a partner bank advisor.",
            "actions": [
                {"label": "Request Advisor Support Call", "type": "contact_advisor", "target": None}
            ]
        })

    return {
        "risk_level": risk_level,
        "interventions": interventions,
        "count": len(interventions)
    }
