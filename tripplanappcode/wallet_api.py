from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import json

app = FastAPI()

# Savings Goal Model
class SavingsGoal(Base):
    __tablename__ = "savings_goals"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    target_amount = Column(Float)
    current_amount = Column(Float, default=0.0)
    deadline = Column(DateTime)
    is_group = Column(Boolean, default=False)
    auto_save = Column(Boolean, default=False)
    auto_save_frequency = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# Budget Category Model
class BudgetCategory(Base):
    __tablename__ = "budget_categories"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    monthly_budget = Column(Float)
    current_spent = Column(Float, default=0.0)
    month = Column(DateTime)

# Smart Savings Rules
class SavingsRule(Base):
    __tablename__ = "savings_rules"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    rule_type = Column(String)  # roundup, percentage, fixed
    amount = Column(Float)
    target_goal_id = Column(Integer, ForeignKey("savings_goals.id"))
    is_active = Column(Boolean, default=True)

@app.post("/api/savings/create-goal")
async def create_savings_goal(goal_data: dict, current_user: User = Depends(get_current_user)):
    try:
        new_goal = SavingsGoal(
            user_id=current_user.id,
            name=goal_data["name"],
            target_amount=goal_data["targetAmount"],
            deadline=datetime.strptime(goal_data["deadline"], "%Y-%m-%d"),
            is_group=goal_data["isGroup"],
            auto_save=goal_data["autoSave"],
            auto_save_frequency=goal_data["frequency"]
        )
        db.add(new_goal)
        db.commit()

        if goal_data["autoSave"]:
            # Calculate and set up automatic savings
            setup_auto_savings(new_goal.id, goal_data)

        return {"message": "Savings goal created successfully", "goal_id": new_goal.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def setup_auto_savings(goal_id: int, goal_data: dict):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id).first()
    remaining_days = (goal.deadline - datetime.utcnow()).days
    
    if goal_data["frequency"] == "daily":
        amount_per_save = goal.target_amount / remaining_days
    elif goal_data["frequency"] == "weekly":
        amount_per_save = goal.target_amount / (remaining_days / 7)
    else:  # monthly
        amount_per_save = goal.target_amount / (remaining_days / 30)

    savings_rule = SavingsRule(
        user_id=goal.user_id,
        rule_type="fixed",
        amount=amount_per_save,
        target_goal_id=goal_id
    )
    db.add(savings_rule)
    db.commit()

@app.post("/api/budget/set-category")
async def set_budget_category(category_data: dict, current_user: User = Depends(get_current_user)):
    category = BudgetCategory(
        user_id=current_user.id,
        name=category_data["name"],
        monthly_budget=category_data["budget"],
        month=datetime.utcnow().replace(day=1)
    )
    db.add(category)
    db.commit()
    return {"message": "Budget category set successfully"}

@app.get("/api/budget/analysis")
async def get_budget_analysis(current_user: User = Depends(get_current_user)):
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

@app.get("/api/savings/recommendations")
async def get_savings_recommendations(current_user: User = Depends(get_current_user)):
    # Analyze spending patterns
    spending_patterns = analyze_spending_patterns(current_user.id)
    
    # Generate personalized recommendations
    recommendations = []
    
    # Check for high-frequency small purchases
    if spending_patterns["daily_coffee"] > 4:
        recommendations.append({
            "type": "reduction",
            "category": "daily_expenses",
            "potential_savings": spending_patterns["daily_coffee"] * 2,
            "message": "Reducing daily coffee purchases could save you significant money"
        })
    
    # Check for optimal saving frequency
    active_goals = db.query(SavingsGoal).filter(
        SavingsGoal.user_id == current_user.id,
        SavingsGoal.current_amount < SavingsGoal.target_amount
    ).all()
    
    for goal in active_goals:
        remaining_amount = goal.target_amount - goal.current_amount
        days_to_deadline = (goal.deadline - datetime.utcnow()).days
        if days_to_deadline > 0:
            optimal_frequency = remaining_amount / days_to_deadline
            recommendations.append({
                "type": "frequency",
                "goal": goal.name,
                "optimal_frequency": optimal_frequency,
                "message": f"To reach your goal '{goal.name}', save {optimal_frequency:.2f} per day."
            })
    
    return recommendations

def analyze_spending_patterns(user_id: int):
    # Placeholder function to analyze spending patterns
    # In a real application, this would involve complex data analysis
    return {
        "daily_coffee": 5,
        "weekly_dining": 3,
        "monthly_shopping": 2
    }