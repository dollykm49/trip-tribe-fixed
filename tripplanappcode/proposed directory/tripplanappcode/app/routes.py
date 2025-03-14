from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .models import SavingsGoal, BudgetCategory, SavingsRule
from .schemas import SavingsGoalCreate, BudgetCategoryCreate
from .utils import get_db, get_current_user

router = APIRouter()

@router.post("/api/savings/create-goal")
async def create_savings_goal(goal_data: SavingsGoalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_goal = SavingsGoal(
        user_id=current_user.id,
        name=goal_data.name,
        target_amount=goal_data.target_amount,
        deadline=goal_data.deadline,
        is_group=goal_data.is_group,
        auto_save=goal_data.auto_save,
        auto_save_frequency=goal_data.auto_save_frequency
    )
    db.add(new_goal)
    db.commit()
    return {"message": "Savings goal created successfully", "goal_id": new_goal.id}

@router.post("/api/budget/set-category")
async def set_budget_category(category_data: BudgetCategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    category = BudgetCategory(
        user_id=current_user.id,
        name=category_data.name,
        monthly_budget=category_data.monthly_budget,
        month=datetime.utcnow().replace(day=1)
    )
    db.add(category)
    db.commit()
    return {"message": "Budget category set successfully"}

@router.get("/api/budget/analysis")
async def get_budget_analysis(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    categories = db.query(BudgetCategory).filter(
        BudgetCategory.user_id == current_user.id,
        BudgetCategory.month == datetime.utcnow().replace(day=1)
    ).all()
    
    analysis = []
    for category in categories:
        percentage_used = (category.current_spent / category.monthly_budget) * 100
        status = "on_track" if percentage_used <= 100 else "over_budget"
        
        analysis.append({
            "name": category.name,
            "budget": category.monthly_budget,
            "spent": category.current_spent,
            "percentage_used": percentage_used,
            "status": status
        })
    
    return analysis

@router.get("/api/savings/recommendations")
async def get_savings_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    spending_patterns = analyze_spending_patterns(current_user.id)
    recommendations = []
    
    if spending_patterns["daily_coffee"] > 4:
        recommendations.append({
            "type": "reduction",
            "category": "daily_expenses",
            "potential_savings": spending_patterns["daily_coffee"] * 2,
            "message": "Reducing daily coffee purchases could save you significant money"
        })
    
    active_goals = db.query(SavingsGoal).filter(
        SavingsGoal.user_id == current_user.id,
        SavingsGoal.current_amount < SavingsGoal.target_amount
    ).all()
    
    for goal in active_goals:
        remaining_amount = goal.target_amount - goal.current_amount
        days_to_deadline = (goal.deadline - datetime.utcnow()).days
        # Additional logic for recommendations can be added here

    return recommendations