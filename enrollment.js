"use strict";

// The participant record and assignment are saved together in one local write.
// Assignment comes from the access code; the saved drama order is preserved.
const PARTICIPANT_STORAGE_KEY = "dramify.participant.v1";
const participantForm = document.querySelector("#enrollment-form");
const enrollmentError = document.querySelector("#enrollment-error");
let siteStarted = false;
let activeParticipant = null;
let enrollmentStep = 1;
let returningParticipant = null;
const ACCESS_SESSION_KEY = "dramify.access.v1";
const COMPLETION_SESSION_KEY = "dramify.completed.v1";
const accessCodeInput = document.querySelector("#access-code");
const accessCodes = window.DRAMIFY_CONFIG.accessCodes;

function hasValidAccessCode() {
  if (!/^[0-9]{8}$/.test(accessCodeInput.value) || !Object.hasOwn(accessCodes, accessCodeInput.value)) {
    showEnrollmentError("That access code is incorrect. Please enter the 8-digit code provided to you.");
    accessCodeInput.focus();
    return false;
  }
  return true;
}
const nicknameInput = document.querySelector("#participant-nickname");
const countrySelect = document.querySelector("#participant-country");
const countryCodes = "AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW".split(" ");
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = countryCodes.map(code => ({code, name: countryNames.of(code)})).sort((a, b) => a.name.localeCompare(b.name, "en"));
for (const country of countries) {
  const option = document.createElement("option");
  option.value = country.code;
  option.textContent = country.name;
  countrySelect.append(option);
}

function showEnrollmentStep(step) {
  enrollmentStep = step;
  document.querySelector(".enrollment-instruction").hidden = step !== 1;
  document.querySelector("#nickname-step").hidden = step !== 1;
  document.querySelector("#details-step").hidden = step !== 2;
  document.querySelector("#details-step").disabled = step !== 2;
  document.querySelector("#enrollment-step").textContent = String(step);
  const heading = document.querySelector("#welcome-title");
  heading.textContent = step === 1 ? "Welcome Dramify" : "A little about you";
  document.querySelector(".enrollment-intro").textContent = step === 1
    ? "On the Dramify homepage, users need to enter their nickname and access code to complete registration and enter Dramify."
    : "Help us get to know you so we can recommend dramas that suit you.";
  document.querySelector("#enrollment-back").hidden = step === 1;
  document.querySelector(".enrollment-submit").textContent = step === 1 ? "Continue →" : "Start exploring →";
  enrollmentError.hidden = true;
  heading.focus();
}
document.querySelector("#enrollment-back").addEventListener("click", () => showEnrollmentStep(1));

function isValidParticipant(value) {
  return value && value.schemaVersion === 1
    && typeof value.id === "string" && value.id.length > 0
    && typeof value.nickname === "string" && value.nickname.trim().length > 0
    && typeof value.gender === "string" && value.gender.length > 0
    && Number.isInteger(value.age) && value.age >= 1 && value.age <= 120
    && typeof value.country === "string" && value.country.trim().length > 0
    && typeof value.createdAt === "string"
    && (value.condition === "A" || value.condition === "B");
}

function enterDramify(participant, code) {
  if (siteStarted) return;
  try {
    sessionStorage.setItem(ACCESS_SESSION_KEY, JSON.stringify({ participantId: participant.id, code, accessVersion: 2 }));
  } catch (error) {
    showEnrollmentError("Please allow browser storage to continue.");
    return;
  }
  activeParticipant = participant;
  document.querySelector(".user-nickname").textContent = participant.nickname;
  document.querySelector(".user-profile").title = participant.nickname;
  try {
    initializeDramify(participant);
  } catch (error) {
    showEnrollmentError("We could not save your profile or wallet. Please allow browser storage and try again.");
    return;
  }
  siteStarted = true;
  document.querySelector(".enrollment").hidden = true;
  document.querySelector("#dramify-app").hidden = false;
  document.body.classList.remove("enrolling");
  window.DramifyCloud.start(participant);
}

function showEnrollmentError(message) {
  enrollmentError.textContent = message;
  enrollmentError.hidden = false;
}

