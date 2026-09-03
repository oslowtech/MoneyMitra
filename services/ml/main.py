# services/ml/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from analytics.income import analyze_income_patterns
from analytics.cashflow import calculate_safe_to_spend, forecast_cashflow_30_60_90
from risk.distress_model import predict_financial_distress
from recommendations.intervention_engine import generate_gig_interventions

app = FastAPI(
    title="MoneyMitra PS4 Intelligence API",
    description="Python ML Engine for Irregular Income Intelligence & Early Warning Financial Resilience",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Request Models
class IncomeRecordItem(BaseModel):
    amount: float
    date: str
    source: str

class IncomeAnalysisRequest(BaseModel):
    records: List[IncomeRecordItem]

class SafeToSpendRequest(BaseModel):
    current_balance: float
    expected_income_min: float
    expected_income_max: float
    essential_expenses: float
    upcoming_debt_obligations: float
    buffer_target_days: Optional[int] = 7

class ForecastRequest(BaseModel):
    historical_income_avg: float
    income_cv: float
    essential_monthly_expenses: float
    monthly_debt_obligations: float
    current_savings: float

class DistressPredictionRequest(BaseModel):
    income_trend: float
    savings_buffer_days: float
    debt_to_income: float
    income_volatility: float
    essential_expense_ratio: float

class InterventionRequest(BaseModel):
    risk_level: str
    income_volatility: float
    buffer_days: float
    upcoming_emi: float

class SimulationRequest(BaseModel):
    income_change_pct: float  # e.g., -20.0
    expense_change_pct: float # e.g., 0.0
    current_monthly_income: float
    current_monthly_expenses: float
    current_monthly_debt: float
    current_savings: float

# Routes
@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "MoneyMitra PS4 ML Engine",
        "version": "2.0.0",
        "modules": ["income_analytics", "cashflow_forecasting", "distress_prediction", "intervention_engine"]
    }

@app.post("/analytics/income-volatility")
def api_income_volatility(req: IncomeAnalysisRequest):
    return analyze_income_patterns([r.model_dump() for r in req.records])

@app.post("/analytics/safe-to-spend")
def api_safe_to_spend(req: SafeToSpendRequest):
    return calculate_safe_to_spend(
        current_balance=req.current_balance,
        expected_income_min=req.expected_income_min,
        expected_income_max=req.expected_income_max,
        essential_expenses=req.essential_expenses,
        upcoming_debt_obligations=req.upcoming_debt_obligations,
        buffer_target_days=req.buffer_target_days or 7
    )

@app.post("/analytics/cashflow-forecast")
def api_cashflow_forecast(req: ForecastRequest):
    return forecast_cashflow_30_60_90(
        historical_income_avg=req.historical_income_avg,
        income_cv=req.income_cv,
        essential_monthly_expenses=req.essential_monthly_expenses,
        monthly_debt_obligations=req.monthly_debt_obligations,
        current_savings=req.current_savings
    )

@app.post("/risk/distress-prediction")
def api_distress_prediction(req: DistressPredictionRequest):
    return predict_financial_distress(
        income_trend=req.income_trend,
        savings_buffer_days=req.savings_buffer_days,
        debt_to_income=req.debt_to_income,
        income_volatility=req.income_volatility,
        essential_expense_ratio=req.essential_expense_ratio
    )

@app.post("/interventions/recommendations")
def api_recommendations(req: InterventionRequest):
    return generate_gig_interventions(
        risk_level=req.risk_level,
        income_volatility=req.income_volatility,
        buffer_days=req.buffer_days,
        upcoming_emi=req.upcoming_emi
    )

@app.post("/simulation/run")
def api_simulation(req: SimulationRequest):
    simulated_income = req.current_monthly_income * (1 + req.income_change_pct / 100.0)
    simulated_expenses = req.current_monthly_expenses * (1 + req.expense_change_pct / 100.0)
    
    net_cashflow = simulated_income - (simulated_expenses + req.current_monthly_debt)
    
    daily_essential = (simulated_expenses) / 30.0 if simulated_expenses > 0 else 200.0
    buffer_days = round(req.current_savings / daily_essential, 1) if daily_essential > 0 else 99
    
    distress_prob = 0.85 if (net_cashflow < 0 or buffer_days < 7) else (0.45 if buffer_days < 14 else 0.15)
    
    return {
        "scenario": {
            "income_change_pct": req.income_change_pct,
            "expense_change_pct": req.expense_change_pct
        },
        "simulated_results": {
            "projected_income": round(simulated_income, 2),
            "projected_expenses": round(simulated_expenses, 2),
            "projected_cashflow": round(net_cashflow, 2),
            "emergency_buffer_days": buffer_days,
            "distress_risk_probability": distress_prob,
            "risk_status": "HIGH" if distress_prob >= 0.7 else ("MEDIUM" if distress_prob >= 0.3 else "LOW")
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
