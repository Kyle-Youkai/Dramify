"use strict";

// Keep image and title together as one stimulus.
const dramas = [
  {
    "id": 1,
    "a": {
      "image": "图像资源/电视剧/1a.png",
      "title": "Hidden Daughter"
    },
    "b": {
      "image": "图像资源/电视剧/1b.png",
      "title": "Hidden Daughter Returns to a Family Full of Lies"
    }
  },
  {
    "id": 2,
    "a": {
      "image": "图像资源/电视剧/2a.png",
      "title": "Stolen Life"
    },
    "b": {
      "image": "图像资源/电视剧/2b.png",
      "title": "Stolen Life Reveals the Lie Behind Our Perfect Family"
    }
  },
  {
    "id": 3,
    "a": {
      "image": "图像资源/电视剧/3a.png",
      "title": "Broken Ties"
    },
    "b": {
      "image": "图像资源/电视剧/3b.png",
      "title": "Broken Ties Resurface as the Missing Son Returns"
    }
  },
  {
    "id": 4,
    "a": {
      "image": "图像资源/电视剧/4a.png",
      "title": "Silent Dynasty"
    },
    "b": {
      "image": "图像资源/电视剧/4b.png",
      "title": "Silent Dynasty Falls When the Missing Son Comes Home"
    }
  },
  {
    "id": 5,
    "a": {
      "image": "图像资源/电视剧/5a.png",
      "title": "Bloodlines"
    },
    "b": {
      "image": "图像资源/电视剧/5b.png",
      "title": "Bloodlines Fracture When the Will Names a Stranger"
    }
  },
  {
    "id": 6,
    "a": {
      "image": "图像资源/电视剧/6a.png",
      "title": "Home Truths"
    },
    "b": {
      "image": "图像资源/电视剧/6b.png",
      "title": "Home Truths Emerge as Our Mother Reveals Another Family"
    }
  },
  {
    "id": 7,
    "a": {
      "image": "图像资源/电视剧/7a.png",
      "title": "Behind Closed Doors"
    },
    "b": {
      "image": "图像资源/电视剧/7b.png",
      "title": "Behind Closed Doors, Every Promise Hides a Betrayal"
    }
  },
  {
    "id": 8,
    "a": {
      "image": "图像资源/电视剧/8a.png",
      "title": "Power Within"
    },
    "b": {
      "image": "图像资源/电视剧/8b.png",
      "title": "Power Within Keeps the Family’s Crime Buried"
    }
  },
  {
    "id": 9,
    "a": {
      "image": "图像资源/电视剧/9a.png",
      "title": "Deadly Manor"
    },
    "b": {
      "image": "图像资源/电视剧/9b.png",
      "title": "Deadly Manor Hides the Secrets My Family Buried"
    }
  },
  {
    "id": 10,
    "a": {
      "image": "图像资源/电视剧/10a.png",
      "title": "Price of Truth"
    },
    "b": {
      "image": "图像资源/电视剧/10b.png",
      "title": "The Price of Truth Changes Who We Call Family"
    }
  },
  {
    "id": 11,
    "a": {
      "image": "图像资源/电视剧/11a.png",
      "title": "Fatal Cover-Up"
    },
    "b": {
      "image": "图像资源/电视剧/11b.png",
      "title": "The Fatal Cover-Up Behind My Boyfriend’s Death"
    }
  },
  {
    "id": 12,
    "a": {
      "image": "图像资源/电视剧/12a.png",
      "title": "Shattered Trust"
    },
    "b": {
      "image": "图像资源/电视剧/12b.png",
      "title": "Shattered Trust Leads Me Back to My Husband’s Brother"
    }
  },
  {
    "id": 13,
    "a": {
      "image": "图像资源/电视剧/13a.png",
      "title": "Second Shift"
    },
    "b": {
      "image": "图像资源/电视剧/13b.png",
      "title": "Second Shift Brings Three Siblings Back Behind the Counter"
    }
  },
  {
    "id": 14,
    "a": {
      "image": "图像资源/电视剧/14a.png",
      "title": "Last Table"
    },
    "b": {
      "image": "图像资源/电视剧/14b.png",
      "title": "Last Table Brings Three Generations Back to the Diner"
    }
  },
  {
    "id": 15,
    "a": {
      "image": "图像资源/电视剧/15a.png",
      "title": "New House Rules"
    },
    "b": {
      "image": "图像资源/电视剧/15b.png",
      "title": "New House Rules Turn Our Blended Family Upside Down"
    }
  },
  {
    "id": 16,
    "a": {
      "image": "图像资源/电视剧/16a.png",
      "title": "Shared Custody"
    },
    "b": {
      "image": "图像资源/电视剧/16b.png",
      "title": "Shared Custody Puts Two Households Under One Roof"
    }
  }
];

