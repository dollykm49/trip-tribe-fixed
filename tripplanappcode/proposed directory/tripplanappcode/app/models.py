from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

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