from fastapi import FastAPI, Request, Body
from fastapi.responses import JSONResponse
from mangum import Mangum
from models.models_new import User, Interest, UserInterest
import services.users as users_service

app = FastAPI()

'''
GET	Read (Retrieve)	/api/users/{user_id}	Get a single user by ID
GET	Read (List)	/api/users	Get all users
POST	Create	/api/users	Create a new user
PUT	Update (or Upsert)	/api/users/{user_id}	Update an existing user or create if not exists (Upsert)
PATCH	Partial Update	/api/users/{user_id}	Partially update a user
DELETE	Delete	/api/users/{user_id}	Delete a user by ID
'''

@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    return users_service.get_user(user_id)

@app.get("/api/users")
async def get_users():
    return users_service.get_users()

@app.post("/api/users")
async def create_user(user: User):
    print(user)
    return {"message_debug_request": user}
    # return users_service.create_user(user)

@app.put("/api/users/{user_id}")
async def update_user(user_id: int, user: User):
    return users_service.update_user(user_id, user)

@app.patch("/api/users/{user_id}")
async def partial_update_user(user_id: int, user: User):
    return users_service.partial_update_user(user_id, user)

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: int):
    return users_service.delete_user(user_id)

@app.get("/api/user_interests/{user_id}")
async def get_user_interests(user_id: int):
    return users_service.get_user_interests(user_id)

@app.post("/api/user_interests/{user_id}")
async def upsert_user_interests(user_id: int, interests: list[str]):
    return users_service.upsert_user_interests(user_id, interests)


handler = Mangum(app)