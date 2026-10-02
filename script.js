document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const messageInput = document.getElementById('message');
  const charCount = document.getElementById('char-count');
  const statusDiv = document.getElementById('form-status');

  // Real-time Character Counter
  const maxChars = 500;
  messageInput.addEventListener('input', () => {
    const currentLength = messageInput.value.length;
    charCount.textContent = currentLength;

    if (currentLength > maxChars) {
      charCount.style.color = 'var(--error-color)';
      submitBtn.disabled = true;
    } else {
      charCount.style.color = 'var(--text-muted)';
      submitBtn.disabled = false;
    }
  });

  // Client-Side Email Validation helper
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  // Handle Form Submission via AJAX (fetch API)
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page refresh

    const emailInput = document.getElementById('email').value.trim();
    
    // Quick validation check
    if (!isValidEmail(emailInput)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Update UI state for pending submission
    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    statusDiv.style.display = 'none';

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        showStatus('Thank you! Your message has been sent successfully.', 'success');
        form.reset();
        charCount.textContent = '0';
      } else {
        const data = await response.json();
        if (data.hasOwnProperty('errors')) {
          showStatus(data['errors'].map(error => error['message']).join(', '), 'error');
        } else {
          showStatus('Oops! There was a problem submitting your form.', 'error');
        }
      }
    } catch (error) {
      showStatus('Oops! A network error occurred. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Send Message';
    }
  });

  function showStatus(msg, type) {
    statusDiv.className = `form-status ${type}`;
    statusDiv.textContent = msg;
    statusDiv.style.display = 'block';
  }
});
