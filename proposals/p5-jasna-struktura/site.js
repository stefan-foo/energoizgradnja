// Design preview only: the submit action has no delivery endpoint.
document.documentElement.classList.add('has-js');

document.querySelectorAll('[data-quote]').forEach(form => {
  const english = document.documentElement.lang === 'en';
  const text = (sr, en) => english ? en : sr;
  const service = form.elements.namedItem('service');
  const send = form.querySelector('[data-send-inquiry]');
  const status = form.querySelector('.form-status');
  const summary = form.querySelector('[data-summary]');
  const fields = Array.from(form.querySelectorAll('[required], [type="email"]'));
  const requestedService = new URLSearchParams(window.location.search).get('usluga');
  if (requestedService && Array.from(service.options).some(option => option.value === requestedService)) {
    service.value = requestedService;
  }

  fields.forEach(field => {
    const error = document.createElement('p');
    error.id = field.id + '-error';
    error.className = 'field-error';
    error.hidden = true;
    const descriptions = [field.getAttribute('aria-describedby'), error.id].filter(Boolean);
    field.setAttribute('aria-describedby', descriptions.join(' '));
    field.after(error);
  });

  function validate(fields) {
    const list = summary.querySelector('ul');
    list.replaceChildren();
    const invalid = [];
    fields.forEach(field => {
      field.setCustomValidity(field.required && !field.value.trim() ? text('Popunite ovo polje.', 'Complete this field.') : '');
      const valid = field.checkValidity();
      field.setAttribute('aria-invalid', String(!valid));
      const error = form.querySelector('#' + field.id + '-error');
      error.hidden = valid;
      if (valid) return;
      invalid.push(field);
      error.textContent = field.validity.typeMismatch
        ? text('Unesite ispravnu e-adresu.', 'Enter a valid email address.')
        : text('Popunite ovo polje.', 'Complete this field.');
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#' + field.id;
      link.textContent = form.querySelector('label[for="' + field.id + '"]').textContent;
      link.addEventListener('click', event => { event.preventDefault(); field.focus(); });
      item.append(link);
      list.append(item);
    });
    summary.hidden = invalid.length === 0;
    if (invalid.length) summary.focus();
    return invalid.length === 0;
  }

  form.noValidate = true;
  function readInquiryState() {
    status.hidden = window.location.hash !== '#inquiry-unavailable';
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    status.hidden = true;
    if (!validate(fields)) return;
    status.hidden = false;
    window.location.hash = 'inquiry-unavailable';
  });
  function onEdit(event) {
    if (fields.includes(event.target)) {
      event.target.setCustomValidity('');
      event.target.removeAttribute('aria-invalid');
      form.querySelector('#' + event.target.id + '-error').hidden = true;
    }
  }
  form.addEventListener('input', onEdit);
  form.addEventListener('change', onEdit);
  window.addEventListener('hashchange', readInquiryState);
  readInquiryState();
  send.disabled = false;
});

document.querySelectorAll('[data-diagram]').forEach(diagram => {
  const buttons = diagram.querySelectorAll('[data-supply]');
  const statuses = diagram.querySelectorAll('[data-supply-status]');
  const motion = diagram.querySelector('[data-motion]');
  const english = document.documentElement.lang === 'en';
  motion.addEventListener('click', () => {
    const paused = diagram.classList.toggle('is-paused');
    motion.textContent = paused
      ? (english ? 'Resume animation' : 'Pokreni animaciju')
      : (english ? 'Pause animation' : 'Zaustavi animaciju');
  });

  function setSupply(state) {
    diagram.classList.toggle('is-repair', state === 'repair');
    buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.supply === state));
    });
    statuses.forEach(status => {
      status.hidden = status.dataset.supplyStatus !== state;
    });
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => setSupply(button.dataset.supply));
  });
  function readSupplyState() {
    setSupply(window.location.hash === '#repair' ? 'repair' : 'normal');
  }

  readSupplyState();
  window.addEventListener('hashchange', readSupplyState);
});

document.querySelectorAll('.mobile-menu, .services-menu').forEach(menu => {
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { menu.open = false; });
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
  menu.addEventListener('toggle', () => {
    if (!menu.open) menu.querySelectorAll('details[open]').forEach(child => { child.open = false; });
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) menu.open = false;
  });
});
