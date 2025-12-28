import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const videoUrl = url.searchParams.get('url')
    
    if (!videoUrl) {
      console.error('Missing url parameter')
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Proxying video:', videoUrl)

    // Forward range header if present (for video seeking)
    const headers: Record<string, string> = {}
    const rangeHeader = req.headers.get('range')
    if (rangeHeader) {
      headers['Range'] = rangeHeader
      console.log('Range request:', rangeHeader)
    }

    // Fetch video from HTTP server
    const response = await fetch(videoUrl, { headers })
    
    if (!response.ok && response.status !== 206) {
      console.error('Video fetch failed:', response.status, response.statusText)
      return new Response(
        JSON.stringify({ error: 'Video not found', status: response.status }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Video response status:', response.status)

    // Build response headers
    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
      'Cache-Control': 'public, max-age=3600',
    }

    // Forward content headers for proper video playback
    const contentLength = response.headers.get('Content-Length')
    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength
    }

    const contentRange = response.headers.get('Content-Range')
    if (contentRange) {
      responseHeaders['Content-Range'] = contentRange
    }

    const acceptRanges = response.headers.get('Accept-Ranges')
    if (acceptRanges) {
      responseHeaders['Accept-Ranges'] = acceptRanges
    } else {
      responseHeaders['Accept-Ranges'] = 'bytes'
    }

    // Stream the video back
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Proxy error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
