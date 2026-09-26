const quizData = [
  {
    question: "Which statement about stress is most accurate?",
    options: [
      "Stress always means something is wrong with you.",
      "Short-term stress can be a normal response, but persistent stress may need support.",
      "Stress disappears if you ignore it."
    ],
    answer: 1,
    explanation: "Stress is a common human response. The key concern is intensity, duration, and impact on daily life."
  },
  {
    question: "What is a supportive first response when someone shares emotional distress?",
    options: [
      "Immediately compare their situation to yours.",
      "Listen carefully, acknowledge their feelings, and ask what support would help.",
      "Tell them to stop thinking about it."
    ],
    answer: 1,
    explanation: "Support starts with listening and validation before offering advice."
  },
  {
    question: "Which is a healthy boundary practice?",
    options: [
      "Being available all the time no matter your capacity.",
      "Setting clear limits while still being kind and respectful.",
      "Avoiding everyone to prevent difficult conversations."
    ],
    answer: 1,
    explanation: "Boundaries protect wellbeing and make support sustainable."
  }
];

export function initQuiz() {
  const root = document.querySelector("[data-quiz-root]");
  if (!root) {
    return;
  }

  let index = 0;
  let score = 0;
  let selected = null;

  function renderResult() {
    root.innerHTML = `
      <div class="quiz-shell">
        <h3>Your score: ${score} / ${quizData.length}</h3>
        <p>${score >= 2 ? "Strong foundation. Keep learning and sharing this knowledge." : "Good start. Review the explanations and try again."}</p>
        <button class="btn" data-quiz-restart>Restart quiz</button>
      </div>
    `;
    root.querySelector("[data-quiz-restart]").addEventListener("click", () => {
      index = 0;
      score = 0;
      selected = null;
      renderQuestion();
    });
  }

  function renderQuestion() {
    const item = quizData[index];
    const progress = Math.round(((index + 1) / quizData.length) * 100);

    root.innerHTML = `
      <div class="quiz-shell">
        <div>
          <p class="meta">Question ${index + 1} of ${quizData.length}</p>
          <div class="progress-track"><div class="progress-track__fill" style="width:${progress}%;"></div></div>
        </div>
        <h3>${item.question}</h3>
        <div class="quiz-options">
          ${item.options.map((option, optionIndex) => `<button type="button" class="quiz-option" data-option="${optionIndex}">${option}</button>`).join("")}
        </div>
        <div class="form-actions">
          <button class="btn" data-next disabled>Next</button>
        </div>
        <p class="meta" data-explanation aria-live="polite"></p>
      </div>
    `;

    const optionButtons = root.querySelectorAll("[data-option]");
    const nextButton = root.querySelector("[data-next]");
    const explanationEl = root.querySelector("[data-explanation]");

    optionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selected = Number(button.dataset.option);
        optionButtons.forEach((b) => b.classList.remove("is-selected"));
        button.classList.add("is-selected");
        nextButton.disabled = false;
      });
    });

    nextButton.addEventListener("click", () => {
      if (selected === item.answer) {
        score += 1;
      }
      explanationEl.textContent = item.explanation;
      setTimeout(() => {
        index += 1;
        selected = null;
        if (index >= quizData.length) {
          renderResult();
        } else {
          renderQuestion();
        }
      }, 600);
    });
  }

  renderQuestion();
}
