from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class SavingsGoalCreate(BaseModel):
    name: str
    target_amount: float
    deadline: datetime
    is_group: Optional[bool] = False
    auto_save: Optional[bool] = False
    frequency: Optional[str] = None

class SavingsGoalResponse(BaseModel):
    id: int
    user_id: int
    name: str
    target_amount: float
    current_amount: float
    deadline: datetime
    is_group: bool
    auto_save: bool
    auto_save_frequency: Optional[str]
    created_at: datetime

class BudgetCategoryCreate(BaseModel):
    name: str
    monthly_budget: float

class BudgetCategoryResponse(BaseModel):
    id: int
    user_id: int
    name: str
    monthly_budget: float
    current_spent: float
    month: datetime

class SavingsRuleCreate(BaseModel):
    rule_type: str  # e.g., "roundup", "percentage", "fixed"
    amount: float
    target_goal_id: int

class SavingsRuleResponse(BaseModel):
    id: int
    user_id: int
    rule_type: str
    amount: float
    target_goal_id: int
    is_active: bool

class BudgetAnalysisResponse(BaseModel):
    name: str
    budget: float
    spent: float
    percentage_used: float
    status: str

class SavingsRecommendationsResponse(BaseModel):
    recommendations: List[dict]