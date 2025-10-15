import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // External Supabase (source)
    const externalSupabase = createClient(
      'https://ocghxwwwuubgmwsxgyoy.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ2h4d3d3dXViZ213c3hneW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTgzMjksImV4cCI6MjA2NTY3NDMyOX0.93cpwT3YCC5GTwhlw4YAzSBgtxbp6fGkjcfqzdKX4E0'
    );

    // Lovable Cloud (destination)
    const lovableSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const migrationResults = {
      users: { success: 0, failed: 0, errors: [] as string[] },
      catNames: { success: 0, failed: 0, errors: [] as string[] },
      ratings: { success: 0, failed: 0, errors: [] as string[] },
      selections: { success: 0, failed: 0, errors: [] as string[] }
    };

    // Step 1: Migrate users from cat_app_users
    console.log('Migrating users...');
    const { data: users, error: usersError } = await externalSupabase
      .from('cat_app_users')
      .select('*');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      migrationResults.users.errors.push(usersError.message);
    } else if (users) {
      for (const user of users) {
        const { error: insertError } = await lovableSupabase
          .from('cat_app_users')
          .upsert({
            user_name: user.user_name,
            user_role: user.user_role || 'user',
            preferences: user.preferences || { sound_enabled: true, theme_preference: 'dark' },
            tournament_data: user.tournament_data || [],
            created_at: user.created_at,
            last_login: user.last_login
          }, { onConflict: 'user_name' });

        if (insertError) {
          migrationResults.users.failed++;
          migrationResults.users.errors.push(`${user.user_name}: ${insertError.message}`);
          console.error(`Failed to migrate user ${user.user_name}:`, insertError);
        } else {
          migrationResults.users.success++;
        }
      }
    }

    // Step 2: Migrate cat name options
    console.log('Migrating cat names...');
    const { data: catNames, error: catNamesError } = await externalSupabase
      .from('cat_name_options')
      .select('*');

    if (catNamesError) {
      console.error('Error fetching cat names:', catNamesError);
      migrationResults.catNames.errors.push(catNamesError.message);
    } else if (catNames) {
      for (const name of catNames) {
        const { error: insertError } = await lovableSupabase
          .from('cat_name_options')
          .upsert({
            id: name.id,
            name: name.name,
            description: name.description,
            is_hidden: name.is_hidden || false,
            user_name: name.user_name,
            created_at: name.created_at,
            updated_at: name.updated_at
          }, { onConflict: 'id' });

        if (insertError) {
          migrationResults.catNames.failed++;
          migrationResults.catNames.errors.push(`${name.name}: ${insertError.message}`);
          console.error(`Failed to migrate cat name ${name.name}:`, insertError);
        } else {
          migrationResults.catNames.success++;
        }
      }
    }

    // Step 3: Migrate ratings
    console.log('Migrating ratings...');
    const { data: ratings, error: ratingsError } = await externalSupabase
      .from('cat_name_ratings')
      .select('*');

    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError);
      migrationResults.ratings.errors.push(ratingsError.message);
    } else if (ratings) {
      for (const rating of ratings) {
        const { error: insertError } = await lovableSupabase
          .from('cat_name_ratings')
          .upsert({
            id: rating.id,
            user_name: rating.user_name,
            name_id: rating.name_id,
            rating: rating.rating,
            wins: rating.wins || 0,
            losses: rating.losses || 0,
            created_at: rating.created_at,
            updated_at: rating.updated_at
          }, { onConflict: 'id' });

        if (insertError) {
          migrationResults.ratings.failed++;
          migrationResults.ratings.errors.push(`Rating ${rating.id}: ${insertError.message}`);
          console.error(`Failed to migrate rating:`, insertError);
        } else {
          migrationResults.ratings.success++;
        }
      }
    }

    // Step 4: Migrate tournament selections
    console.log('Migrating tournament selections...');
    const { data: selections, error: selectionsError } = await externalSupabase
      .from('tournament_selections')
      .select('*');

    if (selectionsError) {
      console.error('Error fetching selections:', selectionsError);
      migrationResults.selections.errors.push(selectionsError.message);
    } else if (selections) {
      for (const selection of selections) {
        const { error: insertError } = await lovableSupabase
          .from('tournament_selections')
          .upsert({
            id: selection.id,
            user_name: selection.user_name,
            name_id: selection.name_id,
            tournament_id: selection.tournament_id,
            selected_at: selection.selected_at,
            created_at: selection.created_at
          }, { onConflict: 'id' });

        if (insertError) {
          migrationResults.selections.failed++;
          migrationResults.selections.errors.push(`Selection ${selection.id}: ${insertError.message}`);
          console.error(`Failed to migrate selection:`, insertError);
        } else {
          migrationResults.selections.success++;
        }
      }
    }

    const totalSuccess = 
      migrationResults.users.success + 
      migrationResults.catNames.success + 
      migrationResults.ratings.success + 
      migrationResults.selections.success;

    const totalFailed = 
      migrationResults.users.failed + 
      migrationResults.catNames.failed + 
      migrationResults.ratings.failed + 
      migrationResults.selections.failed;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Migration complete! ${totalSuccess} records migrated, ${totalFailed} failed.`,
        details: migrationResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Migration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
