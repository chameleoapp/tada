const STORAGE_KEY = "tada_custom_photos";

export async function getAllCustomPhotos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to load custom photos:", error);
    return {};
  }
}

export async function saveCustomPhoto(itemId, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const dataUrl = e.target.result;
        const allPhotos = await getAllCustomPhotos();
        allPhotos[itemId] = dataUrl;
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allPhotos));
        resolve(dataUrl);
      } catch (error) {
        console.error("Failed to save custom photo:", error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsDataURL(file);
  });
}

export async function removeCustomPhoto(itemId) {
  try {
    const allPhotos = await getAllCustomPhotos();
    delete allPhotos[itemId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPhotos));
  } catch (error) {
    console.error("Failed to remove custom photo:", error);
  }
}
