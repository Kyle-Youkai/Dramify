"use strict";

// The participant record and assignment are saved together in one local write.
// A returning participant's saved condition takes precedence over URL overrides.
const PARTICIPANT_STORAGE_KEY = "dramify.participant.v1";
const participantForm = document.querySelector("#enrollment-form");
const enrollmentError = document.querySelector("#enrollment-error");
let siteStarted = false;
let activeParticipant = null;
let enrollmentStep = 1;
let returningParticipant = null;
const ACCESS_SESSION_KEY = "dramify.access.v1";
const accessCodeInput = document.querySelector("#access-code");
const currentAccessCode = window.DRAMIFY_CONFIG.accessCode;

function hasValidAccessCode() {
  if (!/^[0-9]{8}$/.test(accessCodeInput.value) || accessCodeInput.value !== currentAccessCode) {
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
  document.querySelector("#nickname-step").hidden = step !== 1;
  document.querySelector("#details-step").hidden = step !== 2;
  document.querySelector("#details-step").disabled = step !== 2;
  document.querySelector("#enrollment-step").textContent = String(step);
  const heading = document.querySelector("#welcome-title");
  heading.textContent = step === 1 ? "What should we call you?" : "A little about you";
  document.querySelector(".enrollment-intro").textContent = step === 1
    ? "Choose a nickname to make Dramify feel like home."
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

function enterDramify(participant) {
  if (siteStarted) return;
  try {
    sessionStorage.setItem(ACCESS_SESSION_KEY, JSON.stringify({ participantId: participant.id, code: currentAccessCode }));
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
    showEnrollmentError("We could not save your drama order. Please allow browser storage and try again.");
    return;
  }
  siteStarted = true;
  document.querySelector(".enrollment").hidden = true;
  document.querySelector("#dramify-app").hidden = false;
  document.body.classList.remove("enrolling");
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
      document.querySelector("#welcome-title").textContent = "Welcome back";
      document.querySelector(".enrollment-intro").textContent = "Enter your access code to return to Dramify.";
      document.querySelector(".enrollment-progress").hidden = true;
      document.querySelector(".enrollment-submit").textContent = "Continue to Dramify →";
      // A changed configured code invalidates the previous browser session.
      let access = null;
      try { access = JSON.parse(sessionStorage.getItem(ACCESS_SESSION_KEY) || "null"); } catch (error) { /* Show the code entry again. */ }
      if (access && access.participantId === participant.id && access.code === currentAccessCode) enterDramify(participant);
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
      enterDramify(returningParticipant);
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
    condition: assignCondition()
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
  enterDramify(participant);
});


const feedbackDialog = document.querySelector(".feedback-dialog");
const feedbackForm = document.querySelector("#feedback-form");
const feedbackText = document.querySelector("#feedback-text");
const feedbackStatus = document.querySelector(".feedback-status");
document.querySelector(".feedback-open").addEventListener("click", () => {
  feedbackStatus.hidden = true;
  feedbackDialog.showModal();
});
document.querySelector(".feedback-close").addEventListener("click", () => feedbackDialog.close());
feedbackForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!activeParticipant || !feedbackForm.reportValidity()) return;
  const text = feedbackText.value.trim();
  if (!text) {
    feedbackStatus.textContent = "Please write your feedback before saving.";
    feedbackStatus.hidden = false;
    return;
  }
  try {
    const key = "dramify.feedback.v1";
    const entries = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(entries)) throw new Error("Invalid feedback records");
    entries.push({ id: crypto.randomUUID(), participantId: activeParticipant.id, condition: activeParticipant.condition, text, createdAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(entries));
    feedbackText.value = "";
    feedbackStatus.textContent = "Thank you! Your feedback has been saved.";
  } catch (error) {
    feedbackStatus.textContent = "Your feedback could not be saved. Please allow browser storage and try again.";
  }
  feedbackStatus.hidden = false;
});


// Sign out ends access, but preserves the participant record and fixed condition.
document.querySelector(".sign-out").addEventListener("click", () => {
  try {
    sessionStorage.removeItem(ACCESS_SESSION_KEY);
  } catch (error) {
    // Even if storage is unavailable, hide the current application immediately.
  }
  document.querySelector("#dramify-app").hidden = true;
  document.querySelector(".enrollment").hidden = false;
  document.body.classList.add("enrolling");
  window.location.reload();
});