try {
  const saved = localStorage.getItem(PARTICIPANT_STORAGE_KEY);
  if (saved) {
    const participant = JSON.parse(saved);
    if (isValidParticipant(participant)) {
      returningParticipant = participant;
      nicknameInput.value = participant.nickname;
      nicknameInput.readOnly = true;
      document.querySelector("#welcome-title").textContent = "Welcome Dramify";
      document.querySelector(".enrollment-intro").textContent = "On the Dramify homepage, users need to enter their nickname and access code to complete registration and enter Dramify.";
      document.querySelector(".enrollment-progress").hidden = true;
      document.querySelector(".enrollment-submit").textContent = "Continue to Dramify →";
      // A changed configured code invalidates the previous browser session.
      let access = null;
      try { access = JSON.parse(sessionStorage.getItem(ACCESS_SESSION_KEY) || "null"); } catch (error) { /* Show the code entry again. */ }
      if (access && access.participantId === participant.id && access.accessVersion === 2 && accessCodes[access.code] === participant.condition) enterDramify(participant, access.code);
    }
    else showEnrollmentError("Your saved details could not be restored. Please complete the form again.");
  }
} catch (error) {
  showEnrollmentError("Your saved details could not be read. Please allow browser storage to keep your details when you return.");
}

participantForm.addEventListener("submit", event => {
  event.preventDefault();
  if (siteStarted) return;
  if (enrollmentStep === 1) {
    if (!nicknameInput.reportValidity()) return;
    if (!nicknameInput.value.trim()) {
      showEnrollmentError("Please enter a nickname.");
      return;
    }
    if (!hasValidAccessCode()) return;
    if (returningParticipant) {
      const updatedParticipant = { ...returningParticipant, condition: accessCodes[accessCodeInput.value] };
      try {
        localStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify(updatedParticipant));
      } catch (error) {
        showEnrollmentError("We could not save your details. Please allow browser storage and try again.");
        return;
      }
      enterDramify(updatedParticipant, accessCodeInput.value);
      return;
    }
    showEnrollmentStep(2);
    return;
  }
  if (!participantForm.reportValidity() || !hasValidAccessCode()) return;
  const data = new FormData(participantForm);
  const nickname = String(data.get("nickname") || "").trim();
  const countryCode = String(data.get("country") || "");
  const selectedCountry = countries.find(country => country.code === countryCode);
  const country = selectedCountry ? selectedCountry.name : "";
  if (!nickname || !country) {
    showEnrollmentError("Please enter a nickname and country.");
    return;
  }
  const participant = {
    schemaVersion: 1,
    id: crypto.randomUUID(),
    nickname,
    gender: String(data.get("gender")),
    age: Number(data.get("age")),
    country,
    countryCode,
    createdAt: new Date().toISOString(),
    condition: accessCodes[accessCodeInput.value]
  };
  if (!isValidParticipant(participant)) {
    showEnrollmentError("Please check your details and try again.");
    return;
  }
  try {
    localStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify(participant));
  } catch (error) {
    showEnrollmentError("We could not save your details. Please enable browser storage and try again.");
    return;
  }
  enterDramify(participant, accessCodeInput.value);
});


const feedbackDialog = document.querySelector(".feedback-workspace");
const feedbackForm = document.querySelector("#feedback-form");
const feedbackText = document.querySelector("#feedback-text");
const feedbackStatus = document.querySelector(".feedback-status");
const platformRatingForm = document.querySelector("#platform-rating-form");
const platformRatingStatus = document.querySelector(".platform-rating-status");
const ratingFieldset = document.querySelector(".platform-rating-fieldset");
let currentFeedbackId = null;

