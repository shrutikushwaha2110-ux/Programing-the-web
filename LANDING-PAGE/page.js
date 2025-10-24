// page.js

const form = document.getElementById("shortenForm");
const input = document.getElementById("urlInput");
const errorMsg = document.getElementById("errorMsg");
const linksContainer = document.getElementById("linksContainer");

let shortLinks = JSON.parse(localStorage.getItem("shortLinks")) || [];

window.addEventListener("DOMContentLoaded", renderLinks);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userInput = input.value.trim();
  if (!userInput) {
    showError("⚠️ Please enter a valid URL!");
    return;
  }

  clearError();

  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "Shortening...";
  button.classList.add("loading");

  try {
    // ✅ Using is.gd API (free & works everywhere)
    const res = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(userInput)}`);
    const data = await res.json();

    if (data.shorturl) {
      const newLink = {
        original: userInput,
        short: data.shorturl,
      };

      shortLinks.unshift(newLink);
      localStorage.setItem("shortLinks", JSON.stringify(shortLinks));
      renderLinks();

      input.value = "";
    } else {
      showError(`❌ ${data.errormessage || "Unable to shorten this link."}`);
    }

  } catch (err) {
    console.error(err);
    showError("🚫 Network error! Try again later.");
  }

  button.disabled = false;
  button.textContent = "Shorten it!";
  button.classList.remove("loading");
});

function renderLinks() {
  linksContainer.innerHTML = "";

  shortLinks.forEach((link, index) => {
    const box = document.createElement("div");
    box.classList.add("link-box");

    box.innerHTML = `
      <p class="original">${link.original}</p>
      <div class="bottom">
        <a href="${link.short}" target="_blank" class="short">${link.short}</a>
        <button class="copy-btn" data-index="${index}">Copy</button>
      </div>
    `;

    linksContainer.appendChild(box);
  });

  // Copy button logic
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = btn.dataset.index;
      navigator.clipboard.writeText(shortLinks[idx].short);
      btn.textContent = "Copied!";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = "Copy";
        btn.classList.remove("copied");
      }, 1500);
    });
  });
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
  errorMsg.classList.add("show");
}

function clearError() {
  errorMsg.style.display = "none";
  errorMsg.classList.remove("show");
}
