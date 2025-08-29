#!/usr/bin/env python3
"""
Supabase Data Migration Script
Extracts data from old project and inserts into new project with schema mapping
"""

import requests
import json
import os
from typing import List, Dict, Any

# Project IDs
OLD_PROJECT_ID = "xazswqjxukvghmjbhiap"
NEW_PROJECT_ID = "ocghxwwwuubgmwsxgyoy"

# Get environment variables
OLD_SUPABASE_URL = f"https://{OLD_PROJECT_ID}.supabase.co"
NEW_SUPABASE_URL = f"https://{NEW_PROJECT_ID}.supabase.co"

# You'll need to get these from your Supabase dashboard
OLD_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhenN3cWp4dWt2Z2htamJoaWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4ODg3MTcsImV4cCI6MjA0OTQ2NDcxN30.9fMC6hwA0RerCkEdU4AFikTCKpxAli8O7AEVxAaxSOU"
NEW_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ2h4d3d3dXViZ213c3hneW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTgzMjksImV4cCI6MjA2NTY3NDMyOX0.93cpwT3YCC5GTwhlw4YAzSBgtxbp6fGkjcfqzdKX4E0"

def get_data_from_table(project_url: str, anon_key: str, table_name: str) -> List[Dict[str, Any]]:
    """Extract data from a Supabase table"""
    headers = {
        'apikey': anon_key,
        'Authorization': f'Bearer {anon_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    url = f"{project_url}/rest/v1/{table_name}?select=*"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error getting data from {table_name}: {e}")
        return []

def transform_cat_name_options(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Transform old cat_name_options data to new schema"""
    transformed = []
    for item in data:
        # Map old schema to new schema
        new_item = {
            'name': item.get('name', ''),
            'description': item.get('description', ''),
            'avg_rating': item.get('avg_rating', 1500),
            'popularity_score': item.get('popularity_score', 0),
            'total_tournaments': item.get('total_tournaments', 0),
            'is_active': item.get('is_active', True),
            'categories': item.get('categories', [])
        }
        transformed.append(new_item)
    return transformed

def transform_cat_app_users(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Transform old cat_app_users data to new schema"""
    transformed = []
    for item in data:
        # Map old schema to new schema
        new_item = {
            'user_name': item.get('user_name', ''),
            'preferences': item.get('preferences', {
                'sound_enabled': True,
                'theme_preference': 'dark',
                'preferred_categories': [],
                'rating_display_preference': 'elo',
                'tournament_size_preference': 8
            }),
            'tournament_data': item.get('tournament_data', [])
        }
        transformed.append(new_item)
    return transformed

def transform_cat_name_ratings(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Transform old cat_name_ratings data to new schema"""
    transformed = []
    for item in data:
        # Map old schema to new schema, filtering out non-existent columns
        new_item = {
            'user_name': item.get('user_name', ''),
            'name_id': item.get('name_id', ''),
            'rating': item.get('rating', 1500),
            'wins': item.get('wins', 0),
            'losses': item.get('losses', 0),
            'is_hidden': item.get('is_hidden', False),
            'rating_history': item.get('rating_history', [])
        }
        transformed.append(new_item)
    return transformed

def transform_tournament_selections(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Transform old tournament_selections data to new schema"""
    transformed = []
    for item in data:
        # Map old schema to new schema, filtering out non-existent columns
        new_item = {
            'user_name': item.get('user_name', ''),
            'name_id': item.get('name_id', ''),
            'name': item.get('name', ''),
            'tournament_id': item.get('tournament_id', ''),
            'selected_at': item.get('selected_at', ''),
            'selection_type': item.get('selection_type', 'tournament_setup')
        }
        transformed.append(new_item)
    return transformed

def insert_data_to_table(project_url: str, anon_key: str, table_name: str, data: List[Dict[str, Any]], use_upsert: bool = False) -> bool:
    """Insert data into a Supabase table"""
    if not data:
        print(f"No data to insert for {table_name}")
        return True
    
    headers = {
        'apikey': anon_key,
        'Authorization': f'Bearer {anon_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=merge-duplicates' if use_upsert else 'return=representation'
    }
    
    url = f"{project_url}/rest/v1/{table_name}"
    
    try:
        # Insert data in batches to avoid timeouts
        batch_size = 50  # Reduced batch size for better reliability
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            response = requests.post(url, headers=headers, json=batch)
            response.raise_for_status()
            print(f"Inserted batch {i//batch_size + 1} for {table_name} ({len(batch)} records)")
        
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error inserting data into {table_name}: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response content: {e.response.text}")
        return False

def main():
    print("🚀 Starting Supabase Data Migration...")
    print(f"From: {OLD_PROJECT_ID}")
    print(f"To: {NEW_PROJECT_ID}")
    print()
    
    # Tables to migrate in dependency order (foreign keys)
    tables = [
        ('cat_name_options', 'cat_name_options', transform_cat_name_options, True),  # Use UPSERT for names
        ('cat_app_users', 'cat_app_users', transform_cat_app_users, False),
        ('cat_name_ratings', 'cat_name_ratings', transform_cat_name_ratings, False),
        ('tournament_selections', 'tournament_selections', transform_tournament_selections, False)
    ]
    
    for table_name, display_name, transform_func, use_upsert in tables:
        print(f"📤 Extracting data from {display_name}...")
        data = get_data_from_table(OLD_SUPABASE_URL, OLD_ANON_KEY, table_name)
        
        if data:
            print(f"✅ Extracted {len(data)} records from {display_name}")
            
            # Transform data to match new schema
            print(f"🔄 Transforming data for {display_name}...")
            transformed_data = transform_func(data)
            
            print(f"📥 Inserting data into {display_name}...")
            success = insert_data_to_table(NEW_SUPABASE_URL, NEW_ANON_KEY, table_name, transformed_data, use_upsert)
            
            if success:
                print(f"✅ Successfully migrated {display_name}")
            else:
                print(f"❌ Failed to migrate {display_name}")
                print("Continuing with next table...")
        else:
            print(f"⚠️  No data found in {display_name}")
        
        print()
    
    print("🎉 Migration completed!")
    print("Check your new project to verify all data was migrated successfully.")

if __name__ == "__main__":
    main()
