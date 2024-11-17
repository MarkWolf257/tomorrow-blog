document.body.addEventListener('htmx:responseError', function (event) {
  const toast = document.createElement('div');

  const icon = document.createElement('img');
  icon.setAttribute('src', '/icons/circle-exclamation-solid.svg');
  icon.setAttribute('alt', 'Error Icon');
  icon.setAttribute('width', '32px');
  icon.setAttribute('height', '32px');

  const message = document.createElement('p');
  message.textContent = event.detail.xhr.responseText;

  const close = document.createElement('img');
  close.setAttribute('src', '/icons/xmark-solid.svg');
  close.setAttribute('alt', 'Close Icon');
  close.setAttribute('width', '16px');
  close.setAttribute('height', '16px');

  close.onclick = function () {
    toast.remove();
  }

  toast.appendChild(icon);
  toast.appendChild(message);
  toast.appendChild(close);

  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => { document.getElementById('toast-container').lastChild.remove(); }, 3000);
});