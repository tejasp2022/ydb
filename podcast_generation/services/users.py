from supabase_client import supabase_client
from models.models_new import User, Interest, UserInterest

def validate_user_id(user_id):
    response = supabase_client.table("users").select("*").eq("user_id", user_id).execute()
    return len(response.data) > 0

def get_user(user_id):
    if not validate_user_id(user_id):
        return {"message": "User not found"}
    
    response = supabase_client.table("users").select("*").eq("user_id", user_id).execute()
    return response.data[0]

def get_users():
    response = supabase_client.table("users").select("*").execute()
    return response.data

def create_user(user: User):
    response = supabase_client.table("users").insert({
        "user_id": user.user_id,
        "google_sso_id": user.google_sso_id,
        "rss_feed_url": user.rss_feed_url,
        "interests": user.interests
    }).execute()
    
    return {"message": "User created successfully", "user": response.data[0]}

def update_user(user_id: int, user: User):
    if not validate_user_id(user_id):
        return {"message": "User not found"}
    
    response = supabase_client.table("users").update({
        "google_sso_id": user.google_sso_id,
        "rss_feed_url": user.rss_feed_url,
        "interests": user.interests
    }).eq("user_id", user_id).execute()
    
    return {"message": "User updated successfully", "user": response.data[0]}

def partial_update_user(user_id: int, user: User):
    if not validate_user_id(user_id):
        return {"message": "User not found"}
    
    update_data = {}
    if user.google_sso_id is not None:
        update_data["google_sso_id"] = user.google_sso_id
    if user.rss_feed_url is not None:
        update_data["rss_feed_url"] = user.rss_feed_url
    if user.interests is not None:
        update_data["interests"] = user.interests
    
    response = supabase_client.table("users").update(update_data).eq("user_id", user_id).execute()
    
    return {"message": "User partially updated successfully", "user": response.data[0]}

def delete_user(user_id: int):
    if not validate_user_id(user_id):
        return {"message": "User not found"}
    
    supabase_client.table("users").delete().eq("user_id", user_id).execute()
    
    return {"message": "User deleted successfully"}

def get_user_interests(user_id: int):
    response = supabase_client.table("user_interests").select("*").eq("user_id", user_id).execute()
    return response.data

def upsert_user_interests(user_id: int, interests: list[str]):
    response = supabase_client.table("user_interests").upsert({
        "user_id": user_id, "interests": interests}).execute()