
-- Messages table for bidirectional communication
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read_at timestamptz,
  parent_message_id uuid REFERENCES public.messages(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin can do all on messages"
  ON public.messages FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Users can read messages sent to them or global (recipient_id IS NULL)
CREATE POLICY "Users can read own messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid() OR recipient_id IS NULL);

-- Users can insert replies (sender_id = their uid, must have parent_message_id)
CREATE POLICY "Users can reply to messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid() AND parent_message_id IS NOT NULL);

-- Users can update read_at on their own messages
CREATE POLICY "Users can mark messages as read"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid() OR recipient_id IS NULL)
  WITH CHECK (recipient_id = auth.uid() OR recipient_id IS NULL);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
