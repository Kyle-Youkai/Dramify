"use strict";

// The participant record and assignment are saved together in one local write.
// Assignment comes from the access code; the saved drama order is preserved.
const PARTICIPANT_STORAGE_KEY = "dramify.participant.v1";
const participantForm = document.querySelector("#enrollment-form");
const enrollmentError = document.querySelector("#enrollment-error");
let siteStarted = false;
let siteStarting = false;
let activeParticipant = null;
let stayTimerFrame = null;

function formatStayDuration(seconds) {
  const ms = Math.max(0, Math.floor(seconds * 1000));
  return `${String(Math.floor(ms / 3600000)).padStart(2,"0")}:${String(Math.floor(ms / 60000) % 60).padStart(2,"0")}:${String(Math.floor(ms / 1000) % 60).padStart(2,"0")}.${String(ms % 1000).padStart(3,"0")}`;
}
let enrollmentStep = 1;
let returningParticipant = null;
const ACCESS_SESSION_KEY = "dramify.access.v1";
const COMPLETION_SESSION_KEY = "dramify.completed.v1";
const accessCodeInput = document.querySelector("#access-code");
const accessCodes = window.DRAMIFY_CONFIG.accessCodes;

function hasValidAccessCode() {
  if (!/^[0-9]{4}$/.test(accessCodeInput.value) || !Object.hasOwn(accessCodes, accessCodeInput.value)) {
    showEnrollmentError("That access code is incorrect. Please enter the 4-digit code provided to you.");
    accessCodeInput.focus();
    return false;
  }
  return true;
}
const nicknameInput = document.querySelector("#participant-nickname");
const workerIdInput = document.querySelector("#participant-worker-id");
function hasValidWorkerId() {
  if (!workerIdInput.reportValidity() || !/^[A-Za-z0-9]{1,64}$/.test(workerIdInput.value.trim())) {
    showEnrollmentError("Please enter a valid MTurk Worker ID using letters and numbers.");
    workerIdInput.focus();
    return false;
  }
  return true;
}
function showEnrollmentStep(step) {
  enrollmentStep = step;
  document.querySelector("#access-step").hidden = step !== 1;
  document.querySelector("#access-step").disabled = step !== 1;
  document.querySelector("#details-step").hidden = step !== 2;
  document.querySelector("#details-step").disabled = step !== 2;
  document.querySelector("#enrollment-step").textContent = String(step);
  const heading = document.querySelector("#welcome-title");
  heading.textContent = step === 1 ? "Before you begin" : "A little about you";
  document.querySelector(".enrollment-intro").textContent = step === 1
    ? "Please enter your MTurk Worker ID and access code to continue."
    : "Help us get to know you so we can recommend dramas that suit you.";
  document.querySelector("#enrollment-back").hidden = step === 1;
  document.querySelector(".enrollment-submit").textContent = step === 1 ? "Confirm" : "Start exploring →";
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

async function enterDramify(participant, code) {
  if (siteStarted || siteStarting) return;
  siteStarting = true;
  const button = document.querySelector(".enrollment-submit");
  const label = button.textContent;
  button.disabled = true;
  button.textContent = "Loading…";
  try {
    await window.DramifyContent.load(dramas);
    showDramify(participant, code);
  } catch (error) {
    showEnrollmentError(location.protocol === "file:"
      ? "Please open this website using 启动网站.command in the Dramify folder, then try again."
      : "We could not load the drama content. Please check the Excel file and your connection, then try again.");
    console.warn("Dramify content:", error.message);
  } finally {
    siteStarting = false;
    button.disabled = false;
    button.textContent = label;
  }
}

function showDramify(participant, code) {
  if (siteStarted) return;
  try {
    sessionStorage.setItem(ACCESS_SESSION_KEY, JSON.stringify({ participantId: participant.id, code, accessVersion: 3, workerId:participant.mturkWorkerId }));
  } catch (error) {
    showEnrollmentError("Please allow browser storage to continue.");
    return;
  }
  participant.accessCode ||= code;
  localStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify(participant));
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
  const stayTimer = document.querySelector(".stay-timer");
  stayTimer.hidden = !["2006", "2008"].includes(participant.accessCode);
  if (!stayTimer.hidden) {
    const timerValue = document.querySelector(".stay-timer-value");
    const updateStayTimer = () => {
      if (!activeParticipant) return;
      timerValue.textContent = formatStayDuration(window.DramifyCloud.getDurationSeconds());
      stayTimerFrame = requestAnimationFrame(updateStayTimer);
    };
    updateStayTimer();
  }
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
      workerIdInput.value = participant.mturkWorkerId || "";
      document.querySelector("#participant-gender").value = ({woman:"female",man:"male"})[participant.gender] || participant.gender;
      document.querySelector("#participant-age").value = participant.age;
      document.querySelector("#participant-country").value = participant.country;
      // A changed configured code invalidates the previous browser session.
      let access = null;
      try { access = JSON.parse(sessionStorage.getItem(ACCESS_SESSION_KEY) || "null"); } catch (error) { /* Show the code entry again. */ }
      if (access && participant.mturkWorkerId && access.participantId === participant.id && access.accessVersion === 3 && access.workerId === participant.mturkWorkerId && accessCodes[access.code] === participant.condition && (!participant.accessCode || participant.accessCode === access.code)) enterDramify(participant, access.code);
    }
    else showEnrollmentError("Your saved details could not be restored. Please complete the form again.");
  }
} catch (error) {
  showEnrollmentError("Your saved details could not be read. Please allow browser storage to keep your details when you return.");
}

