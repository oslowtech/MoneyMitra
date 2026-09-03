# services/ml/analytics/cashflow.py
from typing import Dict, Any, List

def calculate_safe_to_spend(
    current_balance: float,
    expected_income_min: float,
    expected_income_max: float,
    essential_expenses: float,
    upcoming_debt_obligations: float,
    buffer_target_days: int = 7
) -> Dict[str, Any]:
    """
    Calculates the Safe-to-Spend amount specifically designed for gig workers (PS4 Engine).
    Safe to spend = Current Balance + Expected Conservative Income - Essential Expenses - Upcoming Debt - Safety Buffer
    """
    # Conservative income estimation (bottom 25th percentile of expected range)
    conservative_income = expected_income_min + (expected_income_max - expected_income_min) * 0.25
    
    daily_essential = essential_expenses / 30.0 if essential_expenses > 0 else 200.0
    safety_buffer = daily_essential * buffer_target_days
    
    total_committed = essential_expenses + upcoming_debt_obligations + safety_buffer
    available_liquidity = current_balance + conservative_income
    
    safe_to_spend = max(0.0, available_liquidity - total_committed)
    
    # Weekly safe-to-spend slice
    safe_to_spend_weekly = round(safe_to_spend / 4.0, 2)
    
    return {
        "safe_to_spend_total": round(safe_to_spend, 2),
        "safe_to_spend_weekly": safe_to_spend_weekly,
        "current_balance": current_balance,
        "expected_income_range": {
            "min": expected_income_min,
            "max": expected_income_max,
            "conservative": round(conservative_income, 2)
        },
        "essential_expenses": essential_expenses,
        "upcoming_debt": upcoming_debt_obligations,
        "safety_buffer_reserved": round(safety_buffer, 2),
        "note": "This amount adjusts dynamically as new gig income arrives."
    }

def forecast_cashflow_30_60_90(
    historical_income_avg: float,
    income_cv: float,
    essential_monthly_expenses: float,
    monthly_debt_obligations: float,
    current_savings: float
) -> Dict[str, Any]:
    """
    Generates 30-day, 60-day, and 90-day cash flow projections with upper/lower bounds.
    """
    forecasts = []
    current_balance = current_savings
    
    for month in [1, 2, 3]:
        horizon_days = month * 30
        
        # Uncertainty grows with time horizon and income volatility (CV)
        uncertainty_factor = 1.0 + (income_cv * 0.5 * (month ** 0.5))
        
        exp_income = historical_income_avg
        min_income = round(max(0.0, exp_income / uncertainty_factor), 2)
        max_income = round(exp_income * uncertainty_factor, 2)
        
        total_outflow = essential_monthly_expenses + monthly_debt_obligations
        net_cashflow_expected = exp_income - total_outflow
        net_cashflow_min = min_income - total_outflow
        
        current_balance += net_cashflow_expected
        buffer_days = round(current_savings / (total_outflow / 30.0), 1) if total_outflow > 0 else 99
        
        forecasts.append({
            "horizon_days": horizon_days,
            "month": f"Month {month}",
            "expected_income": round(exp_income, 2),
            "income_range": [min_income, max_income],
            "essential_expenses": essential_monthly_expenses,
            "debt_obligations": monthly_debt_obligations,
            "projected_net_cashflow": round(net_cashflow_expected, 2),
            "projected_min_cashflow": round(net_cashflow_min, 2),
            "projected_end_balance": round(current_balance, 2),
            "buffer_days": buffer_days
        })
        
    return {
        "forecasts": forecasts,
        "volatility_factor": round(income_cv, 4)
    }
