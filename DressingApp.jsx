import React, { useEffect, useMemo, useRef, useState } from "react";

const TEMP_MIN = -25;
const TEMP_MAX = 30;
const TEMP_WHEEL_STEP = 5;

const weatherSets = {
  hot: {
    label: "Hot",
    subtitle: "Above +20°C",
    outside: "Hot outside",
    icon: "☀️",
    color: "#FF8A3D",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "socks", name: "Socks", icon: "🧦" },
      { id: "t-shirt", name: "T-shirt", icon: "👕" },
      { id: "shorts", name: "Shorts", icon: "🩳" },
      { id: "sunglasses", name: "Sunglasses", icon: "🕶️" },
      { id: "sun-hat", name: "Sun hat", icon: "🧢" },
      { id: "sandals", name: "Sandals", icon: "👡" },
    ],
  },
  warm: {
    label: "Warm",
    subtitle: "+10 to +20°C",
    outside: "Warm outside",
    icon: "🌤️",
    color: "#FFB13D",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "socks", name: "Socks", icon: "🧦" },
      { id: "long-sleeve-shirt", name: "Long-sleeve shirt", icon: "👕" },
      { id: "pants", name: "Pants", icon: "👖" },
      { id: "hoodie", name: "Hoodie", icon: "🧥" },
      { id: "hat", name: "Hat", icon: "🧢" },
      { id: "sneakers", name: "Sneakers", icon: "👟" },
    ],
  },
  cool: {
    label: "Cool",
    subtitle: "0 to +10°C",
    outside: "Cool outside",
    icon: "🍂",
    color: "#F2C14E",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "socks", name: "Socks", icon: "🧦" },
      { id: "long-sleeve-shirt", name: "Long-sleeve shirt", icon: "👕" },
      { id: "pants", name: "Pants", icon: "👖" },
      { id: "hoodie", name: "Hoodie", icon: "🧥" },
      { id: "jacket", name: "Jacket", icon: "🧥" },
      { id: "hat", name: "Hat", icon: "🧢" },
      { id: "gloves", name: "Gloves", icon: "🧤" },
      { id: "neck-warmer", name: "Neck warmer", icon: "🧣" },
      { id: "shoes", name: "Shoes", icon: "👟" },
    ],
  },
  cold: {
    label: "Cold",
    subtitle: "-10 to 0°C",
    outside: "Cold outside",
    icon: "❄️",
    color: "#6CB6FF",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "socks", name: "Socks", icon: "🧦" },
      { id: "thermal-top", name: "Thermal top", icon: "👕" },
      { id: "thermal-bottoms", name: "Thermal bottoms", icon: "👖" },
      { id: "fleece-layer", name: "Fleece layer", icon: "🧥" },
      { id: "inner-overall", name: "Inner overall", icon: "🧣" },
      { id: "winter-overall", name: "Winter overall", icon: "🧥" },
      { id: "balaclava", name: "Balaclava", icon: "🎭" },
      { id: "neck-warmer", name: "Neck warmer", icon: "🧣" },
      { id: "mittens", name: "Mittens", icon: "🧤" },
      { id: "winter-boots", name: "Winter boots", icon: "🥾" },
    ],
  },
  veryCold: {
    label: "Very cold",
    subtitle: "Below -10°C",
    outside: "Very cold outside",
    icon: "🥶",
    color: "#3E91E5",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "warm-socks", name: "Warm socks", icon: "🧦" },
      { id: "thermal-underwear", name: "Thermal underwear", icon: "🎽" },
      { id: "fleece-layer", name: "Fleece layer", icon: "🧥" },
      { id: "inner-overall", name: "Inner overall", icon: "🧣" },
      { id: "winter-overall", name: "Winter overall", icon: "🧥" },
      { id: "balaclava", name: "Balaclava", icon: "🎭" },
      { id: "winter-hat", name: "Winter hat", icon: "🧢" },
      { id: "neck-warmer", name: "Neck warmer", icon: "🧣" },
      { id: "heavy-mittens", name: "Heavy mittens", icon: "🧤" },
      { id: "winter-boots", name: "Winter boots", icon: "🥾" },
    ],
  },
};

const praiseMessages = [
  "Great job!",
  "You found it!",
  "Dino is proud!",
  "Roar-some!",
  "Keep going!",
];

const sparkleIcons = ["⭐", "✨", "🌟", "🦖", "💛"];
const dinoTypes = ["stego", "trex", "trike", "bronto"];
let sharedAudioContext;

