document.addEventListener("DOMContentLoaded", () => {
  const appElement = document.createElement("h1");
  appElement.textContent = "Welcome to Dynamic Modal Assignment!";
  document.body.appendChild(appElement);
});

const ukForm = document.querySelector(".kam-uk-us");

// Remove Hidden extra uk form?
if (ukForm) {
  ukForm.remove();
}

// Store original forms

const nameForm = document.querySelector(".form-columns-2");
const otherForms = document.getElementsByClassName("form-columns-1");
const emailForm = findFormByText("Work Email*");
const helpYouForm = findFormByText("How can we help you?");

// Consent form replacement
const consentContainer = document.createElement("div");
consentContainer.classList.add("consent-container");
const labelElement = document.createElement("label");
const checkboxInput = document.createElement("input");
checkboxInput.type = "checkbox";
checkboxInput.id = "checkboxForm";
labelElement.appendChild(checkboxInput);
const labelText = document.createTextNode(
  "Yes, I would like to receive updates and other information from Conversion."
);
labelElement.appendChild(labelText);
consentContainer.appendChild(labelElement);
const privacyParagraph = document.createElement("p");
privacyParagraph.textContent =
  "I agree to accept the Privacy Terms relating to UK Data Protection Laws and GDPR.";
consentContainer.appendChild(privacyParagraph);
const receiveUpdatesCheckbox = document.getElementById("checkboxForm");

if (receiveUpdatesCheckbox) {
  receiveUpdatesCheckbox.addEventListener("change", function () {
    if (this.checked) {
      console.log("User agreed to receive updates.");
    } else {
      console.log("User unchecked the updates option.");
    }
  });
}

// store original consent form
// const agreeForm = findFormByText(
//   "Yes, I would like to receive updates and other information from Conversion"
// );

const submitForm = document.querySelector(".hs_submit");
const inputs = document.getElementsByClassName("hs-input");
otherForms;

function filterInputs(inputName) {
  for (const input of inputs) {
    if (input.name == inputName || input.name.includes(inputName)) return input;
  }
  return inputs[0];
}

function findFormByText(targetText) {
  for (const element of otherForms) {
    if (
      element.innerText === targetText ||
      element.innerText.includes(targetText)
    )
      return element;
  }
}

// Remove original forms

const form = document.querySelector(".contact-form__form");
form.innerHTML = "";

// Create section elements
const section = document.createElement("section");
const header = document.createElement("header");
const headerText = document.createElement("h3");
headerText.textContent = "Hello Conversion";
header.appendChild(headerText);

const paragraph = document.createElement("p");
paragraph.textContent = "Click button below to contact us";

const clickHereButton = document.createElement("button");
clickHereButton.setAttribute("class", "contact-us-button");
clickHereButton.textContent = "Click Here";

form.appendChild(header);
form.appendChild(paragraph);
form.appendChild(clickHereButton);

// Create modal elements
const modal = document.createElement("div");
modal.setAttribute("id", "modal");
modal.setAttribute("class", "modal");

const modalContent = document.createElement("div");
modalContent.setAttribute("class", "modal-content");

const closeButton = document.createElement("span");
closeButton.setAttribute("class", "close-button");
closeButton.innerHTML = "&times;";

const multiStepFormContainer = document.createElement("div");
multiStepFormContainer.id = "multiStepFormContainer";

const progressBar = document.createElement("div");
progressBar.id = "progressBar";

const multiStepForm = document.createElement("form");
multiStepForm.id = "multiStepForm";

const step1 = document.createElement("div");
step1.classList.add("step", "step-1", "active");
step1.append(nameForm, emailForm, createNextButton());

const step2 = document.createElement("div");
step2.classList.add("step", "step-2");
step2.append(helpYouForm, consentContainer, createPrevButton(), submitForm);

const step3 = document.createElement("div");
step3.classList.add("step", "step-3");
const thankYouHeading = document.createElement("h2");
thankYouHeading.textContent = "Thank You!";
const thankYouMessage = document.createElement("p");
thankYouMessage.textContent =
  "Your message has been submitted. We will get back to you shortly.";
step3.append(thankYouHeading, thankYouMessage);

