-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Projects table for storing user edit projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Project',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
  template TEXT NOT NULL DEFAULT 'flashy' CHECK (template IN ('flashy', 'smooth-zoom', 'amv', 'minimal')),
  effects TEXT[] NOT NULL DEFAULT ARRAY['zoom'],
  music_url TEXT,
  music_duration NUMERIC,
  clips_urls TEXT[],
  output_url TEXT,
  beat_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects"
ON public.projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON public.projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.projects FOR DELETE
USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage buckets for clips and music
INSERT INTO storage.buckets (id, name, public) VALUES ('clips', 'clips', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('music', 'music', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('outputs', 'outputs', true);

-- Storage policies for clips bucket
CREATE POLICY "Users can upload their own clips"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'clips' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own clips"
ON storage.objects FOR SELECT
USING (bucket_id = 'clips' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own clips"
ON storage.objects FOR DELETE
USING (bucket_id = 'clips' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for music bucket
CREATE POLICY "Users can upload their own music"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own music"
ON storage.objects FOR SELECT
USING (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own music"
ON storage.objects FOR DELETE
USING (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for outputs bucket
CREATE POLICY "Users can view their own outputs"
ON storage.objects FOR SELECT
USING (bucket_id = 'outputs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view public outputs"
ON storage.objects FOR SELECT
USING (bucket_id = 'outputs');

CREATE POLICY "System can insert outputs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'outputs');