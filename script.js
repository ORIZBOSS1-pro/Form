document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnIcon = submitBtn.querySelector('.btn-icon');
  const formStatus = document.getElementById('form-status');

  // Input Fields
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const contactMethodSelect = document.getElementById('contact-method');
  const contactMethodIcon = document.getElementById('contact-method-icon');
  const contactDetailInput = document.getElementById('contact-detail');
  const contactDetailLabel = document.getElementById('contact-detail-label');
  const contactDetailIcon = document.getElementById('contact-detail-icon');
  const subjectInput = document.getElementById('subject');
  const messageInput = document.getElementById('message');
  const consentInput = document.getElementById('consent');

  // Character Counter
  const charCount = document.getElementById('char-count');
  const charCounterWrapper = document.querySelector('.char-counter');
  const MAX_CHARS = 500;

  // File Upload Elements
  const fileInput = document.getElementById('attachment');
  const fileDropArea = document.getElementById('file-drop-area');
  const fileNameDisplay = document.getElementById('file-name');
  const removeFileBtn = document.getElementById('remove-file-btn');
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Contact Method Configuration
  const methodConfigs = {
    'Email': {
      label: 'Preferred Email Address',
      placeholder: 'jane@example.com',
      type: 'email',
      methodIcon: 'fa-regular fa-envelope',
      detailIcon: 'fa-regular fa-at',
      autoFillFrom: () => emailInput.value.trim(),
    },
    'Phone Call': {
      label: 'Phone Number for Call',
      placeholder: '+234 (012) 345-6789',
      type: 'tel',
      methodIcon: 'fa-solid fa-phone',
      detailIcon: 'fa-solid fa-phone-volume',
      autoFillFrom: () => phoneInput.value.trim(),
    },
    'WhatsApp': {
      label: 'WhatsApp Number',
      placeholder: '+234 801 234 5678',
      type: 'tel',
      methodIcon: 'fa-brands fa-whatsapp',
      detailIcon: 'fa-brands fa-whatsapp',
      autoFillFrom: () => phoneInput.value.trim(),
    },
    'Telegram': {
      label: 'Telegram Username or Phone',
      placeholder: '@janedoe or +234 801 234 5678',
      type: 'text',
      methodIcon: 'fa-brands fa-telegram',
      detailIcon: 'fa-brands fa-telegram',
      autoFillFrom: () => '',
    },
    'SMS': {
      label: 'Mobile Number for SMS',
      placeholder: '+234 801 234 5678',
      type: 'tel',
      methodIcon: 'fa-solid fa-comment-sms',
      detailIcon: 'fa-solid fa-mobile-screen-button',
      autoFillFrom: () => phoneInput.value.trim(),
    },
    'Video Call': {
      label: 'Meeting Link or Handle (Zoom / Google Meet)',
      placeholder: 'https://meet.google.com/... or @username',
      type: 'text',
      methodIcon: 'fa-solid fa-video',
      detailIcon: 'fa-solid fa-link',
      autoFillFrom: () => '',
    },
  };

  const syncContactMethodUI = (shouldAutoFill = false) => {
    const selected = contactMethodSelect.value;
    const config = methodConfigs[selected] || methodConfigs['Email'];

    contactMethodIcon.className = `${config.methodIcon} input-icon`;
    contactDetailIcon.className = `${config.detailIcon} input-icon`;
    contactDetailLabel.innerHTML = `${config.label} <span class="required">*</span>`;
    contactDetailInput.placeholder = config.placeholder;
    contactDetailInput.type = config.type;

    if (shouldAutoFill) {
      const suggested = config.autoFillFrom();
      if (suggested && !contactDetailInput.dataset.userEdited) {
        contactDetailInput.value = suggested;
      } else if (!suggested && !contactDetailInput.dataset.userEdited) {
        contactDetailInput.value = '';
      }
    }

    clearError(contactDetailInput, 'contact-detail-error');
  };

  contactDetailInput.addEventListener('input', () => {
    contactDetailInput.dataset.userEdited = contactDetailInput.value.trim() ? 'true' : '';
  });

  contactMethodSelect.addEventListener('change', () => {
    syncContactMethodUI(true);
    if (contactDetailInput.value.trim()) {
      validateField(contactDetailInput);
    }
  });

  // Initialize contact detail UI on load
  syncContactMethodUI(false);

  // 1. Live Character Counter
  messageInput.addEventListener('input', () => {
    const currentLength = messageInput.value.length;
    charCount.textContent = currentLength;

    charCounterWrapper.classList.remove('limit-near', 'limit-reached');
    if (currentLength >= MAX_CHARS) {
      charCounterWrapper.classList.add('limit-reached');
    } else if (currentLength >= MAX_CHARS * 0.85) {
      charCounterWrapper.classList.add('limit-near');
    }
  });

  // 2. File Upload & Drag-and-Drop Handling
  const resetFileUI = () => {
    fileInput.value = '';
    fileNameDisplay.textContent = 'Click to upload or drag and drop';
    removeFileBtn.style.display = 'none';
    clearError(fileInput, 'file-error');
  };

  const handleFileSelect = (file) => {
    if (!file) {
      resetFileUI();
      return true;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(fileInput, 'file-error', 'File exceeds the 5MB size limit.');
      fileInput.value = '';
      fileNameDisplay.textContent = 'Click to upload or drag and drop';
      removeFileBtn.style.display = 'none';
      return false;
    }
    clearError(fileInput, 'file-error');
    const sizeKB = (file.size / 1024).toFixed(1);
    fileNameDisplay.textContent = `${file.name} (${sizeKB} KB)`;
    removeFileBtn.style.display = 'flex';
    return true;
  };

  fileInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
  });

  removeFileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    resetFileUI();
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    fileDropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      fileDropArea.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    fileDropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      fileDropArea.classList.remove('dragover');
    });
  });

  fileDropArea.addEventListener('drop', (e) => {
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      fileInput.files = droppedFiles;
      handleFileSelect(droppedFiles[0]);
    }
  });

  // 3. Validation Helpers
  const setError = (input, errorId, message) => {
    const formGroup = input.closest('.form-group');
    const errorSpan = document.getElementById(errorId);
    formGroup.classList.add('has-error');
    errorSpan.textContent = message;
  };

  const clearError = (input, errorId) => {
    const formGroup = input.closest('.form-group');
    const errorSpan = document.getElementById(errorId);
    formGroup.classList.remove('has-error');
    errorSpan.textContent = '';
  };

  const validateContactDetail = () => {
    const method = contactMethodSelect.value;
    const val = contactDetailInput.value.trim();

    if (!val) {
      setError(contactDetailInput, 'contact-detail-error', 'Please enter your contact details for this method.');
      return false;
    }

    if (method === 'Email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setError(contactDetailInput, 'contact-detail-error', 'Please enter a valid email address.');
        return false;
      }
    } else if (['Phone Call', 'WhatsApp', 'SMS'].includes(method)) {
      if (!/^[+\d\s()-]{7,20}$/.test(val)) {
        setError(contactDetailInput, 'contact-detail-error', 'Please enter a valid phone number.');
        return false;
      }
    } else if (method === 'Telegram') {
      const isHandle = /^@?[a-zA-Z0-9_]{5,32}$/.test(val);
      const isPhone = /^[+\d\s()-]{7,20}$/.test(val);
      if (!isHandle && !isPhone) {
        setError(contactDetailInput, 'contact-detail-error', 'Enter a valid @username or phone number.');
        return false;
      }
    } else if (method === 'Video Call') {
      const isUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(val);
      const isHandle = /^@?[a-zA-Z0-9._-]{3,50}$/.test(val);
      if (!isUrl && !isHandle) {
        setError(contactDetailInput, 'contact-detail-error', 'Enter a valid meeting URL (https://...) or handle.');
        return false;
      }
    }

    clearError(contactDetailInput, 'contact-detail-error');
    return true;
  };

  const validateField = (input) => {
    const val = input.value ? input.value.trim() : '';

    if (input === nameInput) {
      if (!val) {
        setError(input, 'name-error', 'Full name is required.');
        return false;
      }
      if (val.length < 2) {
        setError(input, 'name-error', 'Please enter at least 2 characters.');
        return false;
      }
      clearError(input, 'name-error');
      return true;
    }

    if (input === emailInput) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!val) {
        setError(input, 'email-error', 'Email address is required.');
        return false;
      }
      if (!emailRegex.test(val)) {
        setError(input, 'email-error', 'Please enter a valid email address.');
        return false;
      }
      clearError(input, 'email-error');
      return true;
    }

    if (input === phoneInput) {
      if (val && !/^[+\d\s()-]{7,20}$/.test(val)) {
        setError(input, 'phone-error', 'Please enter a valid phone number.');
        return false;
      }
      clearError(input, 'phone-error');
      return true;
    }

    if (input === contactDetailInput) {
      return validateContactDetail();
    }

    if (input === subjectInput) {
      if (!val) {
        setError(input, 'subject-error', 'Subject is required.');
        return false;
      }
      clearError(input, 'subject-error');
      return true;
    }

    if (input === messageInput) {
      if (!val) {
        setError(input, 'message-error', 'Please enter your message.');
        return false;
      }
      if (val.length < 10) {
        setError(input, 'message-error', 'Message must be at least 10 characters.');
        return false;
      }
      clearError(input, 'message-error');
      return true;
    }

    if (input === consentInput) {
      if (!consentInput.checked) {
        setError(input, 'consent-error', 'You must agree to the privacy policy before submitting.');
        return false;
      }
      clearError(input, 'consent-error');
      return true;
    }

    return true;
  };

  // Real-time validation
  [nameInput, emailInput, phoneInput, contactDetailInput, subjectInput, messageInput].forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.form-group').classList.contains('has-error')) {
        validateField(input);
      }
    });
  });

  consentInput.addEventListener('change', () => validateField(consentInput));

  // 4. AJAX Form Submission via Formspree
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    formStatus.className = 'form-status';
    formStatus.innerHTML = '';

    const isNameValid = validateField(nameInput);
    const isEmailValid = validateField(emailInput);
    const isPhoneValid = validateField(phoneInput);
    const isContactDetailValid = validateField(contactDetailInput);
    const isSubjectValid = validateField(subjectInput);
    const isMessageValid = validateField(messageInput);
    const isConsentValid = validateField(consentInput);

    if (
      !isNameValid ||
      !isEmailValid ||
      !isPhoneValid ||
      !isContactDetailValid ||
      !isSubjectValid ||
      !isMessageValid ||
      !isConsentValid
    ) {
      const firstError = form.querySelector('.has-error input, .has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    btnIcon.className = 'fa-solid fa-circle-notch fa-spin btn-icon';

    try {
      const formData = new FormData(form);
      if (fileInput.files.length === 0) {
        formData.delete('attachment');
      }

      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        formStatus.className = 'form-status success';
        formStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you! Your message has been sent successfully.';
        form.reset();
        delete contactDetailInput.dataset.userEdited;
        syncContactMethodUI(false);
        resetFileUI();
        charCount.textContent = '0';
        charCounterWrapper.classList.remove('limit-near', 'limit-reached');
      } else {
        const data = await response.json();
        const errorMsg = data.errors
          ? data.errors.map((err) => err.message).join(', ')
          : 'Oops! There was a problem submitting your form.';
        throw new Error(errorMsg);
      }
    } catch (error) {
      formStatus.className = 'form-status error';
      formStatus.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${error.message || 'Network error. Please try again later.'}`;
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Send Message';
      btnIcon.className = 'fa-solid fa-paper-plane btn-icon';
    }
  });
});


// Variable to store the install event
let deferredPrompt;
const installBtn = document.getElementById('pwaInstallBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) {
    installBtn.style.display = 'inline-flex';
  }
});
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
}
window.addEventListener('appinstalled', () => {
  if (installBtn) {
    installBtn.style.display = 'none';
  }
  deferredPrompt = null;
  console.log('PWA was successfully installed');
});