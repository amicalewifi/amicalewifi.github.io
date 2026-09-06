// Page /mentoring : accordéon FAQ + réservation en 3 étapes.
// Le calendrier n'ouvre que les vendredis à venir ; la date et le créneau
// retenus partent avec le formulaire Formspree comme des champs normaux.
(function () {
  "use strict";

  var MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
                "août", "septembre", "octobre", "novembre", "décembre"];
  var WEEKDAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

  function longDate(d) {
    return WEEKDAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
  }

  function initFaq() {
    var triggers = document.querySelectorAll(".mentoring-accordion-trigger");
    Array.prototype.forEach.call(triggers, function (trigger) {
      trigger.addEventListener("click", function () {
        var open = trigger.getAttribute("aria-expanded") === "true";
        // Un seul panneau ouvert à la fois, comme dans la maquette.
        Array.prototype.forEach.call(triggers, function (other) {
          other.setAttribute("aria-expanded", "false");
          document.getElementById(other.getAttribute("aria-controls")).hidden = true;
        });
        if (!open) {
          trigger.setAttribute("aria-expanded", "true");
          document.getElementById(trigger.getAttribute("aria-controls")).hidden = false;
        }
      });
    });
  }

  function initBooking() {
    var form = document.getElementById("mentoring-form");
    if (!form) return;

    var panels = document.querySelectorAll(".mentoring-panel");
    var progress = document.querySelectorAll(".mentoring-progress-item");
    var daysEl = document.getElementById("mentoring-days");
    var monthEl = document.getElementById("mentoring-month");
    var selectedDateEl = document.getElementById("mentoring-selected-date");
    var slotsEl = document.getElementById("mentoring-slots");
    var slotEmptyEl = document.getElementById("mentoring-slot-empty");
    var confirmBtn = document.getElementById("mentoring-confirm");
    var errorEl = document.getElementById("mentoring-error");

    var dateField = document.getElementById("mentoring-date-field");
    var slotField = document.getElementById("mentoring-slot-field");
    var launchedField = document.getElementById("mentoring-launched-field");

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var month = new Date(today.getFullYear(), today.getMonth(), 1);
    var selectedDate = null;
    var selectedSlot = null;

    function showStep(n) {
      Array.prototype.forEach.call(panels, function (p) {
        p.hidden = p.getAttribute("data-panel") !== String(n);
      });
      Array.prototype.forEach.call(progress, function (item) {
        var step = Number(item.getAttribute("data-step"));
        item.classList.toggle("is-current", step === n);
        item.classList.toggle("is-done", step < n);
      });
    }

    function syncConfirm() {
      confirmBtn.disabled = !(selectedDate && selectedSlot);
    }

    var slotButtons = document.querySelectorAll(".mentoring-slot");

    function selectSlot(slot) {
      Array.prototype.forEach.call(slotButtons, function (s) {
        var on = s === slot;
        s.classList.toggle("is-selected", on);
        s.setAttribute("aria-pressed", on ? "true" : "false");
      });
      selectedSlot = slot.getAttribute("data-slot");
      slotField.value = selectedSlot;
      syncConfirm();
    }

    function clearSlot() {
      Array.prototype.forEach.call(slotButtons, function (s) {
        s.classList.remove("is-selected");
        s.setAttribute("aria-pressed", "false");
      });
      selectedSlot = null;
      slotField.value = "";
    }

    function renderMonth() {
      monthEl.textContent = MONTHS[month.getMonth()] + " " + month.getFullYear();
      daysEl.innerHTML = "";

      var first = new Date(month.getFullYear(), month.getMonth(), 1);
      var offset = (first.getDay() + 6) % 7; // grille commençant le lundi
      var dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      var i, cell;

      for (i = 0; i < offset; i++) {
        cell = document.createElement("span");
        cell.className = "mentoring-day is-empty";
        daysEl.appendChild(cell);
      }

      for (i = 1; i <= dim; i++) {
        (function (day) {
          var dt = new Date(month.getFullYear(), month.getMonth(), day);
          var available = dt.getDay() === 5 && dt >= today;
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "mentoring-day";
          btn.textContent = String(day);
          if (!available) {
            btn.disabled = true;
          } else {
            btn.classList.add("is-available");
            btn.setAttribute("aria-label", longDate(dt));
            if (selectedDate && dt.getTime() === selectedDate.getTime()) {
              btn.classList.add("is-selected");
              btn.setAttribute("aria-pressed", "true");
            } else {
              btn.setAttribute("aria-pressed", "false");
            }
            btn.addEventListener("click", function () {
              selectedDate = dt;
              dateField.value = longDate(dt);
              selectedDateEl.textContent = longDate(dt);
              slotEmptyEl.hidden = true;
              slotsEl.hidden = false;
              clearSlot();
              // Un seul créneau proposé : le retenir d'office plutôt que
              // d'imposer un clic sans alternative.
              if (slotButtons.length === 1) { selectSlot(slotButtons[0]); }
              renderMonth();
              syncConfirm();
            });
          }
          daysEl.appendChild(btn);
        })(i);
      }
    }

    // Étape 1 → 2 : on laisse le navigateur signaler les champs manquants.
    document.getElementById("mentoring-to-step-2").addEventListener("click", function () {
      var fields = form.querySelectorAll('[data-panel="1"] [required]');
      var firstInvalid = null;
      Array.prototype.forEach.call(fields, function (f) {
        if (!f.checkValidity() && !firstInvalid) firstInvalid = f;
      });
      if (firstInvalid) {
        firstInvalid.reportValidity();
        return;
      }
      showStep(2);
      renderMonth();
    });

    document.getElementById("mentoring-back").addEventListener("click", function () {
      showStep(1);
    });

    document.getElementById("mentoring-prev-month").addEventListener("click", function () {
      month = new Date(month.getFullYear(), month.getMonth() - 1, 1);
      renderMonth();
    });

    document.getElementById("mentoring-next-month").addEventListener("click", function () {
      month = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      renderMonth();
    });

    Array.prototype.forEach.call(document.querySelectorAll(".mentoring-choice"), function (choice) {
      choice.addEventListener("click", function () {
        Array.prototype.forEach.call(document.querySelectorAll(".mentoring-choice"), function (c) {
          c.classList.remove("is-selected");
          c.setAttribute("aria-pressed", "false");
        });
        choice.classList.add("is-selected");
        choice.setAttribute("aria-pressed", "true");
        launchedField.value = choice.getAttribute("data-launched");
      });
    });

    Array.prototype.forEach.call(slotButtons, function (slot) {
      slot.addEventListener("click", function () { selectSlot(slot); });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!selectedDate || !selectedSlot) return;
      errorEl.hidden = true;
      confirmBtn.disabled = true;

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (!res.ok) throw new Error("Formspree " + res.status);
        document.getElementById("mentoring-done-name").textContent =
          document.getElementById("mentoring-name").value;
        document.getElementById("mentoring-done-project").textContent =
          document.getElementById("mentoring-project").value;
        document.getElementById("mentoring-done-date").textContent =
          longDate(selectedDate) + " à " + selectedSlot.split(" ")[0];
        showStep(3);
      }).catch(function () {
        confirmBtn.disabled = false;
        errorEl.textContent = "Votre réservation n'a pas pu être envoyée. Merci de réessayer ou de nous écrire à hello@amicalewifi.ch.";
        errorEl.hidden = false;
      });
    });
  }

  window.addEventListener("DOMContentLoaded", function () {
    initFaq();
    initBooking();
  });
})();
