import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./src/AuthContext.jsx";
import { AuthModal } from "./src/AuthModal.jsx";
import { FeedbackButton } from "./src/FeedbackModal.jsx";
import {
  createCustomOutfit,
  deleteCustomOutfit,
  duplicateFromPreset,
  listCustomOutfits,
  saveCustomOutfit,
} from "./src/customOutfits.js";
import {
  getAllCustomPhotos,
  removeCustomPhoto,
  saveCustomPhoto,
} from "./src/customClothingPhotos.js";
import {
  canCreateCustomOutfit,
  canUseClothingLibrary,
  canUseCustomPhotos,
  getCurrentPlan,
  getUpgradeMessage,
  isDevMode,
} from "./src/entitlements.js";
import {
  CHILD_GENDER_OPTIONS,
  loadStoredChildGender,
  saveChildGender,
} from "./src/childGender.js";
import {
  clothingCatalog,
  createPresetOutfit,
  getPresetOutfitId,
  getRepresentativeTemperature,
  getWeatherKeyFromPresetId,
  getWeatherSet,
  listPresetOutfits,
  resolveWeatherKey,
  SKY_CONDITIONS,
  TEMP_MAX,
  TEMP_MIN,
} from "./src/outfitCatalog.js";
import {
  createBurstPieces,
  getDefaultRewardThemeId,
  getRewardArt,
  getRewardTheme,
  getRewardThemeOptions,
  isRewardThemeAllowed,
  loadStoredRewardThemeId,
  pickPraise,
  saveRewardThemeId,
} from "./src/rewardThemes.js";
import { trackEvent } from "./src/visitor.js";

const TEMP_WHEEL_STEP = 5;
const SUPPORT_URL = import.meta.env.VITE_SUPPORT_URL;
const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT;

let sharedAudioContext;

function ClothingArt({ item, size = "medium", customSrc = null, blend = false }) {
  const [hasError, setHasError] = useState(false);
  const className = `clothing-art clothing-art-${size}${blend ? " clothing-art-blend" : ""}`;
  const src = customSrc || `/clothes/${item.id}.png`;

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError) {
    return (
      <span className={`${className} art-fallback`} aria-label={item.name} role="img">
        {item.icon}
      </span>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={item.name}
      draggable="false"
      onError={() => setHasError(true)}
    />
  );
}

function RewardArt({ art }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [art.src]);

  if (hasError) {
    return (
      <span className="reward-art reward-fallback" aria-label={art.label} role="img">
        {art.fallback}
      </span>
    );
  }

  return (
    <img
      className="reward-art"
      src={art.src}
      alt={art.label}
      draggable="false"
      onError={() => setHasError(true)}
    />
  );
}

function clampTemperature(value) {
  return Math.max(TEMP_MIN, Math.min(TEMP_MAX, value));
}

function createInitialItemStates(items) {
  return Object.fromEntries(items.map((item) => [item.id, "pending"]));
}

function playNotes(notes, volume = 0.25, duration = 0.25, step = 0.09) {
  if (typeof window === "undefined") return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = sharedAudioContext || new AudioContext();
  sharedAudioContext = ctx;
  ctx.resume?.().catch(() => {});

  notes.forEach((frequency, index) => {
    const startAt = ctx.currentTime + index * step;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(volume, startAt);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
  });
}

function playTapSound() {
  playNotes([523.25, 659.25, 783.99]);
}

function playWinSound() {
  playNotes([523.25, 659.25, 783.99, 1046.5, 1318.51], 0.28, 0.35, 0.11);
}

