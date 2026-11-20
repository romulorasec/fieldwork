-- The user-profile trigger is only for auth.users inserts, never a public RPC.
revoke execute on function public.handle_fieldwork_user() from public, anon, authenticated;
