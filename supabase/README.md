# Current watch-v3 setup

For this interface update, follow [the dated deployment guide](20261020-更新说明.md) and run `20261020_watch_behaviors.sql` on an existing project before deploying. Only a brand-new project should run schema.sql. The additive migration keeps existing export columns, adds independent behavior variables, and archives pre-order-era records in an admin-only table.

The notes below describe the original cloud setup. Its choice definition (pre-order) is superseded by the watch-v3 choice definition (paid full-series unlock). New behavior/export definitions are in the dated guide.

# Dramify cloud collection

## One-time dashboard setup

1. Run schema.sql once in this project's SQL Editor. It creates dramify_responses and dramify_export without removing other tables. If they already exist, do not rerun or delete them.
2. Enable Anonymous Sign-Ins under Authentication. Participants authenticate without an email/password; own-row RLS policies isolate records.
3. The supplied publishable key and project URL are configured in ../config.js. No secret/service-role key is needed in the website.

## Deploy

Update config.js, cloud.js (new), enrollment.js, index.html, script.js, style.css and the vendor folder. The vendored official Supabase JavaScript client avoids a runtime CDN request. Use the exact HTML paths; Supabase code must load before enrollment.js.

## Records and analysis

One participant UUID corresponds to one dramify_responses row. The generated server timestamp is Time; Code is the entry access code; Condition is derived A/B. Nickname is separate from ID. Demographic edits update that row. Only confirmed feedback is uploaded.

Duration is cumulative seconds with the main platform open, including background time and excluding enrollment and time between visits. Local checkpoints and cloud attempts happen every 10 seconds and after user changes, with a local checkpoint on pagehide. The final upload freezes duration when sign out is confirmed. Abrupt closure/offline use can leave the last checkpoint unsynced until the same participant returns. Multiple simultaneous platform tabs are not intended; their durations may overlap.

Only 16 displayed pairs are included in stimuli. For example {"1a":{"choice":0,"rating":null},"2b":{"choice":1,"rating":4}}. Absent/unshown versions export NULL. Shown choice starts at 0, becomes 1 on confirmed pre-order, and returns to 0 on confirmed cancellation. Ratings are version-specific 1–5 or NULL, and now survive refreshes. AppRating is the latest confirmed 1–10 platform rating or NULL; Comment is the latest confirmed comment.

Confirmed sign out awaits an acknowledged completed=true upload before showing the key code. If upload fails, local data is retained and sign out asks the participant to retry. Successful sign out deletes only local profile/feedback/authentication, never the research row. The next registration creates a new anonymous identity and response.

In the SQL Editor run:

```sql
select * from public.dramify_export order by "Time";
```

Download the result as CSV. The view includes all 64 requested Drama1A(choice)/Drama1A(rating)...Drama16B(rating) fields. Table Editor also shows dramify_responses, with stimuli in JSON form. The CSV view is the convenient analysis format.

## Deployment acceptance test

Use a test nickname, e.g. TEST_Dramify. Register with 20266202 (A), pre-order one drama, rate its Want to watch stars, and confirm platform rating/comment. Check the matching database row and export view. Cancel the order and confirm choice returns to 0; verify rating persists after refresh. Sign out and verify Completed=true while the row remains stored. Repeat with 62022026 (B). Exclude TEST participants from analysis.

## Verification limits

Local mocked tests passed: snapshot fields, 16 exposed image/title variants, null unshown/unrated values, timing accumulation, serialized updates, offline retention/retry, completed final upload, sign-out failure protection, persistent 1–5 ratings, pre-order/refund regression and feedback edit/reopen behavior. Live access to the supplied Supabase host failed due to connection resets in this environment. No test response was created and live Auth/RLS/database acceptance remains unverified. Browser visual QA remains outstanding. Do not start formal data collection until the acceptance test succeeds.

Access codes and coins remain client-side interface rules, not server-enforced authorization or payment processing.
