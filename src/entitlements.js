const PLANS = {
  free: {
    name: "Free",
    customOutfitsLimit: 3,
    clothingLibrary: false,
    customPhotos: false,
  },
  pro: {
    name: "Pro",
    customOutfitsLimit: Infinity,
    clothingLibrary: true,
    customPhotos: true,
  },
};

export function isDevMode() {
  if (typeof window === "undefined") return false;
  
  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.endsWith(".local")
  );
}

export function getCurrentPlan(authPlan) {
  if (isDevMode()) {
    return "pro";
  }
  
  return authPlan && PLANS[authPlan] ? authPlan : "free";
}

export function canUseClothingLibrary(plan) {
  if (isDevMode()) return true;
  
  const planConfig = PLANS[plan] || PLANS.free;
  return planConfig.clothingLibrary;
}

export function canUseCustomPhotos(plan) {
  if (isDevMode()) return true;
  
  const planConfig = PLANS[plan] || PLANS.free;
  return planConfig.customPhotos;
}

export function canCreateCustomOutfit(currentCount, plan) {
  if (isDevMode()) return true;
  
  const planConfig = PLANS[plan] || PLANS.free;
  return currentCount < planConfig.customOutfitsLimit;
}

export function getUpgradeMessage(feature, { isSignedIn }) {
  const messages = {
    clothingLibrary: isSignedIn
      ? "Upgrade to Pro to access the clothing library"
      : "Log in with Pro to access the clothing library",
    customPhotos: isSignedIn
      ? "Upgrade to Pro to use custom photos"
      : "Log in with Pro to use custom photos",
    customOutfits: isSignedIn
      ? "Upgrade to Pro to create unlimited custom outfits"
      : "Log in with Pro to create more custom outfits",
  };

  return messages[feature] || "Upgrade to Pro to access this feature";
}
