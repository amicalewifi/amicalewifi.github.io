window.addEventListener("DOMContentLoaded", function() {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var button = document.getElementById("contact-form-button");
  var status = document.getElementById("contact-form-status");

  function success() {
    form.reset();
    if (button) button.style = "display: none ";
    if (status) status.innerHTML = "Votre message a bien été envoyé. Nous vous contacterons sous peu.";
  }

  function error() {
    if (status) status.innerHTML = "Désolé votre message ne peut pas être envoyé.";
  }

  form.addEventListener("submit", function(ev) {
    ev.preventDefault();
    var data = new FormData(form);
    ajax(form.method, form.action, data, success, error);
  });
});

// helper function for sending an AJAX request

function ajax(method, url, data, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    if (xhr.status === 200) {
      success(xhr.response, xhr.responseType);
    } else {
      error(xhr.status, xhr.response, xhr.responseType);
    }
  };
  xhr.send(data);
}