participantForm.addEventListener("submit", event => {
  event.preventDefault();
  if (siteStarted || siteStarting) return;
  if (enrollmentStep === 1) {
    if (!hasValidWorkerId()) return;
    if (!hasValidAccessCode()) return;
    if (returningParticipant) {
      if ((returningParticipant.mturkWorkerId && returningParticipant.mturkWorkerId !== workerIdInput.value.trim()) || (returningParticipant.accessCode && returningParticipant.accessCode !== accessCodeInput.value) || returningParticipant.condition !== accessCodes[accessCodeInput.value]) {
        showEnrollmentError("Please use the Worker ID and access code for your saved session, or start in a new private window.");
        return;
      }
    }
    showEnrollmentStep(2);
    return;
  }
  if (!participantForm.reportValidity() || !hasValidAccessCode() || !hasValidWorkerId()) return;
  const data = new FormData(participantForm);
  const nickname = String(data.get("nickname") || "").trim();
  const country = String(data.get("country") || "").trim();
  if (!nickname || !country) {
    showEnrollmentError("Please enter your nickname and country.");
    return;
  }
  const participant = {
    schemaVersion: 1,
    ...(returningParticipant || {}),
    id: returningParticipant?.id || crypto.randomUUID(),
    nickname,
    gender: String(data.get("gender")),
    age: Number(data.get("age")),
    country,
    mturkWorkerId: workerIdInput.value.trim(),
    createdAt: returningParticipant?.createdAt || new Date().toISOString(),
    accessCode: returningParticipant?.accessCode || accessCodeInput.value,
    condition: accessCodes[accessCodeInput.value]
  };
  delete participant.job;
  if (!isValidParticipant(participant)) {
    showEnrollmentError("Please check your details and try again.");
    return;
  }
  try {
    localStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify(participant));
    returningParticipant = participant;
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
function canFinishExperience() {
  const message = document.querySelector(".signout-error");
  try {
    const record = JSON.parse(localStorage.getItem(PARTICIPANT_STORAGE_KEY) || "null");
    if (!record || record.id !== activeParticipant?.id) throw new Error("Participant changed");
    if (record.wallet?.balance === 0) return true;
    message.textContent = `Please use all your coins before finishing. You have ${record.wallet?.balance ?? "remaining"} coins left.`;
  } catch (error) {
    message.textContent = "Your wallet could not be checked. Please refresh and try again.";
  }
  message.hidden = false;
  return false;
}
document.querySelector(".sign-out").addEventListener("click", () => {
  if (!activeParticipant) return;
  document.querySelector(".signout-error").hidden = true;
  document.querySelector(".signout-confirm").disabled = !canFinishExperience();
  signoutDialog.showModal();
});
document.querySelector(".signout-dismiss").addEventListener("click", () => signoutDialog.close());
document.querySelector(".signout-confirm").addEventListener("click", async () => {
  if (!activeParticipant) return;
  const confirmButton = document.querySelector(".signout-confirm");
  if (confirmButton.disabled) return;
  if (!canFinishExperience()) return;
  confirmButton.disabled = true;
  confirmButton.textContent = "Saving…";
  try {
    await window.DramifyCloud.complete();
  } catch (error) {
    const message = document.querySelector(".signout-error");
    message.textContent = "Your responses have not synced yet. Please check your connection and try again. Your data is still saved on this device.";
    message.hidden = false;
    confirmButton.disabled = false;
    confirmButton.textContent = "Confirm";
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
    confirmButton.textContent = "Confirm";
    return;
  }
  if (stayTimerFrame !== null) cancelAnimationFrame(stayTimerFrame);
  stayTimerFrame = null;
  await window.DramifyCloud.clearSession();
  activeParticipant = null;
  returningParticipant = null;
  signoutDialog.close();
  if (feedbackDialog.open) feedbackDialog.close();
  const profileModal = document.querySelector(".profile-dialog");
  if (profileModal.open) profileModal.close();
  window.history.replaceState(null, "", window.location.pathname + window.location.search + "#home");
  showCompletionScreen();
});

document.querySelector(".copy-key-code").addEventListener("click", async () => {
  const status = document.querySelector(".copy-code-status");
  try {
    await navigator.clipboard.writeText(window.DRAMIFY_CONFIG.completionCode);
    status.textContent = "Finish Code copied.";
  } catch (error) {
    status.textContent = "Please select and copy the Finish Code above.";
  }
});

const profileDialog = document.querySelector(".profile-dialog");
const profileForm = document.querySelector("#profile-form");
const profileCountry = document.querySelector("#profile-country");
const profileStatus = document.querySelector(".profile-status");
document.querySelector(".user-profile").addEventListener("click", () => {
  if (!activeParticipant) return;
  document.querySelector("#profile-nickname").value = activeParticipant.nickname;
  document.querySelector("#profile-gender").value = ({woman:"female", man:"male"})[activeParticipant.gender] || activeParticipant.gender;
  document.querySelector("#profile-age").value = activeParticipant.age;
  profileCountry.value = activeParticipant.country || "";
  document.querySelector("#profile-worker-id").value = activeParticipant.mturkWorkerId || "";
  profileStatus.hidden = true;
  profileDialog.showModal();
});
document.querySelector(".profile-close").addEventListener("click", () => profileDialog.close());
profileForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!activeParticipant || !profileForm.reportValidity()) return;
  const country = profileCountry.value.trim();
  if (!country) {
    profileStatus.textContent = "Please enter your country.";
    profileStatus.hidden = false;
    return;
  }
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
    country,
    countryCode: "",
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
