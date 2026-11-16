DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
CREATE POLICY "Users can read own messages" ON public.messages
FOR SELECT TO authenticated
USING (
  sender_id = auth.uid()
  OR recipient_id = auth.uid()
  OR (recipient_id IS NULL AND parent_message_id IS NULL)
);

DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;
CREATE POLICY "Users can mark messages as read" ON public.messages
FOR UPDATE TO authenticated
USING (recipient_id = auth.uid() OR (recipient_id IS NULL AND parent_message_id IS NULL))
WITH CHECK (recipient_id = auth.uid() OR (recipient_id IS NULL AND parent_message_id IS NULL));