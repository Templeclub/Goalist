-- Private bucket for inspiration images: {user_id}/{goal_id}/{uuid}.webp

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('goal-media', 'goal-media', false, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy goal_media_objects_select on storage.objects
  for select to authenticated
  using (bucket_id = 'goal-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy goal_media_objects_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'goal-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not public.is_anonymous()
  );

create policy goal_media_objects_update on storage.objects
  for update to authenticated
  using (bucket_id = 'goal-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'goal-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy goal_media_objects_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'goal-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
