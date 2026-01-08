// ===============================================
// PERSONAL E-DIARY - JAVASCRIPT
// Complete functionality with localStorage
// ===============================================

// Global Variables
let entries = [];
let currentEditId = null;
let currentImageData = null;

// DOM Elements - Login Screen
const loginScreen = document.getElementById("loginScreen");
const diaryScreen = document.getElementById("diaryScreen");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

// DOM Elements - Main Diary
const logoutBtn = document.getElementById("logoutBtn");
const entryTitle = document.getElementById("entryTitle");
const entryText = document.getElementById("entryText");
const moodSelector = document.getElementById("moodSelector");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const saveEntryBtn = document.getElementById("saveEntryBtn");
const cancelBtn = document.getElementById("cancelBtn");
const entriesList = document.getElementById("entriesList");
const emptyState = document.getElementById("emptyState");
const entriesCount = document.getElementById("entriesCount");

// ===============================================
// PASSWORD MANAGEMENT
// ===============================================

const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePassword.textContent = "🙈";
  } else {
    passwordInput.type = "password";
    togglePassword.textContent = "👁️";
  }
});

// Simple hash function for password (basic security)
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

// Check if password is set
function isPasswordSet() {
  return localStorage.getItem("diaryPassword") !== null;
}

// Set password (first time)
function setPassword(password) {
  const hashedPassword = hashPassword(password);
  localStorage.setItem("diaryPassword", hashedPassword);
}

// Verify password
function verifyPassword(password) {
  const hashedPassword = hashPassword(password);
  const storedPassword = localStorage.getItem("diaryPassword");
  return hashedPassword === storedPassword;
}

// ===============================================
// LOGIN FUNCTIONALITY
// ===============================================

loginBtn.addEventListener("click", handleLogin);
passwordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleLogin();
  }
});

function handleLogin() {
  const password = passwordInput.value.trim();

  if (password === "") {
    showLoginError("Please enter a password! 🔑");
    return;
  }

  // First time user - set password
  if (!isPasswordSet()) {
    setPassword(password);
    showLoginSuccess();
    return;
  }

  // Verify existing password
  if (verifyPassword(password)) {
    showLoginSuccess();
  } else {
    showLoginError("Incorrect password! Try again 🔐");
    passwordInput.value = "";
    passwordInput.focus();
  }
}

function showLoginError(message) {
  loginError.textContent = message;
  loginError.style.color = "#e74c3c";
  passwordInput.style.borderColor = "#e74c3c";

  // Shake animation
  loginError.style.animation = "shake 0.5s";
  setTimeout(() => {
    loginError.style.animation = "";
  }, 500);
}

function showLoginSuccess() {
  loginError.textContent = "✨ Welcome to your diary!";
  loginError.style.color = "#27ae60";

  // Smooth transition to diary
  setTimeout(() => {
    loginScreen.style.display = "none";
    diaryScreen.style.display = "block";
    loadEntries();
    displayEntries();
  }, 800);
}

// ===============================================
// LOGOUT FUNCTIONALITY
// ===============================================

logoutBtn.addEventListener("click", () => {
  // Confirm before logout
  if (
    confirm("🔒 Lock your diary? You'll need your password to unlock it again.")
  ) {
    diaryScreen.style.display = "none";
    loginScreen.style.display = "flex";
    passwordInput.value = "";
    loginError.textContent = "";
    clearForm();
  }
});

// ===============================================
// ENTRY MANAGEMENT - CREATE/EDIT
// ===============================================

saveEntryBtn.addEventListener("click", saveEntry);

function saveEntry() {
  const title = entryTitle.value.trim();
  const content = entryText.value.trim();
  const mood = moodSelector.value;

  // Validation
  if (content === "") {
    alert("✍️ Please write something in your diary!");
    entryText.focus();
    return;
  }

  const now = new Date();

  // Create or update entry
  if (currentEditId !== null) {
    // Update existing entry
    const entryIndex = entries.findIndex((e) => e.id === currentEditId);
    if (entryIndex !== -1) {
      entries[entryIndex] = {
        ...entries[entryIndex],
        title: title || "Untitled Entry",
        content: content,
        mood: mood,
        image: currentImageData,
        updatedAt: now.toISOString(),
      };
    }
    currentEditId = null;
  } else {
    // Create new entry
    const newEntry = {
      id: Date.now(),
      title: title || "Untitled Entry",
      content: content,
      mood: mood,
      image: currentImageData,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    entries.unshift(newEntry); // Add to beginning (latest first)
  }

  saveEntries();
  displayEntries();
  clearForm();

  // Show success message
  showNotification("💾 Entry saved successfully!");
}

// ===============================================
// IMAGE UPLOAD
// ===============================================

imageUpload.addEventListener("change", handleImageUpload);

function handleImageUpload(e) {
  const file = e.target.files[0];

  if (file) {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("📷 Image size should be less than 5MB!");
      imageUpload.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      currentImageData = event.target.result;
      displayImagePreview(currentImageData);
    };

    reader.readAsDataURL(file);
  }
}

