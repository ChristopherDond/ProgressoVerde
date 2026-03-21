const DB_NAME = "green-habits-db";
const DB_VERSION = 1;

const defaultHabits = [
  {
    id: "reuse-bottle",
    name: "Levar garrafa reutilizavel",
    co2: 0.5,
    water: 15,
    waste: 0.2,
    points: 10,
  },
  {
    id: "recycle",
    name: "Separar reciclaveis",
    co2: 0.7,
    water: 5,
    waste: 0.4,
    points: 12,
  },
  {
    id: "public-transport",
    name: "Usar transporte sustentavel",
    co2: 2.4,
    water: 0,
    waste: 0.1,
    points: 18,
  },
  {
    id: "save-energy",
    name: "Economizar energia em casa",
    co2: 1.2,
    water: 0,
    waste: 0,
    points: 14,
  },
  {
    id: "plant-meal",
    name: "Refeicao sem carne",
    co2: 1.5,
    water: 50,
    waste: 0.1,
    points: 16,
  },
];

const badgeDefinitions = [
  {
    id: "first-step",
    title: "Primeiro passo",
    description: "Complete 1 habito verde.",
    criteria: (stats) => stats.totalEntries >= 1,
    progress: (stats) => `${Math.min(stats.totalEntries, 1)}/1`,
  },
  {
    id: "week-warrior",
    title: "Eco consistente",
    description: "Complete 7 habitos.",
    criteria: (stats) => stats.totalEntries >= 7,
    progress: (stats) => `${Math.min(stats.totalEntries, 7)}/7`,
  },
  {
    id: "streak-3",
    title: "Sequencia verde",
    description: "Manter 3 dias seguidos.",
    criteria: (stats) => stats.streak >= 3,
    progress: (stats) => `${Math.min(stats.streak, 3)}/3`,
  },
  {
    id: "co2-hero",
    title: "Heroi do CO2",
    description: "Evite 20kg de CO2.",
    criteria: (stats) => stats.co2 >= 20,
    progress: (stats) => `${Math.min(stats.co2, 20).toFixed(1)}/20`,
  },
  {
    id: "water-guardian",
    title: "Guardiao da agua",
    description: "Economize 300L de agua.",
    criteria: (stats) => stats.water >= 300,
    progress: (stats) => `${Math.min(stats.water, 300).toFixed(0)}/300`,
  },
  {
    id: "waste-zero",
    title: "Rumo ao zero",
    description: "Evite 5kg de residuos.",
    criteria: (stats) => stats.waste >= 5,
    progress: (stats) => `${Math.min(stats.waste, 5).toFixed(1)}/5`,
  },
];

