from supabase_client import supabase_client

def add_user_interest(user_id, interests: list[str]):
    supabase_client.table("users").update({
        "interests": interests
    }).eq("user_id", user_id).execute()
    
    return {"message": "Interest added successfully"}

def get_user_interests(user_id):
    response = supabase_client.table("users").select("interests").eq("user_id", user_id).execute()
    return response.data[0]["interests"]