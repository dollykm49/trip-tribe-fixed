from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import SavingsGoal, BudgetCategory, SavingsRule
import pytest

DATABASE_URL = "sqlite:///:memory:"  # Use an in-memory SQLite database for testing
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def test_db():
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_savings_goal_creation(test_db):
    new_goal = SavingsGoal(
        user_id=1,
        name="Emergency Fund",
        target_amount=5000.0,
        current_amount=1000.0,
        deadline=datetime(2023, 12, 31),
        is_group=False,
        auto_save=True,
        auto_save_frequency="monthly"
    )
    test_db.add(new_goal)
    test_db.commit()
    
    assert new_goal.id is not None
    assert new_goal.name == "Emergency Fund"
    assert new_goal.target_amount == 5000.0

def test_budget_category_creation(test_db):
    new_category = BudgetCategory(
        user_id=1,
        name="Groceries",
        monthly_budget=300.0,
        current_spent=150.0,
        month=datetime.utcnow().replace(day=1)
    )
    test_db.add(new_category)
    test_db.commit()
    
    assert new_category.id is not None
    assert new_category.name == "Groceries"
    assert new_category.monthly_budget == 300.0

def test_savings_rule_creation(test_db):
    new_rule = SavingsRule(
        user_id=1,
        rule_type="fixed",
        amount=100.0,
        target_goal_id=1,
        is_active=True
    )
    test_db.add(new_rule)
    test_db.commit()
    
    assert new_rule.id is not None
    assert new_rule.amount == 100.0
    assert new_rule.target_goal_id == 1