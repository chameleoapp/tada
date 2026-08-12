let visitorId = null;

function getVisitorId() {
  if (visitorId) return visitorId;
  
  try {
    let stored = localStorage.getItem("tada_visitor_id");
    if (!stored) {
      stored = `v_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem("tada_visitor_id", stored);
    }
    visitorId = stored;
    return visitorId;
  } catch (error) {
    console.error("Failed to get visitor ID:", error);
    return `temp_${Date.now()}`;
  }
}

export function trackEvent(eventName, properties = {}, userId = null) {
  try {
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      visitorId: getVisitorId(),
      userId: userId || null,
      properties,
      url: typeof window !== "undefined" ? window.location.href : null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    };
    
    console.log("[Analytics]", event);
    
    return event;
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}
