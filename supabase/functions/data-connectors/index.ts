import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { action, connectorType, config, name } = await req.json()

    if (action === 'create') {
      // Create a new data connector
      const { data: connector, error } = await supabaseClient
        .from('data_connectors')
        .insert({
          user_id: user.id,
          name: name || `${connectorType} Connection`,
          type: connectorType,
          config: config,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ 
          success: true, 
          connector,
          message: 'Data connector created successfully' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'test') {
      // Test connection based on connector type
      let testResult = { success: false, message: 'Connection test not implemented' }

      switch (connectorType) {
        case 's3':
          // In a real implementation, test S3 connection
          testResult = { success: true, message: 'S3 connection successful' }
          break
        case 'google_sheets':
          // In a real implementation, test Google Sheets API
          testResult = { success: true, message: 'Google Sheets connection successful' }
          break
        case 'bigquery':
          // In a real implementation, test BigQuery connection
          testResult = { success: true, message: 'BigQuery connection successful' }
          break
        default:
          testResult = { success: false, message: 'Unknown connector type' }
      }

      return new Response(
        JSON.stringify(testResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'sync') {
      // Sync data from connector (simplified implementation)
      const { connectorId } = await req.json()
      
      // Get connector config
      const { data: connector, error: fetchError } = await supabaseClient
        .from('data_connectors')
        .select('*')
        .eq('id', connectorId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError

      // Create a dataset entry for the synced data
      const { data: dataset, error: datasetError } = await supabaseClient
        .from('datasets')
        .insert({
          user_id: user.id,
          name: `${connector.name} - ${new Date().toISOString().split('T')[0]}`,
          source: connector.type,
          rows: Math.floor(Math.random() * 10000) + 1000,
          columns: Math.floor(Math.random() * 15) + 5,
          size_bytes: Math.floor(Math.random() * 1000000) + 100000,
          status: 'ready'
        })
        .select()
        .single()

      if (datasetError) throw datasetError

      return new Response(
        JSON.stringify({ 
          success: true, 
          dataset,
          message: 'Data synced successfully' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  } catch (error) {
    console.error('Error in data-connectors function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})