function setFeedbackSection(section, confirmed) {
  document.querySelector(`.${section}-confirm`).hidden = confirmed;
  document.querySelector(`.${section}-confirmed`).hidden = !confirmed;
  document.querySelector(`.${section}-edit`).hidden = !confirmed;
  if (section === "rating") ratingFieldset.disabled = confirmed;
  else feedbackText.readOnly = confirmed;
}
function readFeedbackEntries() {
  const entries = JSON.parse(localStorage.getItem("dramify.feedback.v1") || "[]");
  if (!Array.isArray(entries)) throw new Error("Invalid feedback records");
  return entries;
}
function saveFeedbackSection(patch) {
  const entries = readFeedbackEntries();
  let index = entries.findIndex(entry => entry.id === currentFeedbackId && entry.participantId === activeParticipant.id);
  const now = new Date().toISOString();
  if (index < 0) {
    entries.push({id:crypto.randomUUID(),participantId:activeParticipant.id,condition:activeParticipant.condition,text:"",createdAt:now});
    index = entries.length - 1;
  }
  entries[index] = { ...entries[index], ...patch, updatedAt:now };
  localStorage.setItem("dramify.feedback.v1", JSON.stringify(entries));
  currentFeedbackId = entries[index].id;
  window.DramifyCloud.changed();
}
document.querySelector(".feedback-open").addEventListener("click", () => {
  if (!activeParticipant) return;
  currentFeedbackId = null;
  platformRatingForm.reset();
  platformRatingStatus.hidden = true;
  feedbackStatus.hidden = true;
  feedbackText.value = "";
  setFeedbackSection("rating", false);
  setFeedbackSection("comment", false);
  try {
    const saved = readFeedbackEntries().filter(entry => entry.participantId === activeParticipant.id).at(-1);
    if (saved) {
      currentFeedbackId = saved.id;
      const hasRating = Number.isInteger(saved.rating) && saved.rating >= 1 && saved.rating <= 10;
      if (hasRating) document.querySelector(`#platform-rating-form input[value="${saved.rating}"]`).checked = true;
      feedbackText.value = typeof saved.text === "string" ? saved.text : "";
      setFeedbackSection("rating", hasRating);
      setFeedbackSection("comment", feedbackText.value.trim().length > 0);
    }
  } catch (error) {
    feedbackStatus.textContent = "Your saved feedback could not be loaded. Please try again.";
    feedbackStatus.hidden = false;
  }
  feedbackDialog.showModal();
});
document.querySelector(".feedback-workspace .feedback-close").addEventListener("click", () => feedbackDialog.close());
feedbackDialog.addEventListener("cancel", event => event.preventDefault());
document.querySelector(".rating-edit").addEventListener("click", () => {
  setFeedbackSection("rating", false);
  platformRatingStatus.hidden = true;
});
document.querySelector(".comment-edit").addEventListener("click", () => {
  setFeedbackSection("comment", false);
  feedbackStatus.hidden = true;
  feedbackText.focus();
});
platformRatingForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!activeParticipant || ratingFieldset.disabled || !platformRatingForm.reportValidity()) return;
  const rating = Number(new FormData(platformRatingForm).get("platformRating"));
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) return;
  try {
    saveFeedbackSection({rating, ratingConfirmedAt:new Date().toISOString()});
    platformRatingStatus.hidden = true;
    setFeedbackSection("rating", true);
  } catch (error) {
    platformRatingStatus.textContent = "Your rating could not be saved. Please try again.";
    platformRatingStatus.hidden = false;
  }
});
feedbackForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!activeParticipant || feedbackText.readOnly || !feedbackForm.reportValidity()) return;
  const text = feedbackText.value.trim();
  if (!text) {
    feedbackStatus.textContent = "Please enter a comment before confirming.";
    feedbackStatus.hidden = false;
    return;
  }
  try {
    saveFeedbackSection({text, commentConfirmedAt:new Date().toISOString()});
    feedbackText.value = text;
    feedbackStatus.hidden = true;
    setFeedbackSection("comment", true);
  } catch (error) {
    feedbackStatus.textContent = "Your comment could not be saved. Please try again.";
    feedbackStatus.hidden = false;
  }
});


// The completion code is displayed only after confirmed local account deletion.
function showCompletionScreen() {
  document.querySelector("#dramify-app").hidden = true;
  document.querySelector(".enrollment").hidden = true;
  document.querySelector(".completion-screen").hidden = false;
  document.querySelector(".completion-code").textContent = window.DRAMIFY_CONFIG.completionCode;
  document.body.classList.add("enrolling");
  document.querySelector("#completion-title").focus();
}

