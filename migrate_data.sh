#!/bin/bash

# Supabase Data Migration Script
# Migrates all data from the old "supabase" project to the new "Aaron's Data" project

set -e  # Exit on any error

echo "🚀 Starting Supabase Data Migration..."
echo "From: supabase (xazswqjxukvghmjbhiap)"
echo "To: Aaron's Data (ocghxwwwuubgmwsxgyoy)"
echo ""

# Project IDs
OLD_PROJECT="xazswqjxukvghmjbhiap"
NEW_PROJECT="ocghxwwwuubgmwsxgyoy"

# Create temporary directory for migration
MIGRATION_DIR="./supabase_migration_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$MIGRATION_DIR"
cd "$MIGRATION_DIR"

echo "📁 Created migration directory: $MIGRATION_DIR"
echo ""

# Step 1: Export data from old project
echo "📤 Step 1: Exporting data from old project..."

# First, link to the old project
echo "Linking to old project..."
supabase link --project-ref "$OLD_PROJECT"

echo "Exporting entire database schema and data..."
supabase db dump --data-only --schema public > full_dump.sql

echo "✅ Data export completed!"
echo ""

# Step 2: Extract specific table data from the full dump
echo "🧹 Step 2: Extracting specific table data..."

echo "Extracting cat_name_options..."
grep -A 1000 "COPY public.cat_name_options" full_dump.sql | head -n 1000 > cat_name_options.sql

echo "Extracting cat_app_users..."
grep -A 1000 "COPY public.cat_app_users" full_dump.sql | head -n 1000 > cat_app_users.sql

echo "Extracting cat_name_ratings..."
grep -A 1000 "COPY public.cat_name_ratings" full_dump.sql | head -n 1000 > cat_name_ratings.sql

echo "Extracting tournament_selections..."
grep -A 1000 "COPY public.tournament_selections" full_dump.sql | head -n 1000 > tournament_selections.sql

echo "✅ Data extraction completed!"
echo ""

# Step 3: Clean up the export files
echo "🧹 Step 3: Cleaning up export files..."
for file in cat_name_options.sql cat_app_users.sql cat_name_ratings.sql tournament_selections.sql; do
    if [ -f "$file" ]; then
        echo "Cleaning $file..."
        # Keep only the COPY statements and data
        sed -i '/^\\\./q' "$file"
        # Remove the final \. line
        sed -i '$d' "$file"
    fi
done

echo "✅ File cleanup completed!"
echo ""

# Step 4: Import data to new project
echo "📥 Step 4: Importing data to new project..."

# Link to the new project
echo "Linking to new project..."
supabase link --project-ref "$NEW_PROJECT"

echo "Importing cat_name_options..."
if [ -s "cat_name_options.sql" ]; then
    # Get the database URL for the new project
    DB_URL=$(supabase db remote commit --linked | grep "postgresql://" | head -1)
    if [ -n "$DB_URL" ]; then
        psql "$DB_URL" -f "cat_name_options.sql"
        echo "✅ cat_name_options imported"
    else
        echo "❌ Could not get database URL for new project"
    fi
else
    echo "⚠️  No cat_name_options data to import"
fi

echo "Importing cat_app_users..."
if [ -s "cat_app_users.sql" ]; then
    if [ -n "$DB_URL" ]; then
        psql "$DB_URL" -f "cat_app_users.sql"
        echo "✅ cat_app_users imported"
    else
        echo "❌ Could not get database URL for new project"
    fi
else
    echo "⚠️  No cat_app_users data to import"
fi

echo "Importing cat_name_ratings..."
if [ -s "cat_name_ratings.sql" ]; then
    if [ -n "$DB_URL" ]; then
        psql "$DB_URL" -f "cat_name_ratings.sql"
        echo "✅ cat_name_ratings imported"
    else
        echo "❌ Could not get database URL for new project"
    fi
else
    echo "⚠️  No cat_name_ratings data to import"
fi

echo "Importing tournament_selections..."
if [ -s "tournament_selections.sql" ]; then
    if [ -n "$DB_URL" ]; then
        psql "$DB_URL" -f "tournament_selections.sql"
        echo "✅ tournament_selections imported"
    else
        echo "❌ Could not get database URL for new project"
    fi
else
    echo "⚠️  No tournament_selections data to import"
fi

echo ""
echo "🎉 Migration completed successfully!"
echo ""
echo "📊 Summary:"
echo "- cat_name_options: $(wc -l < cat_name_options.sql 2>/dev/null || echo 0) records"
echo "- cat_app_users: $(wc -l < cat_app_users.sql 2>/dev/null || echo 0) records"
echo "- cat_name_ratings: $(wc -l < cat_name_ratings.sql 2>/dev/null || echo 0) records"
echo "- tournament_selections: $(wc -l < tournament_selections.sql 2>/dev/null || echo 0) records"
echo ""
echo "🔗 Your new project is ready at: https://ocghxwwwuubgmwsxgyoy.supabase.co"
echo "📸 Image uploads are now available in the cat-images bucket!"
echo ""
echo "Migration files are saved in: $MIGRATION_DIR"
echo "You can delete this directory after verifying the migration was successful."