function selectStimuli(condition) {
  return dramas.map(drama => {
    const version = (drama.id % 2 === 1) === (condition === "A") ? "a" : "b";
    return { id: drama.id, version, ...drama[version] };
  });
}

function shuffle(stimuli) {
  const result = [...stimuli];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function initializeDramify(participant) {
const condition = participant.condition;
const selectedStimuli = selectStimuli(condition);
const savedOrder = participant.dramaOrder;
const validOrder = Array.isArray(savedOrder) && savedOrder.length === dramas.length
  && new Set(savedOrder).size === dramas.length
  && savedOrder.every(id => Number.isInteger(id) && id >= 1 && id <= dramas.length);
let displayedDramas;
if (validOrder) {
  const stimuliById = new Map(selectedStimuli.map(drama => [drama.id, drama]));
  displayedDramas = savedOrder.map(id => stimuliById.get(id));
} else {
  displayedDramas = shuffle(selectedStimuli);
  const dramaOrder = displayedDramas.map(drama => drama.id);
  // Persist before rendering, including migration of older participant records.
  // A storage failure keeps the entry screen visible rather than showing an
  // order that would silently change on the next visit.
  localStorage.setItem("dramify.participant.v1", JSON.stringify({ ...participant, dramaOrder }));
  participant.dramaOrder = dramaOrder;
}
window.dramifyCondition = condition;
window.dramifyOrder = displayedDramas.map(drama => drama.id);
function validWallet(value) {
  return value && Number.isInteger(value.balance) && value.balance >= 0 && value.balance <= 100
    && Array.isArray(value.watchlist) && new Set(value.watchlist).size === value.watchlist.length
    && value.watchlist.every(id => Number.isInteger(id) && id >= 1 && id <= 16)
    && value.watchlist.length <= 5 && Array.isArray(value.transactions);
}
if (participant.wallet && !validWallet(participant.wallet)) throw new Error("Invalid wallet");
if (!participant.wallet) {
  const wallet = { policyVersion: 2, balance: 100, watchlist: [], transactions: [{ type: "registration", amount: 100, at: new Date().toISOString() }] };
  const latest = JSON.parse(localStorage.getItem("dramify.participant.v1") || "null") || participant;
  if (latest.id !== participant.id) throw new Error("Participant changed");
  localStorage.setItem("dramify.participant.v1", JSON.stringify({ ...latest, wallet }));
  participant.wallet = wallet;
}
// Reconcile records created by the earlier no-refund policy. The balance is
// always the 100-coin grant minus 20 for each currently active pre-order.
function reconcileWallet(value) {
  const balance = 100 - 20 * value.watchlist.length;
  const result = { ...value, policyVersion: 2, balance, transactions: [...value.transactions] };
  if (balance !== value.balance) result.transactions.push({type:"balance_correction",amount:balance - value.balance,at:new Date().toISOString()});
  return result;
}
const reconciledWallet = reconcileWallet(participant.wallet);
if (participant.wallet.policyVersion !== 2 || participant.wallet.balance !== reconciledWallet.balance) {
  const latest = JSON.parse(localStorage.getItem("dramify.participant.v1"));
  if (!latest || latest.id !== participant.id) throw new Error("Participant changed");
  localStorage.setItem("dramify.participant.v1", JSON.stringify({ ...latest, wallet: reconciledWallet }));
  participant.wallet = reconciledWallet;
}
let wallet = participant.wallet;
const watchlist = new Set(wallet.watchlist);
const interestRatings = new Map(displayedDramas.filter(drama => Number.isInteger(participant.dramaRatings?.[`${drama.id}${drama.version}`])).map(drama => [drama.id, participant.dramaRatings[`${drama.id}${drama.version}`]]));
const grid = document.querySelector(".drama-grid");
const search = document.querySelector("input[type=search]");
const filterButton = document.querySelector(".watchlist-filter");
const browseButton = document.querySelector(".browse-all");
let watchlistOnly = false;
let currentView = "home";
const historyButton = document.querySelector(".history-button");
const historyView = document.querySelector(".history-view");
const walletButton = document.querySelector(".wallet-button");
const walletView = document.querySelector(".wallet-view");
const walletNotice = document.querySelector(".wallet-notice");
const preorderDialog = document.querySelector(".preorder-only-dialog");
let pendingPreorder = null;
document.querySelector(".insufficient-coins-close").addEventListener("click", () => {
  document.querySelector(".insufficient-coins-dialog").close();
});
function requestPreorder(drama) {
  // Read the saved balance before opening a purchase confirmation.
  try {
    const latest = JSON.parse(localStorage.getItem("dramify.participant.v1"));
    if (!latest || latest.id !== participant.id || !validWallet(latest.wallet)) throw new Error("Invalid wallet");
    wallet = latest.wallet;
    watchlist.clear();
    wallet.watchlist.forEach(id => watchlist.add(id));
    updateWatchlistButtons();
    renderWallet();
  } catch (error) {
    showWalletNotice("Your balance could not be checked. Please refresh and try again.");
    return;
  }
  const selected = watchlist.has(drama.id);
  if (!selected && wallet.balance < 20) {
    pendingPreorder = null;
    document.querySelector(".insufficient-coins-dialog").showModal();
    return;
  }
  if (selected && currentView !== "watchlist") return;
  pendingPreorder = { drama, action: selected ? "cancel" : "add" };
  document.querySelector("#preorder-confirm-title").textContent = selected ? "Cancel pre-order?" : "Confirm pre-order";
  document.querySelector("#preorder-confirm-description").textContent = selected
    ? `Cancel your pre-order for “${drama.title}”? 20 coins will be returned to your wallet.`
    : `Confirm pre-order of “${drama.title}” for 20 coins?`;
  document.querySelector(".preorder-only-dialog .preorder-confirm").textContent = selected ? "Confirm cancellation" : "Confirm pre-order";
  document.querySelector(".preorder-dismiss").textContent = selected ? "Keep pre-order" : "Not now";
  preorderDialog.showModal();
}
document.querySelector(".preorder-dismiss").addEventListener("click", () => { pendingPreorder = null; preorderDialog.close(); });
preorderDialog.addEventListener("cancel", () => { pendingPreorder = null; });
document.querySelector(".preorder-only-dialog .preorder-confirm").addEventListener("click", () => {
  if (!pendingPreorder) return;
  const { drama, action } = pendingPreorder;
  pendingPreorder = null;
  preorderDialog.close();
  commitPreorder(drama, action);
});

function showWalletNotice(message) {
  walletNotice.textContent = message;
  walletNotice.hidden = false;
}
function renderWallet() {
  document.querySelector(".wallet-balance").textContent = String(wallet.balance);
  document.querySelector(".sidebar-balance").textContent = `${wallet.balance} coins`;
  const rows = wallet.transactions.map(transaction => {
    const row = document.createElement("div");
    row.className = "wallet-transaction";
    const label = document.createElement("span");
    label.textContent = transaction.type === "balance_correction" ? "Refund balance correction" : transaction.type === "registration" ? "Registration bonus"
      : `${transaction.type === "preorder_cancel" ? "Pre-order cancelled" : "Pre-ordered"}: ${displayedDramas.find(drama => drama.id === transaction.dramaId)?.title || "Drama"}`;
    const amount = document.createElement("strong");
    amount.textContent = `${transaction.amount > 0 ? "+" : ""}${transaction.amount} coins`;
    row.append(label, amount);
    return row;
  });
  document.querySelector(".wallet-transactions").replaceChildren(...rows);
}
function updateWatchlistButtons() {
  for (const card of grid.children) {
    const selected = watchlist.has(Number(card.dataset.id));
    const button = card.querySelector("button");
    button.setAttribute("aria-pressed", String(selected));
    button.textContent = selected ? (currentView === "watchlist" ? "Cancel pre-order" : "✓ Pre-ordered") : "Pre-order";
    button.disabled = selected && currentView !== "watchlist";
  }
}
function commitPreorder(drama, action) {
  try {
    const latest = JSON.parse(localStorage.getItem("dramify.participant.v1"));
    if (!latest || latest.id !== participant.id || !validWallet(latest.wallet)) throw new Error("Invalid record");
    const next = reconcileWallet(latest.wallet);
    next.watchlist = [...latest.wallet.watchlist];
    const existing = next.watchlist.indexOf(drama.id);
    if ((action === "add" && existing >= 0) || (action === "cancel" && existing < 0)) {
      wallet = latest.wallet;
      watchlist.clear();
      wallet.watchlist.forEach(id => watchlist.add(id));
      updateWatchlistButtons(); renderWallet(); applyFilters();
      showWalletNotice("This pre-order has already been updated. Your balance has not changed.");
      return;
    }
    if (action === "cancel") {
      if (currentView !== "watchlist") return;
      next.watchlist.splice(existing, 1);
      const refund = 20;
      next.balance += refund;
      next.transactions.push({type:"preorder_cancel", dramaId:drama.id, amount:refund, at:new Date().toISOString()});
    } else {
      if (next.balance < 20) {
        wallet = latest.wallet;
        watchlist.clear();
        wallet.watchlist.forEach(id => watchlist.add(id));
        updateWatchlistButtons();
        renderWallet();
        applyFilters();
        showWalletNotice("Not enough coins. You need 20 coins to pre-order a drama.");
        return;
      }
      next.balance -= 20;
      next.watchlist.push(drama.id);
      next.transactions.push({ type: "preorder_add", dramaId: drama.id, amount: -20, at: new Date().toISOString() });
    }
    localStorage.setItem("dramify.participant.v1", JSON.stringify({ ...latest, wallet: next }));
    window.DramifyCloud.changed();
    wallet = next;
    watchlist.clear();
    wallet.watchlist.forEach(id => watchlist.add(id));
    updateWatchlistButtons();
    renderWallet();
    walletNotice.hidden = true;
    applyFilters();
  } catch (error) {
    showWalletNotice("Your change could not be saved. Please allow browser storage and try again. No coins were deducted.");
  }
}

function applyFilters() {
  if (currentView === "history" || currentView === "wallet") {
    document.querySelector(".empty-message").hidden = true;
    return;
  }
  const query = search.value.trim().toLowerCase();
  let visibleCount = 0;
  for (const card of grid.children) {
    const visible = card.querySelector("h2").textContent.toLowerCase().includes(query)
      && (!watchlistOnly || watchlist.has(Number(card.dataset.id)));
    card.hidden = !visible;
    if (visible) visibleCount++;
  }
  const emptyMessage = document.querySelector(".empty-message");
  emptyMessage.hidden = visibleCount !== 0;
  emptyMessage.textContent = watchlistOnly && watchlist.size === 0
    ? "Your watchlist is empty. Add a drama from Dramify."
    : "No dramas found.";
}

function renderCard(drama) {
  const card = document.createElement("article");
  card.className = "drama-card";
  card.dataset.id = drama.id;
  card.dataset.version = drama.version;
  const artwork = document.createElement("div");
  artwork.className = "artwork";
  const image = document.createElement("img");
  image.src = drama.image;
  image.alt = drama.title;
  image.decoding = "async";
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = "NEW";
  artwork.append(image, badge);
  const title = document.createElement("h2");
  title.className = "drama-title";
  title.id = `drama-${drama.id}`;
  title.textContent = drama.title;
  card.setAttribute("aria-labelledby", title.id);
  const button = document.createElement("button");
  button.className = "card-watchlist";
  button.type = "button";
  const selected = watchlist.has(drama.id);
  button.textContent = selected ? "✓ Pre-ordered" : "Pre-order";
  button.disabled = selected;
  button.setAttribute("aria-pressed", String(selected));
  button.addEventListener("click", () => requestPreorder(drama));
  const rating = document.createElement("div");
  rating.className = "interest-rating";
  const ratingLabel = document.createElement("span");
  ratingLabel.className = "rating-label";
  ratingLabel.textContent = "Want to watch";
  const stars = document.createElement("div");
  stars.className = "rating-stars";
  stars.setAttribute("role", "group");
  stars.setAttribute("aria-label", `Want to watch: ${drama.title}`);
  const status = document.createElement("span");
  status.className = "rating-status";
  status.textContent = "Not rated";
  status.setAttribute("aria-live", "polite");
  function paintStars(value) {
    for (let i = 0; i < stars.children.length; i++) {
      stars.children[i].dataset.filled = String(i < value);
    }
  }
  for (let value = 1; value <= 5; value++) {
    const star = document.createElement("button");
    star.type = "button";
    star.className = "rating-star";
    star.textContent = "★";
    star.dataset.filled = "false";
    star.setAttribute("aria-label", `${value} out of 5 stars`);
    star.setAttribute("aria-pressed", "false");
    star.title = `${value} out of 5 — click again to clear`;
    star.addEventListener("mouseenter", () => paintStars(value));
    star.addEventListener("focus", () => paintStars(value));
    star.addEventListener("blur", () => paintStars(interestRatings.get(drama.id) || 0));
    star.addEventListener("click", () => {
      const next = interestRatings.get(drama.id) === value ? 0 : value;
      try {
        const latest = JSON.parse(localStorage.getItem("dramify.participant.v1"));
        if (!latest || latest.id !== participant.id) throw new Error("Participant changed");
        const ratings = { ...latest.dramaRatings };
        if (next) ratings[`${drama.id}${drama.version}`] = next;
        else delete ratings[`${drama.id}${drama.version}`];
        localStorage.setItem("dramify.participant.v1", JSON.stringify({ ...latest, dramaRatings: ratings }));
        window.DramifyCloud.changed();
      } catch (error) {
        showWalletNotice("Your rating could not be saved. Please try again.");
        return;
      }
      if (next) interestRatings.set(drama.id, next);
      else interestRatings.delete(drama.id);
      paintStars(next);
      for (let i = 0; i < stars.children.length; i++) {
        stars.children[i].setAttribute("aria-pressed", String(i + 1 === next));
      }
      status.textContent = next ? `${next} / 5` : "Not rated";
    });
    stars.append(star);
  }
  const savedRating = interestRatings.get(drama.id) || 0;
  paintStars(savedRating);
  for (let i = 0; i < stars.children.length; i++) stars.children[i].setAttribute("aria-pressed", String(i + 1 === savedRating));
  status.textContent = savedRating ? `${savedRating} / 5` : "Not rated";
  stars.addEventListener("mouseleave", () => paintStars(interestRatings.get(drama.id) || 0));
  rating.append(ratingLabel, stars, status);
  card.append(artwork, title, button, rating);
  return card;
}

grid.replaceChildren(...displayedDramas.map(renderCard));
search.addEventListener("input", applyFilters);
renderWallet();
updateWatchlistButtons();
function setView(view) {
  currentView = view;
  watchlistOnly = view === "watchlist";
  historyButton.setAttribute("aria-pressed", String(view === "history"));
  walletButton.setAttribute("aria-pressed", String(view === "wallet"));
  filterButton.setAttribute("aria-pressed", String(watchlistOnly));
  browseButton.setAttribute("aria-pressed", String(view === "home"));
  historyView.hidden = view !== "history";
  walletView.hidden = view !== "wallet";
  grid.hidden = view === "history" || view === "wallet";
  grid.className = watchlistOnly ? "drama-grid watchlist-view" : "drama-grid";
  const headings = {home:"",watchlist:"My Watchlist",history:"Browsing History",wallet:"Wallet"};
  document.querySelector("main h1").textContent = headings[view];
  grid.setAttribute("aria-label", watchlistOnly ? "My Watchlist" : "New dramas");
  walletNotice.hidden = true;
  document.querySelector(".upcoming-banner").hidden = view !== "home";
  document.querySelector(".section-heading").hidden = view === "home";
  updateWatchlistButtons();
  applyFilters();
}
filterButton.addEventListener("click", () => setView("watchlist"));
browseButton.addEventListener("click", () => setView("home"));
historyButton.addEventListener("click", () => setView("history"));
walletButton.addEventListener("click", () => setView("wallet"));
}
