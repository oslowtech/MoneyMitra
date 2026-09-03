# services/ml/analytics/income.py
import pandas as pd
import numpy as np
from typing import List, Dict, Any

def analyze_income_patterns(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    PS4 Income Intelligence Engine:
    Calculates income stability, mean income, standard deviation,
    coefficient of variation (CV), trend (30d vs 90d baseline),
    earning frequency, and source concentration.
    """
    if not records:
        return {
            "income_stability_score": 50,
            "mean_income": 0.0,
            "std_income": 0.0,
            "coefficient_of_variation": 0.0,
            "income_trend_pct": 0.0,
            "earning_days_ratio": 0.0,
            "source_concentration": {},
            "top_vulnerability": "No income records found"
        }
    
    df = pd.DataFrame(records)
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    
    mean_income = float(df['amount'].mean())
    std_income = float(df['amount'].std()) if len(df) > 1 else 0.0
    cv = float(std_income / mean_income) if mean_income > 0 else 0.0

    # Source Concentration (e.g. Uber 70%, Swiggy 20%, Freelance 10%)
    source_totals = df.groupby('source')['amount'].sum()
    total_income = df['amount'].sum()
    source_concentration = {}
    if total_income > 0:
        for source, amt in source_totals.items():
            source_concentration[str(source)] = round(float(amt / total_income), 4)

    # High concentration (>65% from a single platform) = vulnerability
    max_concentration = max(source_concentration.values()) if source_concentration else 0
    top_source = max(source_concentration, key=source_concentration.get) if source_concentration else "None"

    # Income stability score formula (0 - 100): lower CV = higher stability
    # CV of 0.0 -> 100, CV of 1.0+ -> ~20
    stability_score = max(0, min(100, int(100 - (cv * 60) - (max_concentration * 20))))

    # Trend calculation (recent half vs older half)
    df = df.sort_values('date')
    mid_point = len(df) // 2
    recent_half = df.iloc[mid_point:]['amount'].mean() if len(df) > 1 else mean_income
    older_half = df.iloc[:mid_point]['amount'].mean() if len(df) > 1 else mean_income
    
    trend_pct = round(float(((recent_half - older_half) / older_half) * 100), 2) if older_half > 0 else 0.0

    vulnerability = None
    if max_concentration > 0.65:
        vulnerability = f"High income concentration in {top_source} ({int(max_concentration * 100)}%)"
    elif cv > 0.5:
        vulnerability = "High weekly income volatility across platforms"
    elif trend_pct < -10:
        vulnerability = f"Income declining by {abs(trend_pct)}% recently"
    else:
        vulnerability = "Diversified income stream with manageable volatility"

    return {
        "income_stability_score": stability_score,
        "mean_income": round(mean_income, 2),
        "std_income": round(std_income, 2),
        "coefficient_of_variation": round(cv, 4),
        "income_trend_pct": trend_pct,
        "source_concentration": source_concentration,
        "primary_source": top_source,
        "top_vulnerability": vulnerability
    }
