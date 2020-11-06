export const getNextMessageQuery = () => `
  SELECT m.id, COALESCE(COUNT(distinct v.id), 0), m.created_at, COALESCE(max(v.viewed_at), '01-01-3000'::date)
  FROM message m
  LEFT JOIN view v ON v.message_id = m.id AND v.deleted_at is NULL AND v.user_id = :reqUserId
  WHERE m.deleted_at IS NULL and m.user_id <> :reqUserId and m.privacy = 'PUBLIC'::enum_message_privacy
  GROUP BY m.id
  ORDER BY COALESCE(COUNT(distinct v.id), 0) asc, COALESCE(max(v.viewed_at), '01-01-3000'::date) asc, m.created_at desc
  LIMIT 1;
`;
