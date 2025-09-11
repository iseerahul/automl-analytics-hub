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

    const { datasetId, action } = await req.json()

    if (action === 'analyze') {
      // Get dataset from database
      const { data: dataset, error: fetchError } = await supabaseClient
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .single()

      if (fetchError) throw fetchError

      // Download file from storage
      const { data: fileData, error: downloadError } = await supabaseClient.storage
        .from('datasets')
        .download(dataset.file_path)

      if (downloadError) throw downloadError

      // Basic file analysis (simplified for demo)
      const text = await fileData.text()
      let rows = 0
      let columns = 0

      if (dataset.name.endsWith('.csv')) {
        const lines = text.split('\n').filter(line => line.trim())
        rows = Math.max(0, lines.length - 1) // Subtract header
        if (lines.length > 0) {
          columns = lines[0].split(',').length
        }
      } else if (dataset.name.endsWith('.json')) {
        try {
          const jsonData = JSON.parse(text)
          if (Array.isArray(jsonData)) {
            rows = jsonData.length
            if (jsonData.length > 0) {
              columns = Object.keys(jsonData[0]).length
            }
          }
        } catch (e) {
          console.error('JSON parse error:', e)
        }
      }

      // Update dataset with analysis results
      const { error: updateError } = await supabaseClient
        .from('datasets')
        .update({
          rows,
          columns,
          status: 'ready'
        })
        .eq('id', datasetId)

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ 
          success: true, 
          rows, 
          columns,
          message: 'Dataset analyzed successfully' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  } catch (error) {
    console.error('Error in process-dataset function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})