function ClothingArt({ item, size = "medium" }) {
  const [hasError, setHasError] = useState(false);
  const className = `clothing-art clothing-art-${size}`;
  const src = `/clothes/${item.id}.png`;

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

function DinoArt({ type = "stego" }) {
  const [hasError, setHasError] = useState(false);
  const fallback = {
    stego: "🦕",
    trex: "🦖",
    trike: "🦕",
    bronto: "🦕",
  }[type] || "🦖";

  if (hasError) {
    return (
      <span className="dino-art dino-fallback" aria-label={`${type} dinosaur`} role="img">
        {fallback}
      </span>
    );
  }

  return (
    <img
      className="dino-art"
      src={`/dinosaurs/${type}.png`}
      alt={`${type} dinosaur`}
      draggable="false"
      onError={() => setHasError(true)}
    />
  );
}

function getWeatherKey(temp) {
  if (temp > 20) return "hot";
  if (temp >= 10) return "warm";
  if (temp >= 0) return "cool";
  if (temp >= -10) return "cold";
  return "veryCold";
}

function clampTemperature(value) {
  return Math.max(TEMP_MIN, Math.min(TEMP_MAX, value));
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
  const [screen, setScreen] = useState("parent");
  const [temperature, setTemperature] = useState(5);
  const [showNames, setShowNames] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [checkedItems, setCheckedItems] = useState(() => new Set());
  const [reward, setReward] = useState(null);
  const [showAgain, setShowAgain] = useState(false);
  const reducedMotion = useRef(false);
  const thermometerLineRef = useRef(null);
  const isDraggingTemperature = useRef(false);

  const weatherKey = getWeatherKey(temperature);
  const weather = weatherSets[weatherKey];
  const currentItem = weather.items[currentIndex];
  const completedCount = checkedItems.size;
  const progress = Math.round((completedCount / weather.items.length) * 100);
  const celebrationDino = dinoTypes[weather.items.length % dinoTypes.length];

  const thermometerPercent = useMemo(
    () => ((temperature - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100,
    [temperature],
  );

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

    return () => {
      document.head.removeChild(style);
      document.head.removeChild(font);
      motionQuery?.removeEventListener?.("change", syncMotion);
    };
  }, []);

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

  function startOverview() {
    setCheckedItems(new Set());
    setCurrentIndex(0);
    setReward(null);
    setShowAgain(false);
    setScreen("overview");
  }

  function startDressing() {
    setCurrentIndex(0);
    setReward(null);
    setScreen("item");
  }

  function resetApp() {
    setTemperature(5);
    setShowNames(true);
    setCurrentIndex(0);
    setCheckedItems(new Set());
    setReward(null);
    setShowAgain(false);
    setScreen("parent");
  }

  function completeCurrentItem() {
    if (!currentItem || checkedItems.has(currentItem.id)) return;

    playTapSound();
    const message = praiseMessages[Math.floor(Math.random() * praiseMessages.length)];
    const nextChecked = new Set(checkedItems);
    nextChecked.add(currentItem.id);
    setCheckedItems(nextChecked);
    setReward({
      itemId: currentItem.id,
      message,
      dinoType: dinoTypes[currentIndex % dinoTypes.length],
      pieces: Array.from({ length: 10 }, (_, index) => ({
        icon: sparkleIcons[Math.floor(Math.random() * sparkleIcons.length)],
        angle: index * 36,
        distance: 48 + Math.random() * 42,
      })),
    });

    const delay = reducedMotion.current ? 350 : 950;
    window.setTimeout(() => {
      setReward(null);

      if (currentIndex >= weather.items.length - 1) {
        setScreen("done");
        setShowAgain(false);
        playWinSound();
        return;
      }

      setCurrentIndex((index) => index + 1);
    }, delay);
  }

  function renderParentScreen() {
    return (
      <main className="dress-app dress-parent">
        <section className="parent-card" aria-label="Parent setup">
          <p className="eyebrow">For grown-ups</p>
          <h1>Get dressed for outside</h1>
          <p className="intro">Set the temperature, then hand the phone to your child.</p>

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

          <button
            type="button"
            className={`names-toggle ${showNames ? "is-on" : ""}`}
            onClick={() => setShowNames((value) => !value)}
            aria-pressed={showNames}
          >
            <span>Show item names?</span>
            <strong>{showNames ? "Yes" : "No"}</strong>
          </button>

          <button type="button" className="start-button" onClick={startOverview}>
            Show outfit
          </button>
        </section>
      </main>
    );
  }

  function renderOverviewScreen() {
    return (
      <main className="dress-app dress-overview">
        <header className="overview-header">
          <p>{weather.icon} {weather.outside}</p>
          <h2>First, look at everything</h2>
        </header>

        <section className={`outfit-grid ${showNames ? "with-names" : "no-names"}`} aria-label="Full outfit">
          {weather.items.map((item) => (
            <article className="outfit-tile" key={item.id}>
              <ClothingArt item={item} size="small" />
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

  function renderItemScreen() {
    return (
      <main className="dress-app dress-item">
        <header className="item-header">
          <div className="step-count">
            {currentIndex + 1} of {weather.items.length}
          </div>
          <div className="progress-track" aria-label={`Progress ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </header>

        <section className="single-item-card" aria-live="polite">
          <ClothingArt item={currentItem} size="large" />
          {showNames && <h2>{currentItem.name}</h2>}
          {!showNames && <p className="look-text">Find this one</p>}
        </section>

        {reward && (
          <div className="reward-overlay" aria-live="polite">
            <DinoArt type={reward.dinoType} />
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

        <footer className="bottom-action">
          <button
            type="button"
            className="primary-action"
            onClick={completeCurrentItem}
            disabled={Boolean(reward)}
          >
            I put it on
          </button>
        </footer>
      </main>
    );
  }

  function renderDoneScreen() {
    return (
      <main className="dress-app dress-done">
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
            <DinoArt type={celebrationDino} />
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
  if (screen === "item") return renderItemScreen();
  if (screen === "done") return renderDoneScreen();
  return renderParentScreen();
}

const appStyles = `
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
  }

  button {
    cursor: pointer;
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
    padding: 24px;
    border: 2px solid rgba(255, 255, 255, 0.38);
    border-radius: 32px;
    background: rgba(255, 255, 255, 0.14);
    box-shadow: 0 24px 48px rgba(136, 69, 26, 0.2);
    backdrop-filter: blur(8px);
  }

  .eyebrow,
  .intro,
  .range {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
  }

  .parent-card h1 {
    margin: 8px 0 10px;
    font-size: clamp(40px, 11vw, 62px);
    font-weight: 900;
    line-height: 0.98;
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

  .temp-controls button,
  .start-button,
  .again-button,
  .names-toggle,
  .primary-action {
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
  .dress-item,
  .dress-done {
    min-height: 100vh;
    background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%);
  }

  .dress-overview {
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 14px;
    padding: max(18px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
  }

  .overview-header {
    text-align: center;
  }

  .overview-header p,
  .overview-header h2 {
    margin: 0;
  }

  .overview-header p {
    font-size: 22px;
    font-weight: 900;
  }

  .overview-header h2 {
    margin-top: 6px;
    font-size: clamp(34px, 10vw, 54px);
    font-weight: 900;
    line-height: 1;
  }

  .outfit-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    align-content: center;
    overflow-y: auto;
    padding: 2px;
  }

  .outfit-tile {
    display: grid;
    place-items: center;
    min-height: 148px;
    padding: 12px;
    border-radius: 24px;
    background: #ffffff;
    color: #333333;
    text-align: center;
    text-shadow: none;
    box-shadow: 0 12px 24px rgba(127, 69, 32, 0.16);
  }

  .outfit-tile strong {
    margin-top: 8px;
    font-size: 20px;
    font-weight: 900;
    line-height: 1.05;
  }

  .no-names .outfit-tile {
    min-height: 164px;
  }

  .clothing-art {
    display: block;
    object-fit: contain;
    user-select: none;
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

  .primary-action:disabled {
    opacity: 0.72;
  }

  .dress-item {
    position: relative;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 14px;
    height: 100vh;
    overflow: hidden;
    padding: max(18px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
  }

  .item-header {
    display: grid;
    gap: 10px;
  }

  .step-count {
    font-size: 24px;
    font-weight: 900;
    text-align: center;
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

  .single-item-card {
    display: grid;
    place-items: center;
    align-self: stretch;
    padding: 24px;
    border-radius: 36px;
    background: #ffffff;
    color: #333333;
    text-align: center;
    text-shadow: none;
    box-shadow: 0 18px 42px rgba(127, 69, 32, 0.18);
  }

  .single-item-card h2 {
    margin: 18px 0 0;
    font-size: clamp(42px, 11vw, 68px);
    font-weight: 900;
    line-height: 0.98;
  }

  .look-text {
    margin: 18px 0 0;
    font-size: 30px;
    font-weight: 900;
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

  .dino-art {
    position: relative;
    z-index: 2;
    width: min(64vw, 230px);
    height: min(52vw, 190px);
    object-fit: contain;
    user-select: none;
    animation: dinoPop 850ms ease-out both;
  }

  .dino-fallback {
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

  .done-icons .dino-art {
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

  @keyframes dinoPop {
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

    .outfit-grid {
      gap: 10px;
    }

    .outfit-tile {
      min-height: 98px;
    }

    .outfit-tile span {
      font-size: 48px;
    }

    .outfit-tile strong {
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