function DressingApp() {
  const { user, plan: authPlan, signOut, loading: authLoading } = useAuth();
  const [screen, setScreen] = useState("parent");
  const [temperature, setTemperature] = useState(5);
  const [skyCondition, setSkyCondition] = useState("clear");
  const [showNames, setShowNames] = useState(true);
  const [showOverview, setShowOverview] = useState(() => {
    try {
      const stored = localStorage.getItem("tada_show_overview");
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });
  const [childGender, setChildGender] = useState(loadStoredChildGender);
  const [rewardThemeId, setRewardThemeId] = useState(() =>
    loadStoredRewardThemeId(loadStoredChildGender()),
  );
  const [activeOutfitId, setActiveOutfitId] = useState(getPresetOutfitId("cool"));
  const [customOutfits, setCustomOutfits] = useState([]);
  const [customPhotos, setCustomPhotos] = useState({});
  const [itemStates, setItemStates] = useState({});
  const [reward, setReward] = useState(null);
  const [showAgain, setShowAgain] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [showPhotoManager, setShowPhotoManager] = useState(isDevMode());
  const [statusMessage, setStatusMessage] = useState("");
  const [authModal, setAuthModal] = useState(null);
  const reducedMotion = useRef(false);
  const thermometerLineRef = useRef(null);
  const isDraggingTemperature = useRef(false);
  const photoInputRefs = useRef({});
  const statusTimerRef = useRef(null);

  const plan = getCurrentPlan(authPlan);
  const isSignedIn = Boolean(user);
  const weatherKey = resolveWeatherKey(temperature, skyCondition);
  const weather = getWeatherSet(weatherKey, childGender);
  const libraryAllowed = canUseClothingLibrary(plan);
  const photosAllowed = canUseCustomPhotos(plan);
  const canAddOutfit = canCreateCustomOutfit(customOutfits.length, plan);
  const rewardThemeOptions = useMemo(
    () => getRewardThemeOptions(childGender),
    [childGender],
  );
  const presetOutfits = useMemo(() => listPresetOutfits(childGender), [childGender]);
  const availableOutfits = useMemo(
    () => (libraryAllowed ? [...presetOutfits, ...customOutfits] : presetOutfits),
    [presetOutfits, customOutfits, libraryAllowed],
  );

  const activeOutfit = useMemo(() => {
    const found = availableOutfits.find((outfit) => outfit.id === activeOutfitId);
    if (found) return found;
    return createPresetOutfit(weatherKey, childGender);
  }, [activeOutfitId, availableOutfits, weatherKey, childGender]);

  const outfitItems = activeOutfit.items;
  const resolvedCount = outfitItems.filter(
    (item) => itemStates[item.id] === "done" || itemStates[item.id] === "skipped",
  ).length;
  const progress = outfitItems.length
    ? Math.round((resolvedCount / outfitItems.length) * 100)
    : 0;
  const rewardTheme = getRewardTheme(rewardThemeId, childGender);
  const celebrationArt = getRewardArt(rewardTheme, outfitItems.length);

  const thermometerPercent = useMemo(
    () => ((temperature - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100,
    [temperature],
  );

  function showStatusMessage(message) {
    setStatusMessage(message);
    if (statusTimerRef.current) {
      window.clearTimeout(statusTimerRef.current);
    }
    statusTimerRef.current = window.setTimeout(() => {
      setStatusMessage("");
      statusTimerRef.current = null;
    }, 2800);
  }

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        window.clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "tada-tracked-open";
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    trackEvent("app_open");
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("tada_show_overview", String(showOverview));
    } catch (error) {
      console.error("Failed to save showOverview setting:", error);
    }
  }, [showOverview]);

  function openAuthModal(feature, mode = "login") {
    trackEvent(
      "pro_gate",
      { feature, signed_in: Boolean(user) },
      user?.id ?? null,
    );
    setAuthModal({
      mode,
      reason:
        feature === "account"
          ? null
          : getUpgradeMessage(feature, { isSignedIn: Boolean(user) }),
    });
  }

  function requireProAccess(feature) {
    if (feature === "customPhotos") {
      if (canUseCustomPhotos(plan)) return true;
    } else if (canUseClothingLibrary(plan)) {
      return true;
    }

    if (!isSignedIn) {
      openAuthModal(feature, "signup");
    } else {
      trackEvent("pro_gate", { feature, signed_in: true }, user?.id ?? null);
      showStatusMessage(getUpgradeMessage(feature, { isSignedIn: true }));
    }
    return false;
  }

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = appStyles;
    document.head.appendChild(style);

    const font = document.createElement("link");
    font.rel = "stylesheet";
    font.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap";
    document.head.appendChild(font);

    const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      reducedMotion.current = Boolean(motionQuery?.matches);
    };

    syncMotion();
    motionQuery?.addEventListener?.("change", syncMotion);

    Promise.all([listCustomOutfits(), getAllCustomPhotos()])
      .then(([outfits, photos]) => {
        setCustomOutfits(outfits);
        setCustomPhotos(photos);
      })
      .catch(() => {});

    return () => {
      document.head.removeChild(style);
      document.head.removeChild(font);
      motionQuery?.removeEventListener?.("change", syncMotion);
    };
  }, []);

  useEffect(() => {
    setActiveOutfitId((current) => {
      if (!current.startsWith("preset-")) return current;
      return getPresetOutfitId(weatherKey);
    });
  }, [weatherKey]);

  useEffect(() => {
    if (libraryAllowed) return;
    setEditingOutfit(null);
    setActiveOutfitId((current) =>
      current.startsWith("preset-") ? current : getPresetOutfitId(weatherKey),
    );
  }, [libraryAllowed, weatherKey]);

  useEffect(() => {
    if (screen !== "done") return undefined;
    const timer = window.setTimeout(() => setShowAgain(true), 2400);
    return () => window.clearTimeout(timer);
  }, [screen]);

  function getTemperatureFromPointer(clientY) {
    const rect = thermometerLineRef.current?.getBoundingClientRect();
    if (!rect?.height) return temperature;

    const percent = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height));
    return clampTemperature(Math.round(TEMP_MIN + percent * (TEMP_MAX - TEMP_MIN)));
  }

  function setTemperatureFromPointer(event) {
    setTemperature(getTemperatureFromPointer(event.clientY));
  }

  function handleThermometerPointerDown(event) {
    isDraggingTemperature.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setTemperatureFromPointer(event);
  }

  function handleThermometerPointerMove(event) {
    if (!isDraggingTemperature.current) return;
    setTemperatureFromPointer(event);
  }

  function handleThermometerPointerUp(event) {
    isDraggingTemperature.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function handleThermometerWheel(event) {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    setTemperature((value) => clampTemperature(value + direction * TEMP_WHEEL_STEP));
  }

  function handleThermometerKeyDown(event) {
    const keyChanges = {
      ArrowDown: -1,
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: 1,
      PageDown: -TEMP_WHEEL_STEP,
      PageUp: TEMP_WHEEL_STEP,
    };

    if (event.key === "Home") {
      event.preventDefault();
      setTemperature(TEMP_MIN);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setTemperature(TEMP_MAX);
      return;
    }

    const change = keyChanges[event.key];
    if (!change) return;

    event.preventDefault();
    setTemperature((value) => clampTemperature(value + change));
  }

  function startDressingFlow() {
    trackEvent(
      "show_outfit",
      { temperature, weather: weatherKey, sky: skyCondition, outfit_id: activeOutfitId },
      user?.id ?? null,
    );
    setItemStates(createInitialItemStates(outfitItems));
    setReward(null);
    setShowAgain(false);
    setScreen(showOverview ? "overview" : "dressing");
  }

  function startDressing() {
    setItemStates(createInitialItemStates(outfitItems));
    setReward(null);
    setScreen("dressing");
  }

  function resetApp() {
    setTemperature(5);
    setSkyCondition("clear");
    setShowNames(true);
    setShowOverview(true);
    setActiveOutfitId(getPresetOutfitId("cool"));
    setItemStates({});
    setReward(null);
    setShowAgain(false);
    setEditingOutfit(null);
    setScreen("parent");
  }

  function returnToSettings() {
    setItemStates({});
    setReward(null);
    setShowAgain(false);
    setScreen("parent");
  }

  function renderSettingsButton() {
    return (
      <button
        type="button"
        className="settings-button"
        onClick={returnToSettings}
        aria-label="Back to temperature settings"
      >
        ← Settings
      </button>
    );
  }

  function checkAllResolved(nextStates) {
    return outfitItems.every(
      (item) => nextStates[item.id] === "done" || nextStates[item.id] === "skipped",
    );
  }

  function selectRewardTheme(themeId) {
    setRewardThemeId(themeId);
    saveRewardThemeId(themeId);
  }

  function selectChildGender(gender) {
    if (gender === childGender) return;
    setChildGender(gender);
    saveChildGender(gender);

    if (!isRewardThemeAllowed(rewardThemeId, gender)) {
      const nextThemeId = getDefaultRewardThemeId(gender);
      setRewardThemeId(nextThemeId);
      saveRewardThemeId(nextThemeId);
    }

    setActiveOutfitId((current) => {
      if (!current.startsWith("preset-")) return current;
      return getPresetOutfitId(weatherKey);
    });
  }

  function selectSkyCondition(conditionId) {
    setSkyCondition(conditionId);
    if (conditionId === "rain" || conditionId === "snow") {
      setActiveOutfitId(getPresetOutfitId(conditionId));
      return;
    }
    setActiveOutfitId(getPresetOutfitId(resolveWeatherKey(temperature, "clear")));
  }

  function handleOutfitSelect(event) {
    const outfitId = event.target.value;
    setActiveOutfitId(outfitId);

    const presetKey = getWeatherKeyFromPresetId(outfitId);
    if (!presetKey) return;

    if (presetKey === "rain" || presetKey === "snow") {
      setSkyCondition(presetKey);
      return;
    }

    setSkyCondition("clear");
    setTemperature(getRepresentativeTemperature(presetKey));
  }

  function markItemDone(item, itemIndex) {
    if (!item || itemStates[item.id] !== "pending" || reward) return;

    playTapSound();
    const art = getRewardArt(rewardTheme, itemIndex);
    const nextStates = { ...itemStates, [item.id]: "done" };
    setItemStates(nextStates);
    setReward({
      itemId: item.id,
      message: pickPraise(rewardTheme),
      art,
      pieces: createBurstPieces(rewardTheme),
    });

    const delay = reducedMotion.current ? 350 : 950;
    window.setTimeout(() => {
      setReward(null);
      if (checkAllResolved(nextStates)) {
        setScreen("done");
        setShowAgain(false);
        playWinSound();
      }
    }, delay);
  }

  function skipItem(item) {
    if (!item || itemStates[item.id] !== "pending" || reward) return;

    const nextStates = { ...itemStates, [item.id]: "skipped" };
    setItemStates(nextStates);

    if (checkAllResolved(nextStates)) {
      setScreen("done");
      setShowAgain(false);
      playWinSound();
    }
  }

  async function handleDuplicateFromTemperature() {
    if (!requireProAccess("clothingLibrary")) return;
    if (!canAddOutfit) return;
    const outfit = await duplicateFromPreset(weatherKey, undefined, childGender);
    const outfits = await listCustomOutfits();
    setCustomOutfits(outfits);
    setActiveOutfitId(outfit.id);
    setEditingOutfit(outfit);
  }

  async function handleCreateOutfit() {
    if (!requireProAccess("clothingLibrary")) return;
    if (!canAddOutfit) return;
    const outfit = await createCustomOutfit({
      name: "Today's outfit",
      items: [],
    });
    const outfits = await listCustomOutfits();
    setCustomOutfits(outfits);
    setActiveOutfitId(outfit.id);
    setEditingOutfit(outfit);
  }

  async function handleSaveEditingOutfit() {
    if (!libraryAllowed || !editingOutfit) return;
    const saved = await saveCustomOutfit(editingOutfit);
    const outfits = await listCustomOutfits();
    setCustomOutfits(outfits);
    setActiveOutfitId(saved.id);
    setEditingOutfit(null);
    showStatusMessage("Today's outfit saved on this device");
  }

  async function handleDeleteOutfit(outfitId) {
    if (!libraryAllowed) return;
    await deleteCustomOutfit(outfitId);
    const outfits = await listCustomOutfits();
    setCustomOutfits(outfits);
    if (activeOutfitId === outfitId) {
      setActiveOutfitId(getPresetOutfitId(weatherKey));
    }
    if (editingOutfit?.id === outfitId) {
      setEditingOutfit(null);
    }
  }

  function toggleEditingItem(itemId) {
    if (!libraryAllowed || !editingOutfit) return;
    const hasItem = editingOutfit.items.some((item) => item.id === itemId);
    const catalogItem = clothingCatalog.find((item) => item.id === itemId);
    if (!catalogItem) return;

    const items = hasItem
      ? editingOutfit.items.filter((item) => item.id !== itemId)
      : [...editingOutfit.items, { ...catalogItem }];

    setEditingOutfit({ ...editingOutfit, items });
  }

  async function handlePhotoUpload(itemId, file) {
    if (!requireProAccess("customPhotos")) return;
    if (!file) return;
    const dataUrl = await saveCustomPhoto(itemId, file);
    setCustomPhotos((current) => ({ ...current, [itemId]: dataUrl }));
    showStatusMessage("Saved on this device");
  }

  async function handlePhotoRemove(itemId) {
    await removeCustomPhoto(itemId);
    setCustomPhotos((current) => {
      const next = { ...current };
      delete next[itemId];
      return next;
    });
  }

  function renderParentScreen() {
    return (
      <main className="dress-app dress-parent">
        <section className="parent-card" aria-label="Parent setup">
          <p className="eyebrow">For grown-ups</p>
          <h1>Get dressed for outside</h1>
          <p className="intro">
            Set the temperature and weather, choose what to wear today, then hand the phone to your child.
          </p>
          {isDevMode() && <p className="dev-badge">Dev mode: all Pro features unlocked</p>}
          {statusMessage && <p className="save-status" aria-live="polite">{statusMessage}</p>}

          <div className="account-bar">
            {authLoading ? (
              <p className="account-status">Checking account...</p>
            ) : isSignedIn ? (
              <>
                <p className="account-status">
                  Signed in as <strong>{user.email}</strong>
                  {plan === "premium" ? " · Pro" : " · Free"}
                </p>
                <button
                  type="button"
                  className="text-button account-action"
                  onClick={async () => {
                    await signOut();
                    showStatusMessage("Signed out");
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <p className="account-status">Using as guest</p>
                <button
                  type="button"
                  className="secondary-button account-action"
                  onClick={() => openAuthModal("account", "login")}
                >
                  Log in / Sign up
                </button>
              </>
            )}
          </div>

          <div className="weather-preview" style={{ "--weather-color": weather.color }}>
            <div
              className="thermometer"
              role="slider"
              tabIndex="0"
              aria-label="Quick temperature selector"
              aria-valuemin={TEMP_MIN}
              aria-valuemax={TEMP_MAX}
              aria-valuenow={temperature}
              onKeyDown={handleThermometerKeyDown}
              onPointerDown={handleThermometerPointerDown}
              onPointerMove={handleThermometerPointerMove}
              onPointerUp={handleThermometerPointerUp}
              onPointerCancel={handleThermometerPointerUp}
              onWheel={handleThermometerWheel}
            >
              <div className="thermometer-line" ref={thermometerLineRef}>
                <span style={{ height: `${thermometerPercent}%` }} />
              </div>
              <div className="thermometer-dot" />
            </div>

            <div className="temperature-box">
              <span className="weather-icon">{weather.icon}</span>
              <div className="temperature">
                {temperature > 0 ? "+" : ""}
                {temperature}°C
              </div>
              <div className="range">
                {weather.label} · {weather.subtitle}
              </div>
            </div>
          </div>

          <div className="temp-controls" aria-label="Choose temperature">
            <button
              type="button"
              onClick={() => setTemperature((value) => clampTemperature(value - 1))}
              aria-label="Make it colder"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setTemperature((value) => clampTemperature(value + 1))}
              aria-label="Make it warmer"
            >
              +
            </button>
          </div>

          <p className="field-label" id="sky-condition-label">
            Weather outside
          </p>
          <div
            className="sky-condition-grid"
            role="radiogroup"
            aria-labelledby="sky-condition-label"
          >
            {SKY_CONDITIONS.map((option) => {
              const selected = skyCondition === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`sky-condition-option ${selected ? "is-selected" : ""}`}
                  onClick={() => selectSkyCondition(option.id)}
                >
                  <span className="sky-condition-emoji" aria-hidden="true">
                    {option.icon}
                  </span>
                  <strong>{option.label}</strong>
                </button>
              );
            })}
          </div>

          <label className="field-label" htmlFor="outfit-select">
            What to wear today
          </label>
          <select
            id="outfit-select"
            className="outfit-select"
            value={activeOutfitId}
            onChange={handleOutfitSelect}
          >
            <optgroup label="By weather">
              {presetOutfits.map((outfit) => (
                <option key={outfit.id} value={outfit.id}>
                  {outfit.name}
                </option>
              ))}
            </optgroup>
            {libraryAllowed && customOutfits.length > 0 && (
              <optgroup label="From clothing library">
                {customOutfits.map((outfit) => (
                  <option key={outfit.id} value={outfit.id}>
                    {outfit.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          <p className="field-label" id="child-gender-label">
            Child
          </p>
          <div
            className="reward-theme-grid"
            role="radiogroup"
            aria-labelledby="child-gender-label"
          >
            {CHILD_GENDER_OPTIONS.map((option) => {
              const selected = childGender === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`reward-theme-option ${selected ? "is-selected" : ""}`}
                  onClick={() => selectChildGender(option.id)}
                >
                  <span className="reward-theme-emoji" aria-hidden="true">
                    {option.emoji}
                  </span>
                  <strong>{option.label}</strong>
                </button>
              );
            })}
          </div>

          <p className="field-label" id="reward-theme-label">
            Prize for finding clothes
          </p>
          <div
            className="reward-theme-grid"
            role="radiogroup"
            aria-labelledby="reward-theme-label"
          >
            {rewardThemeOptions.map((theme) => {
              const selected = rewardThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`reward-theme-option ${selected ? "is-selected" : ""}`}
                  onClick={() => selectRewardTheme(theme.id)}
                >
                  <span className="reward-theme-emoji" aria-hidden="true">
                    {theme.emoji}
                  </span>
                  <strong>{theme.label}</strong>
                </button>
              );
            })}
          </div>

          <section className="parent-section" aria-label="Clothing library">
            <div className="section-heading">
              <h2>Clothing library</h2>
              <span className="pro-badge" aria-label="Pro feature">
                Pro
              </span>
            </div>
            <p className="helper-text">
              Pick items from the library to build what your child wears today.
            </p>

            {!libraryAllowed && (
              <div className="upgrade-block">
                <p className="upgrade-hint">
                  {getUpgradeMessage("clothingLibrary", { isSignedIn })}
                </p>
                {!isSignedIn && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => openAuthModal("clothingLibrary", "signup")}
                  >
                    Log in for Pro
                  </button>
                )}
              </div>
            )}

            {libraryAllowed && (
              <>
                <div className="section-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleDuplicateFromTemperature}
                    disabled={!canAddOutfit}
                  >
                    Start from temperature
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleCreateOutfit}
                    disabled={!canAddOutfit}
                  >
                    Build today&apos;s outfit
                  </button>
                </div>

                {customOutfits.length > 0 && (
                  <ul className="custom-outfit-list">
                    {customOutfits.map((outfit) => (
                      <li key={outfit.id}>
                        <span>
                          {outfit.name}
                          <small>
                            {outfit.items.length} item{outfit.items.length === 1 ? "" : "s"}
                          </small>
                        </span>
                        <div className="inline-actions">
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => {
                              setActiveOutfitId(outfit.id);
                              setEditingOutfit(outfit);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-button danger"
                            onClick={() => handleDeleteOutfit(outfit.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>

          {libraryAllowed && editingOutfit && (
            <section className="parent-section editor-panel" aria-label="Choose today's items">
              <label className="field-label" htmlFor="outfit-name">
                Outfit name
              </label>
              <input
                id="outfit-name"
                className="text-input"
                value={editingOutfit.name}
                onChange={(event) =>
                  setEditingOutfit({ ...editingOutfit, name: event.target.value })
                }
              />

              <p className="field-label">Choose from the library</p>
              <div className="catalog-grid">
                {clothingCatalog.map((item) => {
                  const selected = editingOutfit.items.some(
                    (outfitItem) => outfitItem.id === item.id,
                  );
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`catalog-item ${selected ? "is-selected" : ""}`}
                      onClick={() => toggleEditingItem(item.id)}
                      aria-pressed={selected}
                    >
                      <ClothingArt
                        item={item}
                        size="small"
                        customSrc={customPhotos[item.id]}
                        blend
                      />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="section-actions">
                <button type="button" className="secondary-button" onClick={handleSaveEditingOutfit}>
                  Use this today
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditingOutfit(null)}
                >
                  Cancel
                </button>
              </div>
            </section>
          )}

          <section className="parent-section" aria-label="My clothing photos">
            <button
              type="button"
              className="section-toggle"
              onClick={() => setShowPhotoManager((value) => !value)}
              aria-expanded={showPhotoManager}
            >
              <span>
                My clothing photos <span className="pro-badge inline">Pro</span>
              </span>
              <strong>{showPhotoManager ? "Hide" : "Show"}</strong>
            </button>

            {showPhotoManager && (
              <div className="photo-manager">
                <p className="helper-text">
                  Photos stay on this device and apply to every outfit that uses that item.
                </p>
                {!photosAllowed && (
                  <div className="upgrade-block">
                    <p className="upgrade-hint">
                      {getUpgradeMessage("customPhotos", { isSignedIn })}
                    </p>
                    {!isSignedIn && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => openAuthModal("customPhotos", "signup")}
                      >
                        Log in for Pro
                      </button>
                    )}
                  </div>
                )}

                <ul className="photo-list">
                  {clothingCatalog.map((item) => (
                    <li key={item.id} className="photo-row">
                      <ClothingArt
                        item={item}
                        size="small"
                        customSrc={customPhotos[item.id]}
                        blend
                      />
                      <span>{item.name}</span>
                      <div className="inline-actions">
                        <input
                          ref={(node) => {
                            photoInputRefs.current[item.id] = node;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden-input"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            handlePhotoUpload(item.id, file);
                            event.target.value = "";
                          }}
                        />
                        <button
                          type="button"
                          className="text-button"
                          disabled={!photosAllowed}
                          onClick={() => photoInputRefs.current[item.id]?.click()}
                        >
                          Upload
                        </button>
                        {customPhotos[item.id] && (
                          <button
                            type="button"
                            className="text-button danger"
                            disabled={!photosAllowed}
                            onClick={() => handlePhotoRemove(item.id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <button
            type="button"
            className={`names-toggle ${showNames ? "is-on" : ""}`}
            onClick={() => setShowNames((value) => !value)}
            aria-pressed={showNames}
          >
            <span>Show item names?</span>
            <strong>{showNames ? "Yes" : "No"}</strong>
          </button>

          <button
            type="button"
            className={`names-toggle ${showOverview ? "is-on" : ""}`}
            onClick={() => setShowOverview((value) => !value)}
            aria-pressed={showOverview}
          >
            <span>Show full outfit first?</span>
            <strong>{showOverview ? "Yes" : "No"}</strong>
          </button>

          <button type="button" className="start-button" onClick={startDressingFlow}>
            Show outfit
          </button>

          {(SUPPORT_URL || FORMSPREE_ENDPOINT) && (
            <div className="parent-footer-actions">
              {SUPPORT_URL && (
                <a
                  className="secondary-button support-link"
                  href={SUPPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Support this project
                </a>
              )}
              <FeedbackButton endpoint={FORMSPREE_ENDPOINT} />
            </div>
          )}
        </section>
      </main>
    );
  }

  function renderOverviewScreen() {
    const headerText =
      activeOutfit.source === "custom" ? activeOutfit.name : `${weather.icon} ${weather.outside}`;

    return (
      <main className="dress-app dress-overview">
        {renderSettingsButton()}
        <header className="overview-header">
          <p>{headerText}</p>
          <h2>First, look at everything</h2>
        </header>

        <section className={`outfit-grid ${showNames ? "with-names" : "no-names"}`} aria-label="Full outfit">
          {outfitItems.map((item) => (
            <article className="outfit-tile" key={item.id}>
              <ClothingArt item={item} size="small" customSrc={customPhotos[item.id]} blend />
              {showNames && <strong>{item.name}</strong>}
            </article>
          ))}
        </section>

        <footer className="bottom-action">
          <button type="button" className="primary-action" onClick={startDressing}>
            I am ready
          </button>
        </footer>
      </main>
    );
  }

  function renderDressingScreen() {
    const headerText =
      activeOutfit.source === "custom" ? activeOutfit.name : `${weather.icon} ${weather.outside}`;

    const currentItem = outfitItems.find((item) => itemStates[item.id] === "pending");
    const currentIndex = currentItem ? outfitItems.indexOf(currentItem) : -1;

    return (
      <main className="dress-app dress-dressing">
        {renderSettingsButton()}
        <header className="dressing-header">
          <p>{headerText}</p>
          <h2>Tap when you find it</h2>
          <div className="progress-track" aria-label={`Progress ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-label">
            {resolvedCount} of {outfitItems.length}
          </p>
        </header>

        <section
          className={`dressing-single ${showNames ? "with-names" : "no-names"}`}
          aria-label="Current item to find"
        >
          {currentItem ? (
            <article className="dressing-card">
              <div className="dressing-hit">
                <div className="dressing-visual">
                  <ClothingArt item={currentItem} size="large" customSrc={customPhotos[currentItem.id]} blend />
                  {showNames && <strong>{currentItem.name}</strong>}
                </div>
                <button
                  type="button"
                  className="dressing-tap-large"
                  onClick={() => markItemDone(currentItem, currentIndex)}
                  disabled={Boolean(reward)}
                  aria-label={`Mark ${currentItem.name} as found`}
                />
              </div>
              <button
                type="button"
                className="skip-button-large"
                onClick={() => skipItem(currentItem)}
                disabled={Boolean(reward)}
              >
                Skip this item
              </button>
            </article>
          ) : null}
        </section>

        {reward && (
          <div className="reward-overlay" aria-live="polite">
            <RewardArt art={reward.art} />
            <strong>{reward.message}</strong>
            <div className="reward-burst" aria-hidden="true">
              {reward.pieces.map((piece, index) => (
                <span
                  key={index}
                  style={{
                    "--angle": `${piece.angle}deg`,
                    "--distance": `${piece.distance}px`,
                  }}
                >
                  {piece.icon}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    );
  }

  function renderDoneScreen() {
    return (
      <main className="dress-app dress-done">
        {renderSettingsButton()}
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 36 }, (_, index) => (
            <span
              key={index}
              style={{
                "--left": `${(index * 29) % 100}%`,
                "--delay": `${(index % 10) * 0.13}s`,
              }}
            />
          ))}
        </div>

        <section className="done-content">
          <div className="done-icons" aria-hidden="true">
            <RewardArt art={celebrationArt} />
            <span>🎉 🌈</span>
          </div>
          <h2>All dressed!</h2>
          <p>Time to go outside.</p>
          {showAgain && (
            <button type="button" className="again-button" onClick={resetApp}>
              Go again
            </button>
          )}
        </section>
      </main>
    );
  }

  if (screen === "overview") return renderOverviewScreen();
  if (screen === "dressing") return renderDressingScreen();
  if (screen === "done") return renderDoneScreen();
  return (
    <>
      {renderParentScreen()}
      {authModal && (
        <AuthModal
          initialMode={authModal.mode}
          reason={authModal.reason}
          onClose={() => setAuthModal(null)}
        />
      )}
    </>
  );
}

const appStyles = `
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    -webkit-tap-highlight-color: transparent;
  }

  button,
  input,
  select {
    font: inherit;
  }

  button {
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
  }

  button:focus {
    outline: none;
  }

  @media (hover: hover) and (pointer: fine) {
    button:focus-visible {
      outline: 3px solid rgba(255, 255, 255, 0.72);
      outline-offset: 2px;
    }
  }

  .dress-app {
    min-height: 100vh;
    width: 100%;
    font-family: "Nunito", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #ffffff;
    text-shadow: 0 2px 8px rgba(78, 36, 20, 0.22);
  }

  .dress-parent {
    display: grid;
    place-items: center;
    padding: 24px;
    background: linear-gradient(135deg, #ff8c69 0%, #ffc04a 100%);
  }

  .parent-card {
    width: min(100%, 560px);
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    padding: 24px;
    border: 2px solid rgba(255, 255, 255, 0.38);
    border-radius: 32px;
    background: rgba(255, 255, 255, 0.14);
    box-shadow: 0 24px 48px rgba(136, 69, 26, 0.2);
    backdrop-filter: blur(8px);
  }

  .eyebrow,
  .intro,
  .range,
  .helper-text,
  .upgrade-hint,
  .progress-label {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
  }

  .upgrade-hint {
    margin-top: 8px;
    color: #fff4d6;
  }

  .pro-badge {
    display: inline-grid;
    place-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: rgba(76, 175, 80, 0.55);
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .pro-badge.inline {
    margin-left: 8px;
    vertical-align: middle;
  }

  .custom-outfit-list li span {
    display: grid;
    gap: 2px;
  }

  .custom-outfit-list li small {
    font-size: 14px;
    font-weight: 800;
    opacity: 0.85;
  }

  .dev-badge {
    margin: 10px 0 0;
    padding: 8px 12px;
    border-radius: 12px;
    background: rgba(76, 175, 80, 0.35);
    font-size: 16px;
    font-weight: 900;
  }

  .save-status {
    margin: 10px 0 0;
    padding: 8px 12px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.28);
    font-size: 16px;
    font-weight: 900;
  }

  .parent-card h1 {
    margin: 8px 0 10px;
    font-size: clamp(40px, 11vw, 62px);
    font-weight: 900;
    line-height: 0.98;
  }

  .field-label,
  .section-heading h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 900;
  }

  .field-label {
    display: block;
    margin-top: 16px;
    margin-bottom: 8px;
  }

  .outfit-select,
  .text-input {
    width: 100%;
    min-height: 52px;
    padding: 12px 14px;
    border: 0;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.92);
    color: #333333;
    text-shadow: none;
    box-shadow: 0 10px 24px rgba(113, 55, 28, 0.12);
  }

  .reward-theme-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .reward-theme-option {
    display: grid;
    justify-items: center;
    gap: 6px;
    min-height: 88px;
    padding: 12px 10px;
    border: 3px solid transparent;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.82);
    color: #333333;
    font-family: inherit;
    box-shadow: 0 8px 18px rgba(113, 55, 28, 0.12);
  }

  .reward-theme-option.is-selected {
    border-color: #4caf50;
    background: #ffffff;
  }

  .reward-theme-emoji {
    font-size: 28px;
    line-height: 1;
  }

  .reward-theme-option strong {
    font-size: 16px;
    font-weight: 900;
    line-height: 1.1;
  }

  .parent-section {
    margin-top: 18px;
    padding: 16px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.12);
  }

  .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .section-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .secondary-button,
  .section-toggle,
  .text-button,
  .skip-button {
    border: 0;
    border-radius: 16px;
    font-weight: 900;
    text-shadow: none;
  }

  .secondary-button,
  .section-toggle {
    min-height: 48px;
    padding: 0 16px;
    background: rgba(255, 255, 255, 0.88);
    color: #e75d38;
    box-shadow: 0 8px 18px rgba(113, 55, 28, 0.12);
  }

  .secondary-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .parent-footer-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }

  .support-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }

  .feedback-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(48, 24, 12, 0.45);
  }

  .feedback-modal {
    width: min(100%, 420px);
    padding: 22px;
    border-radius: 24px;
    background: #fff8f1;
    color: #4a2b1d;
    text-shadow: none;
    box-shadow: 0 24px 48px rgba(78, 36, 20, 0.28);
  }

  .feedback-modal h2 {
    margin: 0 0 16px;
    font-size: 28px;
    font-weight: 900;
  }

  .feedback-fieldset {
    margin: 0 0 16px;
    padding: 0;
    border: 0;
  }

  .feedback-fieldset legend {
    margin-bottom: 10px;
    font-size: 18px;
    font-weight: 900;
  }

  .rating-row {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
  }

  .rating-button {
    min-height: 52px;
    border: 2px solid rgba(231, 93, 56, 0.25);
    border-radius: 14px;
    background: #ffffff;
    color: #e75d38;
    font-size: 22px;
    font-weight: 900;
  }

  .rating-button.is-selected {
    border-color: #4caf50;
    background: #e8f8ea;
    color: #2f7a36;
  }

  .feedback-label {
    display: block;
    margin-bottom: 8px;
    font-size: 18px;
    font-weight: 900;
  }

  .feedback-textarea {
    width: 100%;
    padding: 12px 14px;
    border: 0;
    border-radius: 16px;
    background: #ffffff;
    color: #333333;
    resize: vertical;
    box-shadow: inset 0 0 0 2px rgba(231, 93, 56, 0.18);
  }

  .feedback-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 16px;
  }

  .feedback-success {
    margin: 0;
    font-size: 20px;
    font-weight: 900;
    color: #2f7a36;
  }

  .feedback-error {
    margin: 12px 0 0;
    font-size: 16px;
    font-weight: 800;
    color: #c62828;
  }

  .feedback-modal .secondary-button,
  .feedback-modal .text-button {
    color: #e75d38;
  }

  .feedback-modal .text-button {
    background: rgba(231, 93, 56, 0.12);
  }

  .account-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin: 0 0 18px;
    padding: 12px 14px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.14);
  }

  .account-status {
    margin: 0;
    font-size: 15px;
    font-weight: 800;
    line-height: 1.35;
  }

  .account-action {
    flex-shrink: 0;
  }

  .account-bar .text-button,
  .account-bar .secondary-button {
    color: #e75d38;
  }

  .account-bar .text-button {
    background: rgba(255, 255, 255, 0.88);
  }

  .upgrade-block {
    display: grid;
    gap: 10px;
    margin-top: 8px;
  }

  .upgrade-block .secondary-button {
    justify-self: start;
  }

  .auth-backdrop {
    position: fixed;
    inset: 0;
    z-index: 110;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(48, 24, 12, 0.45);
  }

  .auth-modal {
    width: min(100%, 420px);
    padding: 22px;
    border-radius: 24px;
    background: #fff8f1;
    color: #4a2b1d;
    text-shadow: none;
    box-shadow: 0 24px 48px rgba(78, 36, 20, 0.28);
  }

  .auth-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 14px;
  }

  .auth-tab {
    min-height: 44px;
    border: 2px solid rgba(231, 93, 56, 0.2);
    border-radius: 14px;
    background: #ffffff;
    color: #e75d38;
    font-weight: 900;
  }

  .auth-tab.is-selected {
    border-color: #4caf50;
    background: #e8f8ea;
    color: #2f7a36;
  }

  .auth-modal h2 {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 900;
  }

  .auth-reason {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 800;
    line-height: 1.4;
  }

  .auth-google {
    width: 100%;
    min-height: 52px;
    border: 0;
    border-radius: 16px;
    background: #ffffff;
    color: #4a2b1d;
    font-weight: 900;
    box-shadow: inset 0 0 0 2px rgba(74, 43, 29, 0.12);
  }

  .auth-divider {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 10px;
    margin: 16px 0;
    color: rgba(74, 43, 29, 0.55);
    font-size: 14px;
    font-weight: 800;
  }

  .auth-divider::before,
  .auth-divider::after {
    content: "";
    height: 1px;
    background: rgba(74, 43, 29, 0.18);
  }

  .auth-form {
    display: grid;
    gap: 8px;
  }

  .auth-label {
    margin-top: 6px;
    font-size: 16px;
    font-weight: 900;
  }

  .auth-input {
    width: 100%;
    min-height: 48px;
    padding: 0 14px;
    border: 0;
    border-radius: 16px;
    background: #ffffff;
    color: #333333;
    box-shadow: inset 0 0 0 2px rgba(231, 93, 56, 0.18);
  }

  .auth-turnstile {
    margin-top: 8px;
    display: flex;
    justify-content: center;
  }

  .auth-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
  }

  .auth-success {
    margin: 0;
    font-size: 18px;
    font-weight: 900;
    color: #2f7a36;
  }

  .auth-error {
    margin: 8px 0 0;
    font-size: 15px;
    font-weight: 800;
    color: #c62828;
  }

  .auth-modal .secondary-button,
  .auth-modal .text-button {
    color: #e75d38;
  }

  .auth-modal .text-button {
    background: rgba(231, 93, 56, 0.12);
  }

  .section-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: rgba(255, 255, 255, 0.18);
    color: #ffffff;
    text-shadow: inherit;
  }

  .custom-outfit-list,
  .photo-list {
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
  }

  .custom-outfit-list li,
  .photo-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
    color: #ffffff;
    text-shadow: inherit;
  }

  .photo-row .clothing-art-small {
    flex-shrink: 0;
    background: transparent;
  }

  .inline-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .text-button {
    min-height: 40px;
    padding: 0 12px;
    background: rgba(255, 255, 255, 0.22);
    color: #ffffff;
  }

  .text-button.danger {
    background: rgba(255, 107, 107, 0.35);
  }

  .text-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .editor-panel {
    background: rgba(255, 255, 255, 0.18);
  }

  .catalog-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
  }

  .catalog-item {
    display: grid;
    gap: 8px;
    justify-items: center;
    min-height: 120px;
    padding: 10px;
    border: 2px solid rgba(255, 255, 255, 0.28);
    border-radius: 18px;
    background: transparent;
    color: #ffffff;
    text-shadow: inherit;
  }

  .catalog-item.is-selected {
    border-color: #4caf50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.35);
    background: rgba(255, 255, 255, 0.12);
  }

  .catalog-item span {
    font-size: 14px;
    font-weight: 900;
    line-height: 1.1;
    text-align: center;
  }

  .hidden-input {
    display: none;
  }

  .weather-preview {
    display: grid;
    grid-template-columns: 72px 1fr;
    gap: 18px;
    align-items: center;
    margin-top: 22px;
    padding: 18px;
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.18);
  }

  .thermometer {
    display: grid;
    justify-items: center;
    cursor: ns-resize;
    touch-action: none;
    border-radius: 999px;
    outline: none;
    transition: transform 160ms ease;
  }

  .thermometer:hover,
  .thermometer:focus-visible {
    transform: scale(1.04);
  }

  .thermometer:focus-visible .thermometer-line,
  .thermometer:focus-visible .thermometer-dot {
    box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.34);
  }

  .thermometer-line {
    display: flex;
    align-items: end;
    width: 26px;
    height: 150px;
    overflow: hidden;
    border: 4px solid #ffffff;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.45);
  }

  .thermometer-line span {
    width: 100%;
    border-radius: inherit;
    background: var(--weather-color);
    transition: height 160ms ease;
  }

  .thermometer-dot {
    width: 54px;
    height: 54px;
    margin-top: -6px;
    border: 4px solid #ffffff;
    border-radius: 999px;
    background: var(--weather-color);
  }

  .temperature-box {
    text-align: center;
  }

  .weather-icon {
    display: block;
    font-size: 58px;
    line-height: 1;
  }

  .temperature {
    margin: 6px 0;
    font-size: 56px;
    font-weight: 900;
    line-height: 1;
  }

  .temp-controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 18px;
  }

  .sky-condition-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .sky-condition-option {
    display: grid;
    justify-items: center;
    gap: 4px;
    min-height: 78px;
    padding: 10px 8px;
    border: 3px solid transparent;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.82);
    color: #333333;
    font-family: inherit;
    box-shadow: 0 8px 18px rgba(113, 55, 28, 0.12);
  }

  .sky-condition-option.is-selected {
    border-color: #4caf50;
    background: #ffffff;
  }

  .sky-condition-emoji {
    font-size: 28px;
    line-height: 1;
  }

  .sky-condition-option strong {
    font-size: 15px;
    font-weight: 900;
    line-height: 1.1;
  }

  .temp-controls button,
  .start-button,
  .again-button,
  .names-toggle,
  .primary-action,
  .settings-button {
    min-height: 72px;
    border: 0;
    border-radius: 22px;
    font-family: inherit;
    font-weight: 900;
    box-shadow: 0 12px 28px rgba(113, 55, 28, 0.18);
  }

  .temp-controls button {
    background: #ffffff;
    color: #e75d38;
    font-size: 46px;
  }

  .names-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 16px;
    margin-top: 16px;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.24);
    color: #ffffff;
    font-size: 20px;
    text-shadow: inherit;
  }

  .names-toggle strong {
    display: grid;
    place-items: center;
    min-width: 82px;
    min-height: 48px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.35);
    font-size: 22px;
  }

  .names-toggle.is-on strong {
    background: #4caf50;
  }

  .start-button,
  .again-button,
  .primary-action {
    position: relative;
    width: 100%;
    min-height: 128px;
    overflow: visible;
    border: 0;
    background: transparent;
    color: #ffffff;
    font-size: 26px;
    text-shadow: 0 3px 8px rgba(92, 0, 0, 0.55);
    filter: drop-shadow(0 16px 22px rgba(95, 24, 15, 0.3));
    animation: buttonPulse 1.55s ease-in-out infinite;
    transition: transform 100ms ease, filter 100ms ease;
  }

  .start-button::before,
  .again-button::before,
  .primary-action::before {
    content: "";
    position: absolute;
    inset: -28px -8px;
    z-index: 0;
    background: url("/ui/big-red-button-cutout.png") center / contain no-repeat;
  }

  .start-button,
  .again-button,
  .primary-action {
    isolation: isolate;
  }

  .start-button {
    margin-top: 26px;
  }

  .start-button:active,
  .again-button:active,
  .primary-action:active {
    transform: translateY(7px) scale(0.98);
    filter: drop-shadow(0 8px 12px rgba(95, 24, 15, 0.22));
    animation-play-state: paused;
  }

  .start-button::after,
  .again-button::after,
  .primary-action::after {
    content: "";
    position: absolute;
    inset: 62% 10% 7%;
    z-index: -1;
    border-radius: 999px;
    background: rgba(99, 20, 15, 0.3);
    filter: blur(14px);
  }

  .dress-overview,
  .dress-dressing,
  .dress-done {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%);
  }

  .settings-button {
    position: absolute;
    left: max(14px, env(safe-area-inset-left));
    top: max(14px, env(safe-area-inset-top));
    z-index: 30;
    min-height: 52px;
    padding: 0 18px;
    background: rgba(255, 255, 255, 0.9);
    color: #e75d38;
    font-size: 18px;
    text-shadow: none;
    box-shadow: 0 10px 24px rgba(113, 55, 28, 0.18);
  }

  .settings-button:active {
    transform: translateY(2px);
  }

  .dress-overview,
  .dress-dressing {
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 14px;
    padding: max(18px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
  }

  .dress-dressing {
    grid-template-rows: auto 1fr;
  }

  .overview-header,
  .dressing-header {
    text-align: center;
  }

  .overview-header p,
  .overview-header h2,
  .dressing-header p,
  .dressing-header h2 {
    margin: 0;
  }

  .overview-header p,
  .dressing-header p {
    font-size: 22px;
    font-weight: 900;
  }

  .overview-header h2,
  .dressing-header h2 {
    margin-top: 6px;
    font-size: clamp(34px, 10vw, 54px);
    font-weight: 900;
    line-height: 1;
  }

  .dressing-header .progress-track {
    margin-top: 14px;
  }

  .dressing-header .progress-label {
    margin-top: 8px;
    font-size: 20px;
  }

  .outfit-grid,
  .dressing-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    align-content: start;
    overflow-y: auto;
    padding: 2px;
  }

  .dressing-single {
    display: grid;
    place-items: center;
    align-content: center;
    overflow-y: auto;
    padding: 2px;
  }

  .outfit-tile,
  .dressing-tile,
  .dressing-card {
    display: grid;
    gap: 8px;
    min-height: 148px;
    padding: 12px;
    border: 2px solid rgba(255, 255, 255, 0.42);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.22);
    color: #ffffff;
    text-align: center;
    text-shadow: inherit;
    box-shadow: 0 12px 24px rgba(127, 69, 32, 0.12);
  }

  .dressing-card {
    width: min(100%, 420px);
    min-height: 0;
    padding: 18px;
    gap: 14px;
  }

  .dressing-tile.state-done {
    background: rgba(76, 175, 80, 0.28);
    border-color: rgba(255, 255, 255, 0.55);
  }

  .dressing-tile.state-skipped {
    opacity: 0.72;
    background: rgba(255, 255, 255, 0.12);
  }

  .dressing-hit {
    position: relative;
    display: grid;
  }

  .dressing-visual {
    display: grid;
    gap: 8px;
    justify-items: center;
    pointer-events: none;
  }

  .dressing-tap,
  .dressing-tap-large {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    border-radius: inherit;
    background: transparent;
    color: inherit;
    text-shadow: none;
  }

  .dressing-tap:disabled,
  .dressing-tap-large:disabled {
    cursor: default;
    pointer-events: none;
  }

  .outfit-tile strong,
  .dressing-visual strong {
    font-size: 20px;
    font-weight: 900;
    line-height: 1.05;
  }

  .dressing-card .dressing-visual strong {
    font-size: clamp(28px, 8vw, 42px);
  }

  .state-badge {
    display: inline-grid;
    place-items: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 16px;
    font-weight: 900;
  }

  .done-badge {
    background: #4caf50;
    color: #ffffff;
  }

  .skipped-badge {
    background: #d7d7d7;
    color: #555555;
  }

  .skip-button,
  .skip-button-large {
    min-height: 42px;
    background: rgba(231, 93, 56, 0.14);
    color: #e75d38;
  }

  .skip-button-large {
    min-height: 56px;
    border: 0;
    border-radius: 18px;
    font-weight: 900;
  }

  .no-names .outfit-tile,
  .no-names .dressing-tile {
    min-height: 164px;
  }

  .clothing-art {
    display: block;
    object-fit: contain;
    user-select: none;
    pointer-events: none;
    -webkit-touch-callout: none;
    background: transparent;
  }

  .clothing-art-blend {
    mix-blend-mode: multiply;
  }

  .clothing-art-small {
    width: min(112px, 34vw);
    height: min(112px, 34vw);
  }

  .clothing-art-medium {
    width: 120px;
    height: 120px;
  }

  .clothing-art-large {
    width: min(78vw, 360px);
    height: min(78vw, 360px);
  }

  .art-fallback {
    display: grid;
    place-items: center;
    line-height: 1;
    text-shadow: none;
  }

  .clothing-art-small.art-fallback {
    font-size: 58px;
  }

  .clothing-art-large.art-fallback {
    font-size: clamp(150px, 44vw, 240px);
  }

  .bottom-action {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .progress-track {
    height: 24px;
    overflow: hidden;
    border: 3px solid #ffffff;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.45);
  }

  .progress-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: #4caf50;
    transition: width 180ms ease;
  }

  .reward-overlay {
    position: fixed;
    z-index: 20;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.34);
    color: #ffffff;
    text-align: center;
    text-shadow: 0 3px 10px rgba(78, 36, 20, 0.25);
    pointer-events: none;
  }

  .reward-overlay strong {
    position: relative;
    z-index: 2;
    padding: 12px 22px;
    border-radius: 999px;
    background: rgba(255, 107, 107, 0.88);
    font-size: clamp(34px, 10vw, 58px);
    font-weight: 900;
  }

  .reward-art {
    position: relative;
    z-index: 2;
    width: min(64vw, 230px);
    height: min(52vw, 190px);
    object-fit: contain;
    user-select: none;
    animation: rewardPop 850ms ease-out both;
  }

  .reward-fallback {
    display: grid;
    place-items: center;
    font-size: clamp(110px, 30vw, 180px);
    line-height: 1;
  }

  .reward-burst {
    position: absolute;
    left: 50%;
    top: 48%;
  }

  .reward-burst span {
    position: absolute;
    left: 0;
    top: 0;
    font-size: 34px;
    animation: rewardBurst 900ms ease-out forwards;
  }

  .dress-done {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 100vh;
    overflow: hidden;
    padding: 24px;
  }

  .done-content {
    position: relative;
    z-index: 2;
    width: min(100%, 560px);
    text-align: center;
  }

  .done-icons {
    display: grid;
    justify-items: center;
    gap: 8px;
    font-size: 58px;
    animation: floatIcons 1.5s ease-in-out infinite alternate;
  }

  .done-icons .reward-art {
    width: min(68vw, 260px);
    height: min(54vw, 210px);
  }

  .done-content h2 {
    margin: 14px 0 10px;
    font-size: clamp(52px, 14vw, 82px);
    font-weight: 900;
    line-height: 0.95;
  }

  .done-content p {
    margin: 0;
    font-size: 30px;
    font-weight: 900;
  }

  .again-button {
    margin-top: 22px;
  }

  .confetti {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .confetti span {
    position: absolute;
    left: var(--left);
    top: -28px;
    width: 14px;
    height: 24px;
    border-radius: 5px;
    background: #ffffff;
    animation: confettiFall 3s linear infinite;
    animation-delay: var(--delay);
  }

  .confetti span:nth-child(3n) {
    background: #4caf50;
  }

  .confetti span:nth-child(3n + 1) {
    background: #4d96ff;
  }

  @keyframes rewardBurst {
    from {
      opacity: 1;
      transform: rotate(var(--angle)) translate(0) rotate(calc(var(--angle) * -1)) scale(0.7);
    }
    to {
      opacity: 0;
      transform: rotate(var(--angle)) translate(var(--distance)) rotate(calc(var(--angle) * -1)) scale(1.3);
    }
  }

  @keyframes rewardPop {
    0% {
      transform: scale(0.5) rotate(-8deg);
    }
    55% {
      transform: scale(1.12) rotate(4deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes confettiFall {
    from {
      opacity: 1;
      transform: translateY(-30px) rotate(0deg);
    }
    to {
      opacity: 0.8;
      transform: translateY(110vh) rotate(540deg);
    }
  }

  @keyframes floatIcons {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-14px);
    }
  }

  @keyframes buttonPulse {
    0%,
    100% {
      transform: scale(1);
      filter: drop-shadow(0 16px 22px rgba(95, 24, 15, 0.3));
    }
    50% {
      transform: scale(1.045);
      filter: drop-shadow(0 20px 28px rgba(95, 24, 15, 0.36));
    }
  }

  @media (max-width: 380px) {
    .dress-parent {
      padding: 14px;
    }

    .parent-card {
      padding: 18px;
    }

    .weather-preview {
      grid-template-columns: 1fr;
    }

    .thermometer {
      display: none;
    }

    .outfit-grid,
    .dressing-grid,
    .catalog-grid {
      gap: 10px;
    }

    .outfit-tile,
    .dressing-tile {
      min-height: 98px;
    }

    .outfit-tile strong,
    .dressing-visual strong {
      font-size: 20px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: 0.001ms !important;
    }

    .reward-burst,
    .confetti {
      display: none;
    }

    .start-button,
    .again-button,
    .primary-action {
      animation: none !important;
    }
  }
`;

export default DressingApp;
