# Dramify

English desktop drama browser; plain HTML/CSS/JavaScript, no build step. Publish this whole folder to GitHub Pages root.

## Preview

Open `index.html`, or run `python3 -m http.server 8173` from this directory.

## Entry and assignment

Registration has two steps: nickname + access code, then gender / age / country. The country field is a dropdown. Access codes are configured in `config.js`:

- `20266202`: Condition A (odd IDs a, even IDs b).
- `62022026`: Condition B (odd IDs b, even IDs a).

Assignment is determined by the submitted access code, not randomization or URL parameters. A returning participant entering the other valid code changes condition but retains ID, drama order and wallet. Existing sessions from the previous one-code configuration must enter a new valid code. The complete 16-drama ID order is shuffled once and saved, then restored across reloads. Image/title pairs always remain linked. `window.dramifyCondition` and `window.dramifyOrder` expose the displayed assignment and order.

The right header profile control edits demographics without resetting the wallet or order. Browsing History is intentionally empty. Sign out asks for confirmation, then deletes the local participant record (including wallet, pre-orders and order), associated feedback and access session. It shows the completion code (`skmxbueo`, configurable as `completionCode`) with a copy control, without a return button. Refresh starts registration again.

## Wallet

Wallet receives 100 coins once per locally registered participant, including migration of older profiles without a wallet. Each confirmed pre-order costs 20 coins. Home cards show Pre-order, with a confirmation dialog before charging. Confirmed Home cards show a disabled Pre-ordered state. Only My Watchlist offers Cancel pre-order, with a second confirmation and a 20-coin refund. Dismissing either confirmation makes no changes. Re-ordering costs 20 coins again. The Wallet navigation control shows the live balance. Insufficient balance prevents additions. Balance, watchlist and coin activity are saved together, and failed writes do not deduct coins. Refreshes and profile edits preserve them.

## Local records and limits

- `localStorage["dramify.participant.v1"]`: ID, demographics, condition, fixed dramaOrder and wallet (balance, watchlist, transactions).
- `localStorage["dramify.feedback.v1"]`: feedback with participant ID, condition and timestamp.
- `sessionStorage["dramify.access.v1"]`: active tab access session.
- `sessionStorage["dramify.completed.v1"]`: completion-screen state.

Five-star Want to watch ratings currently remain in page memory. No participant or behavior data is transmitted to a database yet. Records are browser-local and can be reset by clearing site storage. Access codes and coin balances are client-side controls, not server-enforced authentication or accounting. A backend is required for enforceable rules and centralized research collection. Recommendation copy does not implement demographic-based recommendations.

## Artwork and validation

Source artwork is unchanged. Home posters are stretched to a consistent display size, with height shortened 15% per the revised request. The supplied banner is displayed without cropping. The Home grid, watchlist rows and wallet share the same assigned image/title pairs.

Logic checks cover both code mappings and invalid/old code rejection, restored sessions, changing code without resetting ID/order/wallet, fixed 16-ID order, one-time 100-coin bonus, five 20-coin additions, insufficient balance, confirmed cancellation with refund, refresh restoration, storage-failure rollback, navigation and profile edits. Final browser visual QA remains outstanding.

For the access-code and wallet update, deploy `config.js`, `enrollment.js`, `script.js`, `index.html`, and `style.css`.

## Pre-order interface update

Home promotional copy describes upcoming dramas and 20-coin advance reservations with full-series access on release. My Watchlist uses a cassette icon. Updated files for this change: index.html, style.css and script.js. Logic tests cover both confirmation dismissals, home cancellation prevention, watchlist cancellation, refunds, live balance, duplicate confirmation, insufficient balance and save failures. No actual streaming entitlement or server payment processing is implemented.

## Refund migration and upcoming banner

Wallet policy version 2 reconciles old balances to 100 minus 20 per active pre-order. Correction transactions are recorded once when needed. Cancelling each pre-order refunds 20 coins; cancelling all restores 100. Old no-refund data with an empty watchlist now restores 100 on entry. Homepage heading and promotional paragraph are replaced with 图像资源/预告banner.png; other view headings remain. Versioned asset URLs request the updated scripts and CSS. Deploy index.html, script.js, style.css and 图像资源/预告banner.png together.

## Latest sign-out and Home changes

Home displays only 图像资源/预告banner.png. Confirmed sign out deletes the local user; dismissing leaves the user unchanged. The completion screen is not restored on refresh. Logic checks cover deletion confirmation, associated feedback cleanup, completion code display and fresh registration after refresh, plus pre-order/refund regression checks. Deploy index.html, script.js and enrollment.js.

## Platform evaluation

Feedback opens a single wide dialog with rating above Comment. The 1–10 rating (1 = Very bad, 10 = Very good) and comment each have a separate Confirm button. Confirm saves that section, shows Confirmed, locks the field and exposes Edit without closing the dialog. X closes it; Escape is prevented. Reopening or refreshing restores the most recent saved rating/comment for the participant. Edit enables that section for reconfirmation; unconfirmed edits are discarded on reopen. Both sections update one record and may be confirmed independently. Confirmed sign out removes the participant's feedback. Deploy index.html, enrollment.js and style.css for this update.