const elements = {
  totalPoints: document.getElementById("totalPoints"),
  levelLabel: document.getElementById("levelLabel"),
  levelProgress: document.getElementById("levelProgress"),
  levelRing: document.getElementById("levelRing"),
  co2Total: document.getElementById("co2Total"),
  waterTotal: document.getElementById("waterTotal"),
  wasteTotal: document.getElementById("wasteTotal"),
  habitList: document.getElementById("habitList"),
  badgesGrid: document.getElementById("badgesGrid"),
  weeklyChart: document.getElementById("weeklyChart"),
  todayLabel: document.getElementById("todayLabel"),
  habitForm: document.getElementById("habitForm"),
  status: document.getElementById("status"),
};

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateString(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

function toNumber(value) {
  return Number.isFinite(value) ? value : 0;
}

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.style.color = isError ? "#ffb4b4" : "";
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("habits")) {
        db.createObjectStore("habits", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("entries")) {
        const entries = db.createObjectStore("entries", {
          keyPath: "id",
          autoIncrement: true,
        });
        entries.createIndex("byDate", "date", { unique: false });
        entries.createIndex("byHabitDate", ["habitId", "date"], {
          unique: true,
        });
      }
      if (!db.objectStoreNames.contains("badges")) {
        db.createObjectStore("badges", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function getAll(db, storeName) {
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const data = await requestPromise(store.getAll());
  await transactionPromise(tx);
  return data;
}

async function seedDefaultHabits(db) {
  const tx = db.transaction("habits", "readwrite");
  const store = tx.objectStore("habits");
  const count = await requestPromise(store.count());
  if (count === 0) {
    defaultHabits.forEach((habit) => store.add(habit));
  }
  await transactionPromise(tx);
}

function createId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `habit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function buildStats(habits, entries, today) {
  const habitMap = new Map(habits.map((habit) => [habit.id, habit]));
  let totalPoints = 0;
  let co2 = 0;
  let water = 0;
  let waste = 0;

  const entriesByDate = new Map();
  entries.forEach((entry) => {
    const habit = habitMap.get(entry.habitId);
    if (!habit) return;
    totalPoints += toNumber(habit.points);
    co2 += toNumber(habit.co2);
    water += toNumber(habit.water);
    waste += toNumber(habit.waste);

    if (!entriesByDate.has(entry.date)) {
      entriesByDate.set(entry.date, []);
    }
    entriesByDate.get(entry.date).push(entry);
  });

  const todayEntries = entriesByDate.get(today) || [];

  let streak = 0;
  const cursor = parseDateString(today);
  while (true) {
    const cursorKey = formatDate(cursor);
    if (entriesByDate.has(cursorKey)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    totalPoints,
    co2,
    water,
    waste,
    totalEntries: entries.length,
    todayEntries,
    entriesByDate,
    streak,
  };
}

function updateHeader(stats) {
  elements.totalPoints.textContent = stats.totalPoints.toFixed(0);
  const level = Math.max(1, Math.floor(stats.totalPoints / 100) + 1);
  const progress = stats.totalPoints % 100;
  const progressPercent = Math.min(100, Math.round((progress / 100) * 100));
  elements.levelLabel.textContent = `Nivel ${level}`;
  elements.levelProgress.textContent = `${progressPercent}%`;
  elements.levelRing.style.setProperty("--progress", progressPercent);
}

function updateImpact(stats) {
  elements.co2Total.textContent = stats.co2.toFixed(1);
  elements.waterTotal.textContent = stats.water.toFixed(0);
  elements.wasteTotal.textContent = stats.waste.toFixed(1);
}

async function toggleHabit(db, habitId, isChecked, today) {
  const tx = db.transaction("entries", "readwrite");
  const store = tx.objectStore("entries");
  const index = store.index("byHabitDate");
  const existing = await requestPromise(index.get([habitId, today]));
  if (isChecked && !existing) {
    store.add({ habitId, date: today });
  }
  if (!isChecked && existing) {
    store.delete(existing.id);
  }
  await transactionPromise(tx);
}

function renderHabits(db, habits, stats, today) {
  elements.habitList.innerHTML = "";
  const todayMap = new Map(stats.todayEntries.map((entry) => [entry.habitId, entry]));

  habits.forEach((habit) => {
    const item = document.createElement("li");
    item.className = "habit-item";

    const info = document.createElement("div");
    info.className = "habit-info";
    const title = document.createElement("h3");
    title.textContent = habit.name;
    const meta = document.createElement("p");
    meta.textContent = `${habit.points} pts | ${habit.co2}kg CO2 | ${habit.water}L agua`;
    info.appendChild(title);
    info.appendChild(meta);

    const toggleWrapper = document.createElement("label");
    toggleWrapper.className = "habit-toggle";
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = todayMap.has(habit.id);
    toggle.setAttribute("aria-label", `Marcar ${habit.name} como feito`);
    const label = document.createElement("span");
    label.textContent = toggle.checked ? "Concluido" : "Pendente";
    toggleWrapper.appendChild(toggle);
    toggleWrapper.appendChild(label);

    toggle.addEventListener("change", async () => {
      toggle.disabled = true;
      try {
        await toggleHabit(db, habit.id, toggle.checked, today);
        await refresh(db);
      } catch (error) {
        console.error(error);
        setStatus("Nao foi possivel atualizar o habito.", true);
        toggle.checked = !toggle.checked;
      } finally {
        toggle.disabled = false;
      }
    });

    item.appendChild(info);
    item.appendChild(toggleWrapper);
    elements.habitList.appendChild(item);
  });
}

async function syncBadges(db, stats) {
  const current = await getAll(db, "badges");
  const earnedMap = new Map(current.map((badge) => [badge.id, badge]));
  const newlyEarned = badgeDefinitions.filter(
    (badge) => badge.criteria(stats) && !earnedMap.has(badge.id)
  );

  if (newlyEarned.length === 0) {
    return earnedMap;
  }

  const tx = db.transaction("badges", "readwrite");
  const store = tx.objectStore("badges");
  newlyEarned.forEach((badge) => {
    store.add({ id: badge.id, earnedAt: new Date().toISOString() });
  });
  await transactionPromise(tx);

  const updated = await getAll(db, "badges");
  return new Map(updated.map((badge) => [badge.id, badge]));
}

function renderBadges(earnedMap, stats) {
  elements.badgesGrid.innerHTML = "";
  badgeDefinitions.forEach((badge) => {
    const card = document.createElement("div");
    card.className = "badge-card";
    const earned = earnedMap.has(badge.id);
    if (!earned) {
      card.classList.add("locked");
    }
    const title = document.createElement("p");
    title.className = "badge-title";
    title.textContent = badge.title;
    const description = document.createElement("p");
    description.textContent = badge.description;
    const meta = document.createElement("p");
    meta.className = "badge-meta";
    meta.textContent = earned
      ? "Desbloqueado"
      : `Progresso: ${badge.progress(stats)}`;

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(meta);
    elements.badgesGrid.appendChild(card);
  });
}

function renderWeekly(entriesByDate, today) {
  elements.weeklyChart.innerHTML = "";
  const data = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = parseDateString(today);
    date.setDate(date.getDate() - i);
    const key = formatDate(date);
    const count = entriesByDate.get(key)?.length || 0;
    data.push({ label: dayLabels[date.getDay()], count });
  }

  const max = Math.max(1, ...data.map((item) => item.count));
  const maxHeight = 110;

  data.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "grid";
    wrapper.style.gap = "6px";
    wrapper.style.alignItems = "end";
    const bar = document.createElement("div");
    bar.className = "bar";
    const height = Math.max(14, Math.round((item.count / max) * maxHeight));
    bar.style.height = `${height}px`;
    bar.textContent = item.count;
    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = item.label;
    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    elements.weeklyChart.appendChild(wrapper);
  });
}

function updateTodayLabel(today) {
  elements.todayLabel.textContent = `Hoje, ${formatDisplayDate(
    parseDateString(today)
  )}`;
}

async function refresh(db) {
  const [habits, entries] = await Promise.all([
    getAll(db, "habits"),
    getAll(db, "entries"),
  ]);
  const today = formatDate(new Date());
  const stats = buildStats(habits, entries, today);
  const earnedMap = await syncBadges(db, stats);

  updateHeader(stats);
  updateImpact(stats);
  updateTodayLabel(today);
  renderHabits(db, habits, stats, today);
  renderBadges(earnedMap, stats);
  renderWeekly(stats.entriesByDate, today);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  navigator.serviceWorker
    .register("sw.js")
    .catch((error) => console.error("SW failed", error));
}

async function init() {
  if (!("indexedDB" in window)) {
    setStatus("IndexedDB nao esta disponivel neste navegador.", true);
    return;
  }
  try {
    const db = await openDB();
    await seedDefaultHabits(db);
    await refresh(db);
    registerServiceWorker();
  } catch (error) {
    console.error(error);
    setStatus("Falha ao iniciar o app.", true);
  }
}

elements.habitForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const habit = {
    id: createId(),
    name: String(data.get("name")).trim(),
    co2: Number(data.get("co2")) || 0,
    water: Number(data.get("water")) || 0,
    waste: Number(data.get("waste")) || 0,
    points: Math.max(1, Number(data.get("points")) || 1),
  };

  if (!habit.name) {
    setStatus("Informe um nome para o habito.", true);
    return;
  }

  try {
    const db = await openDB();
    const tx = db.transaction("habits", "readwrite");
    tx.objectStore("habits").add(habit);
    await transactionPromise(tx);
    form.reset();
    setStatus("Habito adicionado com sucesso.");
    await refresh(db);
  } catch (error) {
    console.error(error);
    setStatus("Nao foi possivel adicionar o habito.", true);
  }
});

init();
