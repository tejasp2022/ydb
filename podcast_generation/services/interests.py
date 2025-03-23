from models.models import Interest, UserInterest
from database import get_db_session
from services import research

def add_user_interest(user_id, interest_id):
    session = next(get_db_session())
    try:
        # Create the user-interest relationship
        user_interest = UserInterest(user_id=user_id, interest_id=interest_id)
        session.add(user_interest)
        session.commit()

        return {"message": "Interest added successfully"}
    except Exception as e:
        session.rollback()
        raise e