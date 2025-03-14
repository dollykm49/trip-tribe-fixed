def calculate_savings_goal_progress(target_amount: float, current_amount: float, deadline: datetime) -> dict:
    remaining_amount = target_amount - current_amount
    remaining_days = (deadline - datetime.utcnow()).days
    progress_percentage = (current_amount / target_amount) * 100 if target_amount > 0 else 0

    return {
        "remaining_amount": remaining_amount,
        "remaining_days": remaining_days,
        "progress_percentage": progress_percentage
    }

def format_currency(amount: float) -> str:
    return "${:,.2f}".format(amount)

def validate_date_format(date_string: str) -> bool:
    try:
        datetime.strptime(date_string, "%Y-%m-%d")
        return True
    except ValueError:
        return False