const signoutDialog = document.querySelector(".signout-dialog");
document.querySelector(".sign-out").addEventListener("click", () => {
  if (!activeParticipant) return;
  document.querySelector(".signout-error").hidden = true;
  signoutDialog.showModal();
});
document.querySelector(".signout-dismiss").addEventListener("click", () => signoutDialog.close());
document.querySelector(".signout-confirm").addEventListener("click", async () => {
  if (!activeParticipant) return;
  const confirmButton = document.querySelector(".signout-confirm");
  if (confirmButton.disabled) return;
  confirmButton.disabled = true;
  confirmButton.textContent = "Saving…";
  try {
    await window.DramifyCloud.complete();
  } catch (error) {
    const message = document.querySelector(".signout-error");
    message.textContent = "Your responses have not synced yet. Please check your connection and try again. Your data is still saved on this device.";
    message.hidden = false;
    confirmButton.disabled = false;
    confirmButton.textContent = "Confirm sign out";
    return;
  }
  try {
    const stored = JSON.parse(localStorage.getItem(PARTICIPANT_STORAGE_KEY) || "null");
    if (stored && stored.id !== activeParticipant.id) throw new Error("Participant changed");
    const feedbackKey = "dramify.feedback.v1";
    const entries = JSON.parse(localStorage.getItem(feedbackKey) || "[]");
    if (!Array.isArray(entries)) throw new Error("Invalid feedback records");
    const remaining = entries.filter(entry => entry.participantId !== activeParticipant.id);
    if (remaining.length) localStorage.setItem(feedbackKey, JSON.stringify(remaining));
    else localStorage.removeItem(feedbackKey);
    sessionStorage.removeItem(ACCESS_SESSION_KEY);
    sessionStorage.removeItem(COMPLETION_SESSION_KEY);
    localStorage.removeItem(PARTICIPANT_STORAGE_KEY);
  } catch (error) {
    const message = document.querySelector(".signout-error");
    message.textContent = "We could not delete your saved data. Please allow browser storage and try again.";
    message.hidden = false;
    confirmButton.disabled = false;
    confirmButton.textContent = "Confirm sign out";
    return;
  }
  await window.DramifyCloud.clearSession();
  activeParticipant = null;
  returningParticipant = null;
  signoutDialog.close();
  if (feedbackDialog.open) feedbackDialog.close();
  const profileModal = document.querySelector(".profile-dialog");
  if (profileModal.open) profileModal.close();
  showCompletionScreen();
});

document.querySelector(".copy-key-code").addEventListener("click", async () => {
  const status = document.querySelector(".copy-code-status");
  try {
    await navigator.clipboard.writeText(window.DRAMIFY_CONFIG.completionCode);
    status.textContent = "Key code copied.";
  } catch (error) {
    status.textContent = "Please select and copy the key code above.";
  }
});

const profileDialog = document.querySelector(".profile-dialog");
const profileForm = document.querySelector("#profile-form");
const profileCountry = document.querySelector("#profile-country");
const profileStatus = document.querySelector(".profile-status");
for (const country of countries) {
  const option = document.createElement("option");
  option.value = country.code;
  option.textContent = country.name;
  profileCountry.append(option);
}
document.querySelector(".user-profile").addEventListener("click", () => {
  if (!activeParticipant) return;
  document.querySelector("#profile-nickname").value = activeParticipant.nickname;
  document.querySelector("#profile-gender").value = activeParticipant.gender;
  document.querySelector("#profile-age").value = activeParticipant.age;
  profileCountry.value = activeParticipant.countryCode
    || countries.find(country => country.name === activeParticipant.country)?.code || "";
  profileStatus.hidden = true;
  profileDialog.showModal();
});
document.querySelector(".profile-close").addEventListener("click", () => profileDialog.close());
profileForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!activeParticipant || !profileForm.reportValidity()) return;
  const country = countries.find(country => country.code === profileCountry.value);
  let latestParticipant;
  try {
    latestParticipant = JSON.parse(localStorage.getItem(PARTICIPANT_STORAGE_KEY));
    if (!latestParticipant || latestParticipant.id !== activeParticipant.id) throw new Error("Participant changed");
  } catch (error) {
    profileStatus.textContent = "Your profile could not be read. Please refresh and try again.";
    profileStatus.hidden = false;
    return;
  }
  const updated = {
    ...latestParticipant,
    nickname: document.querySelector("#profile-nickname").value.trim(),
    gender: document.querySelector("#profile-gender").value,
    age: Number(document.querySelector("#profile-age").value),
    country: country?.name || "",
    countryCode: country?.code || "",
    updatedAt: new Date().toISOString()
  };
  if (!isValidParticipant(updated)) {
    profileStatus.textContent = "Please check your details and try again.";
    profileStatus.hidden = false;
    return;
  }
  try {
    localStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    profileStatus.textContent = "Your changes could not be saved. Please allow browser storage and try again.";
    profileStatus.hidden = false;
    return;
  }
  activeParticipant = updated;
  returningParticipant = updated;
  nicknameInput.value = updated.nickname;
  document.querySelector(".user-nickname").textContent = updated.nickname;
  document.querySelector(".user-profile").title = updated.nickname;
  window.DramifyCloud.changed();
  profileDialog.close();
});
