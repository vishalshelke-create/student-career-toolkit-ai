const STORAGE_KEY = "student-career-toolkit-applications";
const gradeValues = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  D: 1.0,
  F: 0
};

function initApp() {
  initNavigation();
  initCalculator();
  initTracker();
  initAccordion();
}

function initNavigation() {
  const links = Array.from(document.querySelectorAll(".nav-links a"));

  links.forEach((link) => {
    link.addEventListener("click", () => {
      links.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

function initCalculator() {
  const courseRows = document.getElementById("course-rows");
  const addButton = document.getElementById("add-course-btn");
  const scoreDisplay = document.querySelector(".score-display");
  const scoreStatus = document.querySelector(".score-status");

  if (!courseRows || !addButton || !scoreDisplay || !scoreStatus) return;

  function createCourseRow() {
    const row = document.createElement("div");
    row.className = "course-row";
    row.innerHTML = `
      <div class="course-field">
        <label>Course</label>
        <input type="text" class="course-name" placeholder="Algorithms" required>
      </div>
      <div class="course-field">
        <label>Grade</label>
        <select class="course-grade">
          <option value="">Select</option>
          ${Object.keys(gradeValues)
            .map((grade) => `<option value="${grade}">${grade}</option>`)
            .join("")}
        </select>
      </div>
      <div class="course-field">
        <label>Credits</label>
        <input type="number" class="course-credit" min="1" step="0.5" placeholder="3" required>
      </div>
      <button type="button" class="remove-course" aria-label="Remove course">×</button>
    `;

    row.querySelector(".remove-course").addEventListener("click", () => {
      row.remove();
      updateCalculator();
    });

    row.querySelectorAll("input, select").forEach((field) => {
      field.addEventListener("input", updateCalculator);
      field.addEventListener("change", updateCalculator);
    });

    return row;
  }

  function updateCalculator() {
    const rows = Array.from(courseRows.querySelectorAll(".course-row"));
    let weightedPoints = 0;
    let totalCredits = 0;
    let validCourses = 0;

    rows.forEach((row) => {
      const courseName = row.querySelector(".course-name").value.trim();
      const grade = row.querySelector(".course-grade").value;
      const credits = parseFloat(row.querySelector(".course-credit").value);

      if (!courseName || !grade || !Number.isFinite(credits) || credits <= 0) {
        return;
      }

      weightedPoints += gradeValues[grade] * credits;
      totalCredits += credits;
      validCourses += 1;
    });

    if (!validCourses || totalCredits <= 0) {
      scoreDisplay.textContent = "0.00";
      scoreStatus.textContent = "Enter your grades to calculate your technical profile strength.";
      return;
    }

    const cgpa = (weightedPoints / totalCredits).toFixed(2);
    scoreDisplay.textContent = cgpa;
    scoreStatus.textContent = `${validCourses} course${validCourses > 1 ? "s" : ""} contributing to your current estimate.`;
  }

  addButton.addEventListener("click", () => {
    courseRows.appendChild(createCourseRow());
    updateCalculator();
  });

  courseRows.appendChild(createCourseRow());
  updateCalculator();
}

function initTracker() {
  const form = document.getElementById("tracker-form");
  const list = document.getElementById("tracker-list");

  if (!form || !list) return;

  let applications = [];

  function readApplications() {
    try {
      applications = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (error) {
      applications = [];
    }
  }

  function saveApplications() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }

  function renderApplications() {
    if (!applications.length) {
      list.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--muted);">No applications yet.</td></tr>';
      return;
    }

    list.innerHTML = applications
      .map(
        (item) => `
          <tr>
            <td>${item.company}</td>
            <td>${item.role}</td>
            <td>${item.status}</td>
            <td><button type="button" class="btn btn-secondary delete-entry" data-id="${item.id}">Delete</button></td>
          </tr>
        `
      )
      .join("");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const company = document.getElementById("company-name").value.trim();
    const role = document.getElementById("role-title").value.trim();
    const status = document.getElementById("app-status").value;

    if (!company || !role || !status) return;

    readApplications();
    applications.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      company,
      role,
      status
    });
    saveApplications();
    renderApplications();
    form.reset();
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-entry");
    if (!button) return;

    readApplications();
    applications = applications.filter((item) => item.id !== button.dataset.id);
    saveApplications();
    renderApplications();
  });

  readApplications();
  renderApplications();
}

function initAccordion() {
  const items = Array.from(document.querySelectorAll(".accordion-item"));

  items.forEach((item) => {
    const trigger = item.querySelector(".accordion-trigger");
    if (!trigger) return;

    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-expanded", item.classList.contains("active") ? "true" : "false");

    const toggle = () => {
      const shouldOpen = !item.classList.contains("active");

      items.forEach((currentItem) => {
        currentItem.classList.remove("active");
        const currentTrigger = currentItem.querySelector(".accordion-trigger");
        if (currentTrigger) {
          currentTrigger.setAttribute("aria-expanded", "false");
        }
      });

      if (shouldOpen) {
        item.classList.add("active");
        trigger.setAttribute("aria-expanded", "true");
      }
    };

    trigger.addEventListener("click", toggle);
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
