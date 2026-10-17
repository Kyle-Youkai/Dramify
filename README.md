# Dramify

English desktop drama browsing page. Plain HTML, CSS and JavaScript; no build step or external dependencies.

## Preview

Open `index.html` directly, or serve this directory:

```sh
python3 -m http.server 8173
```

- Normal random assignment: `http://localhost:8173/`
- Condition A: `http://localhost:8173/?condition=A`
- Condition B: `http://localhost:8173/?condition=B`

First-time visitors complete the English registration form (nickname, gender, age, country). The profile, generated participant ID, registration time and one condition are saved together under localStorage key `dramify.participant.v1`. Returning visits reuse the saved condition. The first entry selects the 16 complete image/title pairs and applies Fisher–Yates once. The resulting ID order is saved as `dramaOrder` in the participant record. Later entries restore this exact order. Watchlist and search only affect the current view; they do not change assignment or order. Watchlist resets on reload.

Read `window.dramifyCondition` and `window.dramifyOrder` for integration. Neither is displayed in the interface. URL overrides accept only uppercase A or B when enrolling a new participant; other values use random assignment. A saved participant condition always takes precedence over URL overrides. To test the other condition, use a separate browser profile or clear only the `dramify.participant.v1` localStorage entry in developer tools.

## Files and deployment

Publish this entire directory, including `图像资源`, as a GitHub Pages site. All paths are relative; no bundler, server API, login, or routing is required. Existing artwork and filenames are preserved. This task does not publish to a remote repository.

Per the revised design request, artwork is stretched to fill equal 2:3 frames using CSS object-fit: fill. Original image files remain unchanged. Titles use identical 78px areas and buttons have equal sizes. The left sidebar switches between all dramas and My Watchlist without navigation or re-randomization.

## Verification

- JavaScript syntax check passed.
- Both forced conditions checked against all 32 title mappings in the supplied specification.
- Verified 16 unique IDs per condition, matching filenames, matching image alt text, and existing artwork files.
- Exercised every card's watchlist toggle in both conditions, search filtering, and the header watchlist filter in a DOM test harness.
- 2,000 simulated random page loads: A 949 / B 1,051; 2,000 unique orders.
- Inspected a contact sheet of all 32 source images and the original logo.
- Browser automation returned a session error; final browser rendering, image network loading, title overflow, and manual A/B visual checks remain unverified. Preview is available for review.

## Participant storage limitations

Registration is browser-local only. No demographic information or behavior is sent to a server, and the site owner cannot centrally access other visitors' records yet. A database/collection endpoint is still required for research data collection. Clearing site data, private browsing sessions, changing browser/device, or changing the site origin can create a new participant and assignment. Nicknames are display values, not authenticated identities. Both poster order and the participant's A/B condition stay fixed across reloads and sign out / re-entry.

Registration logic was checked for first entry, profile validation, 25 reloads with stable ID and condition, saved condition precedence over URL parameters, new participant creation, storage failure, and malformed saved data. Browser visual verification remains outstanding.

## Updated onboarding and feedback

Onboarding now has two steps: nickname, then gender / age / country. Country is a dropdown of English country/region labels with stored two-letter country codes. Existing participant records remain supported. The header shows the saved nickname using textContent. Sidebar Feedback opens a modal text form; entries are stored in `dramify.feedback.v1` with participant ID, condition and timestamp. No feedback is transmitted to a server. To see onboarding again after registering, use a separate browser profile or clear `dramify.participant.v1` in developer tools.

The recommendation text is presentation copy; demographic-based recommendations are not implemented. Experimental A/B assignment remains random and independent of demographics.

## Access code and sign out

Change the `accessCode` string in `config.js` to another exactly eight-digit value and redeploy to update the entry code. Current initial code: `20261018`. Code validation is a front-end convenience gate only; scripts and artwork remain publicly accessible on GitHub Pages. Server-side authentication is required for enforceable access restrictions.

A new participant enters nickname and Access code on step one, then completes demographics. Returning participants without an active tab session enter only the code; their nickname, ID and A/B condition are retained. Refreshes in the current session reuse the saved assignment. A changed configured code invalidates an old session on the next load of the updated configuration. Sign out removes `dramify.access.v1` from sessionStorage and reloads the entry screen, without deleting the participant record or feedback. Access codes are not stored with demographic records or feedback entries.

The feedback success message is `Thank you! Your feedback has been saved.` Storage is still browser-local.

Checked: wrong code rejected, changed code invalidates old sessions, sign out returns to entry and preserves participant ID and condition, and return with the new code restores the same condition.

## Fixed participant order

`dramaOrder` contains exactly 16 unique integer IDs (1–16). New participants receive one shuffled order. Older records without it receive and save an order on their next entry. Malformed orders are replaced with a valid shuffled order. If saving fails, the app remains behind the entry screen with an error instead of showing an unsaved order. The saved ID order is combined with the participant's fixed condition to preserve complete image/title pairs. `window.dramifyOrder` exposes the restored displayed order.

## Sign-out key code

Sign out now opens a completion screen showing `completionCode` from `config.js` (initial value `skmxbueo`) with a copy control and a Back to sign in action. The screen persists across refreshes in the same tab using `dramify.completed.v1` in sessionStorage. Sign out preserves the participant profile and drama order; it does not certify that research data has been uploaded. Upload updated config.js, enrollment.js, index.html and style.css to deploy this change.

## Profile and history navigation

The header profile control opens an editable nickname, gender, age and country form. Saving updates the existing participant record while preserving ID, condition, registration time and dramaOrder. Browsing History is an intentionally empty view and does not collect browsing events. Removed the Genre control and updated entry and empty-watchlist copy. Deploy index.html, style.css, script.js and enrollment.js for these changes.
