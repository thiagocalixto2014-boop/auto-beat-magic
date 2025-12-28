// Helper to proxy HTTP video URLs through HTTPS edge function
// This solves the "mixed content" browser security issue

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const getProxiedVideoUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  // Only proxy HTTP URLs (HTTPS works fine)
  if (url.startsWith('http://')) {
    return `${SUPABASE_URL}/functions/v1/video-proxy?url=${encodeURIComponent(url)}`;
  }
  
  return url;
};

export const isHttpUrl = (url: string | null): boolean => {
  return url?.startsWith('http://') || false;
};
