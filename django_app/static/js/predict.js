// Predict Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('predictionForm');
  const spinner = document.getElementById('spinnerOverlay');
  const resultCard = document.getElementById('resultCard');
  const resultBadge = document.getElementById('resultBadge');
  const resultIcon = document.getElementById('resultIcon');
  const resultText = document.getElementById('resultText');
  const resultDesc = document.getElementById('resultDesc');
  const confSection = document.getElementById('confSection');
  const confValue = document.getElementById('confValue');
  const confBar = document.getElementById('confBar');
  const resultMeta = document.getElementById('resultMeta');
  const resultModelNote = document.getElementById('resultModelNote');
  const resultTimestamp = document.getElementById('resultTimestamp');
  const xaiNarrative = document.getElementById('xaiNarrative');
  const xaiTopFactors = document.getElementById('xaiTopFactors');
  const xaiChartWrap = document.getElementById('xaiChartWrap');
  const xaiChart = document.getElementById('xaiChart');

  /**
   * Update Q-CHAT-10 score based on AQ scores
   */
  function updateQchatFromAq() {
    const qchatInput = document.getElementById('id_qchat_10_score');
    if (!qchatInput) return;
    let total = 0;
    for (let i = 1; i <= 10; i++) {
      const el = document.getElementById(`id_a${i}_score`);
      if (el) total += parseInt(el.value, 10) || 0;
    }
    qchatInput.value = Math.min(10, Math.max(0, total));
  }

  // Attach change listeners to AQ fields
  for (let i = 1; i <= 10; i++) {
    const aqField = document.getElementById(`id_a${i}_score`);
    if (aqField) {
      aqField.addEventListener('change', updateQchatFromAq);
    }
  }
  updateQchatFromAq();

  /**
   * Handle form submission
   */
  form.addEventListener('submit', async (e) => {
    updateQchatFromAq();
    e.preventDefault();

    // Show spinner
    spinner.classList.add('active');

    const formData = new FormData(form);

    try {
      // Get the API endpoint from the form's data attribute or window object
      const apiUrl = form.dataset.apiUrl || document.querySelector('[data-predict-api-url]')?.dataset.predictApiUrl || '/predict/api/';
      
      const resp = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await resp.json();

      if (!resp.ok || data.error) {
        showError(data.error || 'Server error. Please try again.');
        return;
      }

      showResult(data);

    } catch (err) {
      showError('Network error: ' + err.message);
    } finally {
      spinner.classList.remove('active');
    }
  });

  /**
   * Display screening result
   */
  function showResult(data) {
    const isYes = data.prediction === 'YES';

    // Update card class
    resultCard.className = 'result-card ' + (isYes ? 'result-yes' : 'result-no');

    // Update badge
    resultBadge.className = 'result-badge ' + (isYes ? 'yes' : 'no');
    resultIcon.className = isYes ? 'bi bi-exclamation-triangle-fill' : 'bi bi-check-circle-fill';
    resultText.textContent = isYes ? 'You may want to seek guidance' : 'No immediate concerns noted';

    // Description
    resultDesc.textContent = isYes
      ? 'Some developmental patterns suggest it may be worth having a conversation with a healthcare provider. You are not alone — this is a helpful first step.'
      : 'Fewer developmental patterns of concern were noted in this screening. Keep doing what you are doing, and always feel free to discuss any questions with your care team.';
    resultDesc.style.color = isYes ? 'rgba(248,113,113,0.8)' : 'rgba(74,222,128,0.8)';

    // Confidence
    if (data.confidence !== null && data.confidence !== undefined) {
      confSection.style.display = 'block';
      confValue.textContent = data.confidence.toFixed(1) + '%';
      const confWidth = Math.min(data.confidence, 100);
      confBar.style.width = confWidth + '%';
      confBar.className = 'confidence-bar-fill ' + (isYes ? 'danger' : '');
    }

    // Metadata
    resultMeta.style.display = 'flex';
    const now = new Date();
    resultTimestamp.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    resultModelNote.textContent = 'Guidance summary generated';

    // XAI narrative
    if (data.explanation_text) {
      xaiNarrative.style.display = 'block';
      xaiNarrative.innerHTML = data.explanation_text;
    }

    // Top contributing factors
    if (data.top_factors && data.top_factors.length > 0) {
      xaiTopFactors.style.display = 'block';
      let chips = '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.75rem;">';
      data.top_factors.forEach((factor) => {
        const icon = factor.direction === 'increase' ? '↑' : '↓';
        const color = factor.direction === 'increase'
          ? 'rgba(248,113,113,0.15)'
          : 'rgba(74,222,128,0.15)';
        chips += `<div style="background:${color};padding:0.4rem 0.8rem;border-radius:20px;font-size:0.75rem;color:var(--text-primary);font-weight:600;">
          <span style="margin-right:0.3rem;">${icon}</span>${factor.feature}
        </div>`;
      });
      chips += '</div>';
      xaiTopFactors.innerHTML = chips;
    }

    // Contribution chart
    if (data.contrib_chart) {
      xaiChartWrap.style.display = 'block';
      xaiChart.src = `data:image/png;base64,${data.contrib_chart}`;
    }

    // Scroll to result on mobile
    if (window.innerWidth <= 900) {
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Display error message
   */
  function showError(msg) {
    resultCard.className = 'result-card';
    resultBadge.className = 'result-badge pending';
    resultIcon.className = 'bi bi-exclamation-circle';
    resultText.textContent = 'Error';
    resultDesc.style.color = 'var(--danger)';
    resultDesc.textContent = msg;
    confSection.style.display = 'none';
    resultMeta.style.display = 'none';
    xaiNarrative.style.display = 'none';
    xaiTopFactors.style.display = 'none';
    xaiChartWrap.style.display = 'none';
  }
});
