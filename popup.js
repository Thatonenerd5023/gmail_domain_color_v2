// popup.js

let overrides = {};

function setStatus(msg, timeout = 1500) {
  const el = document.getElementById("status");
  el.textContent = msg;
  if (timeout) setTimeout(() => (el.textContent = ""), timeout);
}

function save() {
  chrome.storage.sync.set({ overrides }, () => setStatus("Saved."));
}

function renderList() {
  const list = document.getElementById("overrides-list");
  list.innerHTML = "";

  const domains = Object.keys(overrides);
  if (domains.length === 0) {
    list.innerHTML = '<p class="empty-msg">No overrides yet — all colors are auto-assigned.</p>';
    return;
  }

  domains.forEach((domain) => {
    const row = document.createElement("div");
    row.className = "override-row";

    const label = document.createElement("span");
    label.textContent = domain;
    label.title = domain;

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.value = overrides[domain];
    colorPicker.addEventListener("input", (e) => {
      overrides[domain] = e.target.value;
      save();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.title = "Remove override";
    deleteBtn.addEventListener("click", () => {
      delete overrides[domain];
      save();
      renderList();
    });

    row.append(label, colorPicker, deleteBtn);
    list.appendChild(row);
  });
}

document.getElementById("add-btn").addEventListener("click", () => {
  const domainInput = document.getElementById("new-domain");
  const colorInput = document.getElementById("new-color");

  const domain = domainInput.value.trim().toLowerCase().replace(/^@/, "");
  if (!domain) {
    setStatus("Enter a domain first.");
    return;
  }

  overrides[domain] = colorInput.value;
  save();
  renderList();
  domainInput.value = "";
  setStatus(`Added: ${domain}`);
});

// Allow pressing Enter in the domain field to add
document.getElementById("new-domain").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("add-btn").click();
});

// Init
chrome.storage.sync.get("overrides", ({ overrides: saved = {} }) => {
  overrides = saved;
  renderList();
});