function displayImagePreview(imageData) {
  imagePreview.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "preview-img-wrapper";

  const img = document.createElement("img");
  img.src = imageData;
  img.className = "preview-img";

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-img-btn";
  removeBtn.innerHTML = "×";
  removeBtn.onclick = removeImage;

  wrapper.appendChild(img);
  wrapper.appendChild(removeBtn);
  imagePreview.appendChild(wrapper);
}

function removeImage() {
  currentImageData = null;
  imagePreview.innerHTML = "";
  imageUpload.value = "";
}

// ===============================================
// DISPLAY ENTRIES
// ===============================================

function displayEntries() {
  // Update entries count
  entriesCount.textContent = `${entries.length} ${
    entries.length === 1 ? "entry" : "entries"
  }`;

  // Show/hide empty state
  if (entries.length === 0) {
    entriesList.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  entriesList.innerHTML = "";

  // Display each entry
  entries.forEach((entry) => {
    const entryElement = createEntryElement(entry);
    entriesList.appendChild(entryElement);
  });
}

function createEntryElement(entry) {
  const entryDiv = document.createElement("div");
  entryDiv.className = "entry-item";
  entryDiv.setAttribute("data-id", entry.id);

  // Format date
  const date = new Date(entry.createdAt);
  const dateStr = formatDate(date);
  const timeStr = formatTime(date);

  // Entry HTML
  entryDiv.innerHTML = `
        <div class="entry-header">
            <div class="entry-date-mood">
                <div class="entry-mood">${entry.mood}</div>
                <div class="entry-date">📅 ${dateStr} • ⏰ ${timeStr}</div>
            </div>
        </div>
        <h3 class="entry-title-display">${entry.title}</h3>
        <p class="entry-content">${entry.content}</p>
        ${
          entry.image
            ? `
            <div class="entry-images">
                <img src="${entry.image}" class="entry-img" alt="Diary image">
            </div>
        `
            : ""
        }
        <div class="entry-buttons">
            <button class="btn-edit" onclick="editEntry(${
              entry.id
            })">✏️ Edit</button>
            <button class="btn-delete" onclick="deleteEntry(${
              entry.id
            })">🗑️ Delete</button>
        </div>
    `;

  return entryDiv;
}

// ===============================================
// EDIT ENTRY
// ===============================================

function editEntry(id) {
  const entry = entries.find((e) => e.id === id);

  if (!entry) return;

  // Populate form with entry data
  entryTitle.value = entry.title === "Untitled Entry" ? "" : entry.title;
  entryText.value = entry.content;
  moodSelector.value = entry.mood;

  // Handle image
  if (entry.image) {
    currentImageData = entry.image;
    displayImagePreview(currentImageData);
  } else {
    currentImageData = null;
    imagePreview.innerHTML = "";
  }

  // Set edit mode
  currentEditId = id;
  saveEntryBtn.textContent = "💾 Update Entry";
  cancelBtn.style.display = "inline-block";

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Focus on textarea
  entryText.focus();
}

// ===============================================
// DELETE ENTRY
// ===============================================

function deleteEntry(id) {
  if (
    confirm(
      "🗑️ Are you sure you want to delete this entry? This cannot be undone!"
    )
  ) {
    entries = entries.filter((e) => e.id !== id);
    saveEntries();
    displayEntries();
    showNotification("🗑️ Entry deleted successfully!");
  }
}

// ===============================================
// CANCEL EDIT
// ===============================================

cancelBtn.addEventListener("click", clearForm);

function clearForm() {
  entryTitle.value = "";
  entryText.value = "";
  moodSelector.value = "😊";
  currentImageData = null;
  imagePreview.innerHTML = "";
  imageUpload.value = "";
  currentEditId = null;
  saveEntryBtn.textContent = "💾 Save Entry";
  cancelBtn.style.display = "none";
}

// ===============================================
// LOCAL STORAGE OPERATIONS
// ===============================================

function saveEntries() {
  localStorage.setItem("diaryEntries", JSON.stringify(entries));
}

function loadEntries() {
  const storedEntries = localStorage.getItem("diaryEntries");
  if (storedEntries) {
    entries = JSON.parse(storedEntries);
  }
}

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        font-family: 'Patrick Hand', cursive;
        font-size: 18px;
        animation: slideInRight 0.5s ease-out;
    `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.5s ease-out";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}

// ===============================================
// ANIMATIONS
// ===============================================

// Add CSS animations dynamically
const style = document.createElement("style");
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===============================================
// INITIALIZE APP
// ===============================================

// Check if user is already logged in (session-based)
// Note: This is a simple implementation. For better security,
// implement proper session management

// Focus on password input on load
passwordInput.focus();