multiStepForm.append(step1, step2, step3);
multiStepFormContainer.append(progressBar, multiStepForm);

modalContent.appendChild(closeButton);
modalContent.appendChild(multiStepFormContainer);
modal.appendChild(modalContent);
document.body.appendChild(modal);

// Add event listeners for modal functionality
clickHereButton.addEventListener("click", () => {
  modal.style.display = "block";
});

closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

const progressStepsData = [
  { icon: "👤", text: "User Info" },
  { icon: "❓", text: "Inqury" },
  { icon: "✅", text: "Complete" },
];

progressStepsData.forEach((data, index) => {
  const step = document.createElement("div");
  step.classList.add("progress-step");
  step.dataset.step = index + 1;

  const iconSpan = document.createElement("span");
  iconSpan.classList.add("icon");
  iconSpan.textContent = data.icon;

  const textSpan = document.createElement("span");
  textSpan.classList.add("text");
  textSpan.textContent = data.text;

  step.append(iconSpan, textSpan);
  progressBar.appendChild(step);
});

const progressLine = document.createElement("div");
progressLine.classList.add("progress-line");
const progressLineInner = document.createElement("div");
progressLineInner.style.width = "0%";
progressLine.appendChild(progressLineInner);
progressBar.appendChild(progressLine);

const progressStepsElements = Array.from(
  progressBar.querySelectorAll(".progress-step")
);
const progressLineElement = progressBar.querySelector(".progress-line > div");
const stepsElements = Array.from(multiStepForm.querySelectorAll(".step"));
const nextButtons = Array.from(multiStepForm.querySelectorAll(".next-step"));
const prevButtons = Array.from(multiStepForm.querySelectorAll(".prev-step"));

let currentStep = 1;

function updateProgressBar() {
  progressStepsElements.forEach((step, index) => {
    step.classList.remove("active");
    step.classList.remove("completed");
    const textSpan = step.querySelector(".text");
    textSpan.style.fontWeight = "normal";
    const iconSpan = step.querySelector(".icon");

    // Remove any existing checkmark
    const checkmark = iconSpan.querySelector(".checkmark");
    if (checkmark) {
      checkmark.remove();
    }

    if (currentStep === 3 || index < currentStep - 1) {
      step.classList.add("completed");
      // Add checkmark to completed steps
      const completedCheckmark = document.createElement("span");
      completedCheckmark.classList.add("checkmark");
      iconSpan.appendChild(completedCheckmark);
    } else if (index + 1 === currentStep) {
      step.classList.add("active");
      textSpan.style.fontWeight = "bold";
    }
  });

  const progressWidth =
    ((currentStep - 1) / (stepsElements.length - 1)) * 100 + "%";
  progressLineElement.style.width = progressWidth;
}

function showStep(stepNumber) {
  stepsElements.forEach((step) => step.classList.remove("active"));
  stepsElements[stepNumber - 1].classList.add("active");
  currentStep = stepNumber;
  updateProgressBar();

  prevButtons.forEach((btn) => (btn.disabled = currentStep === 1));
  nextButtons.forEach(
    (btn) =>
      (btn.style.display =
        currentStep === stepsElements.length - 1 ? "none" : "inline-block")
  );

  if (currentStep === stepsElements.length) {
    nextButtons.forEach((btn) => (btn.style.display = "none"));
    prevButtons.forEach((btn) => (btn.style.display = "none"));
  }
}

nextButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      const firstName = filterInputs("firstname").value.trim();
      const lastName = filterInputs("lastname").value.trim();
      const email = filterInputs("email").value.trim();

      if (
        !firstName ||
        !lastName ||
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        alert("Please fill in all fields correctly.");
        return;
      }
    }
    showStep(currentStep + 1);
  });
});

prevButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    showStep(currentStep - 1);
  });
});

multiStepForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Form submitted!");
  showStep(currentStep + 1);
});

// Initial setup
updateProgressBar();
showStep(1);
prevButtons.forEach((btn) => (btn.disabled = true));

function createNextButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("next-step");
  button.textContent = "Next";
  return button;
}

function createPrevButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("prev-step");
  button.textContent = "Previous";
  return button;
}
