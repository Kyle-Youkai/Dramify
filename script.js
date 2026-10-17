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

function assignCondition() {
  const requested = new URLSearchParams(window.location.search).get("condition");
  return requested === "A" || requested === "B" ? requested : Math.random() < 0.5 ? "A" : "B";
}

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
const watchlist = new Set();
const interestRatings = new Map();
const grid = document.querySelector(".drama-grid");
const search = document.querySelector("input[type=search]");
const filterButton = document.querySelector(".watchlist-filter");
const browseButton = document.querySelector(".browse-all");
let watchlistOnly = false;

function applyFilters() {
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
    ? "Your watchlist is empty. Add a drama from Home."
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
  button.textContent = "+ My Watchlist";
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    if (watchlist.has(drama.id)) watchlist.delete(drama.id);
    else watchlist.add(drama.id);
    const selected = watchlist.has(drama.id);
    button.setAttribute("aria-pressed", String(selected));
    button.textContent = selected ? "✓ In My Watchlist" : "+ My Watchlist";
    applyFilters();
  });
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
  stars.addEventListener("mouseleave", () => paintStars(interestRatings.get(drama.id) || 0));
  rating.append(ratingLabel, stars, status);
  card.append(artwork, title, button, rating);
  return card;
}

grid.replaceChildren(...displayedDramas.map(renderCard));
search.addEventListener("input", applyFilters);
function setWatchlistView(selected) {
  watchlistOnly = selected;
  document.querySelector(".home-banner").hidden = selected;
  grid.className = selected ? "drama-grid watchlist-view" : "drama-grid";
  filterButton.setAttribute("aria-pressed", String(selected));
  browseButton.setAttribute("aria-pressed", String(!selected));
  document.querySelector("main h1").textContent = selected ? "My Watchlist" : "New On Dramify";
  grid.setAttribute("aria-label", selected ? "My Watchlist" : "New dramas");
  applyFilters();
}

filterButton.addEventListener("click", () => setWatchlistView(true));
browseButton.addEventListener("click", () => setWatchlistView(false));

}
