#!/bin/bash

# Simple Supabase Data Migration Script
# Uses direct database operations instead of CLI tools

set -e  # Exit on any error

echo "🚀 Starting Simple Supabase Data Migration..."
echo "From: supabase (xazswqjxukvghmjbhiap)"
echo "To: Aaron's Data (ocghxwwwuubgmwsxgyoy)"
echo ""

# Project IDs
OLD_PROJECT="xazswqjxukvghmjbhiap"
NEW_PROJECT="ocghxwwwuubgmwsxgyoy"

# Create temporary directory for migration
MIGRATION_DIR="./simple_migration_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$MIGRATION_DIR"
cd "$MIGRATION_DIR"

echo "📁 Created migration directory: $MIGRATION_DIR"
echo ""

echo "📋 This script will help you migrate your data manually."
echo "Since the Supabase CLI requires Docker, we'll use a different approach."
echo ""

echo "🔑 Step 1: Get your database passwords"
echo "You'll need the database passwords for both projects."
echo ""

echo "📤 Step 2: Export data from old project"
echo "1. Go to: https://supabase.com/dashboard/project/$OLD_PROJECT/sql"
echo "2. Run this query to export cat_name_options:"
echo "   SELECT * FROM cat_name_options;"
echo "3. Copy the results and save to: cat_name_options.csv"
echo ""

echo "4. Run this query to export cat_app_users:"
echo "   SELECT * FROM cat_app_users;"
echo "5. Copy the results and save to: cat_app_users.csv"
echo ""

echo "6. Run this query to export cat_name_ratings:"
echo "   SELECT * FROM cat_name_ratings;"
echo "7. Copy the results and save to: cat_name_ratings.csv"
echo ""

echo "8. Run this query to export tournament_selections:"
echo "   SELECT * FROM tournament_selections;"
echo "9. Copy the results and save to: tournament_selections.csv"
echo ""

echo "📥 Step 3: Import data to new project"
echo "1. Go to: https://supabase.com/dashboard/project/$NEW_PROJECT/sql"
echo "2. For each table, run the INSERT statements from the CSV data"
echo ""

echo "🔄 Alternative: Use Supabase Dashboard"
echo "You can also use the Supabase Dashboard to copy data:"
echo "1. Go to Table Editor in both projects"
echo "2. Copy data row by row or use the bulk operations"
echo ""

echo "📊 Expected data counts:"
echo "- cat_name_options: ~162 records"
echo "- cat_app_users: ~218 records"
echo "- cat_name_ratings: varies"
echo "- tournament_selections: varies"
echo ""

echo "🎯 After migration, your new project will have:"
echo "✅ All your existing cat names and user data"
echo "✅ The new cat-images storage bucket for uploads"
echo "✅ All the same functionality plus image features"
echo ""

echo "Migration files will be saved in: $MIGRATION_DIR"
echo "You can delete this directory after completing the migration."
echo ""
echo "Would you like me to help you with any specific part of this process?"
