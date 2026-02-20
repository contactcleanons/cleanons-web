// ============================================================
// CLEANONS LANDING PAGE — CALCULATOR + BOOKING
// ============================================================

var currentStep = 1;
var leadData = { furniture: '', problems: [], name: '', city: '', email: '', phone: '' };
var isSubmitting = false;
var planSelected = false;
var leadTracked = false;

var WEBHOOK_LEAD_NURTURING = 'https://hook.eu2.make.com/lq0mrr4717ddsxpuhah72dyaj5v651kq';
var WEBHOOK_PURCHASE = 'https://hook.eu2.make.com/cwnwzpyevbidkgvro8dtkxtwqi389ler';

// ============================================================
// SCROLL
// ============================================================
function scrollToCalculator() {
    var el = document.getElementById('co-diag-card');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ============================================================
// NAVIGATION
// ============================================================
function coChangeStep(direction) {
    var nextStep = currentStep + direction;

    if (direction === 1 && currentStep === 1) {
        if (!leadData.furniture) { alert("Sélectionnez un meuble."); return; }
    }

    if (direction === 1 && currentStep === 3) {
        if (!coValidateStep3()) return;
        coSubmitLead();
        return;
    }

    coUpdateView(nextStep);
}

function coUpdateView(step) {
    document.querySelector('#co-step-' + currentStep).classList.remove('active');
    currentStep = step;
    document.querySelector('#co-step-' + currentStep).classList.add('active');
    document.getElementById('co-step-number').innerText = currentStep;
    document.getElementById('co-progress').style.width = ((currentStep / 3) * 100) + "%";

    var body = document.getElementById('co-diag-body');
    body.className = 'co-diag-body step-' + currentStep;

    var backBtn = document.getElementById('co-btn-back');
    var nextBtn = document.getElementById('co-btn-next');

    if (backBtn) backBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.innerText = currentStep === 3 ? "Voir Mes Offres" : "Continuer";

    setTimeout(scrollToCalculator, 100);
}

function coSelectOption(card, value) {
    document.querySelectorAll('.co-option-card').forEach(function(c) { c.classList.remove('selected'); });
    card.classList.add('selected');
    leadData.furniture = value;
}

function coTogglePain(item, value) {
    item.classList.toggle('checked');
    var isChecked = item.classList.contains('checked');
    item.setAttribute('aria-checked', isChecked);

    if (leadData.problems.indexOf(value) !== -1) {
        leadData.problems = leadData.problems.filter(function(p) { return p !== value; });
    } else {
        leadData.problems.push(value);
    }
}

// ============================================================
// VALIDATION
// ============================================================
function coValidateStep3() {
    var name = document.getElementById('co-lead-name').value.trim();
    var city = document.getElementById('co-lead-city').value.trim();
    var email = document.getElementById('co-lead-email').value.trim();
    var phone = document.getElementById('co-lead-phone').value.trim();

    var valid = true;
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var cleanPhone = phone.replace(/[\s.\-()]/g, '');
    var phoneRegex = /^(0[1-9])\d{8}$/;

    if (!name || name.length < 2) {
        document.getElementById('co-err-name').style.display = 'block'; valid = false;
    } else { document.getElementById('co-err-name').style.display = 'none'; }

    if (!city || city.length < 2) {
        document.getElementById('co-err-city').style.display = 'block'; valid = false;
    } else { document.getElementById('co-err-city').style.display = 'none'; }

    if (!email || !emailRegex.test(email)) {
        document.getElementById('co-err-email').style.display = 'block'; valid = false;
    } else { document.getElementById('co-err-email').style.display = 'none'; }

    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
        document.getElementById('co-err-phone').style.display = 'block'; valid = false;
    } else { document.getElementById('co-err-phone').style.display = 'none'; }

    if (valid) {
        leadData.name = name;
        leadData.city = city;
        leadData.email = email;
        leadData.phone = phone;
    }

    return valid;
}

// ============================================================
// SOUMISSION LEAD
// ============================================================
function coSubmitLead() {
    if (isSubmitting) return;
    isSubmitting = true;

    var honeypot = document.getElementById('co-lead-website');
    if (honeypot && honeypot.value) { showPricing(); return; }

    document.querySelector('#co-step-3').classList.remove('active');
    document.getElementById('co-diag-footer').style.display = 'none';
    document.getElementById('co-loader').style.display = 'block';

    setTimeout(function() {
        var loader = document.getElementById('co-loader');
        if (loader) loader.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    trackLeadOnce();

    var nurturingData = {
        prenom: leadData.name,
        email: leadData.email,
        telephone: leadData.phone,
        ville: leadData.city,
        meuble: leadData.furniture,
        problemes: leadData.problems.join(', '),
        source: 'Hero Calculateur',
        date_lead: new Date().toISOString(),
        statut: 'lead_sans_choix',
        formule_choisie: ''
    };

    fetch(WEBHOOK_LEAD_NURTURING, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nurturingData)
    })
    .then(function() { showPricing(); })
    .catch(function() { showPricing(); });
}

function trackLeadOnce() {
    if (leadTracked) return;
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead');
        leadTracked = true;
    }
}

function showPricing() {
    setTimeout(function() {
        document.getElementById('co-loader').style.display = 'none';
        document.querySelector('.co-diagnostic-section').style.display = 'none';
        document.getElementById('user-name-display').innerText = leadData.name;
        document.getElementById('pricing-section').classList.add('active');

        setTimeout(function() {
            var h = document.querySelector('.pricing-header');
            if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    }, 1500);
}

// ============================================================
// CHOIX OFFRE + BOOKING CAL.COM
// ============================================================
function coSelectPlan(planName) {
    if (planSelected) return;
    planSelected = true;

    document.querySelectorAll('.btn-choose').forEach(function(btn) { btn.disabled = true; });

    var purchaseData = {
        formule_choisie: planName,
        prenom: leadData.name,
        telephone: leadData.phone,
        ville: leadData.city,
        email: leadData.email,
        meuble: leadData.furniture,
        problemes: leadData.problems.join(', ')
    };

    fetch(WEBHOOK_PURCHASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
    }).catch(function() {});

    var price = 0;
    if (planName.indexOf('ESSENTIEL') !== -1) price = 99;
    else if (planName.indexOf('RENAISSANCE') !== -1) price = 149;
    else if (planName.indexOf('ARMURE') !== -1) price = 249;

    if (typeof fbq !== 'undefined') {
        fbq('track', 'Purchase', { value: price, currency: 'EUR', content_name: planName });
    }

    document.getElementById('pricing-section').classList.remove('active');
    document.getElementById('booking-name-display').innerText = leadData.name;
    document.getElementById('booking-plan-display').innerText = planName;
    document.getElementById('booking-section').classList.add('active');

    var calNotes = buildCalNotes(planName, price);

    Cal("inline", {
        elementOrSelector: "#cal-inline",
        calLink: "cleanons/nettoyage-cleanons" +
            "?name=" + encodeURIComponent(leadData.name) +
            "&email=" + encodeURIComponent(leadData.email) +
            "&notes=" + encodeURIComponent(calNotes),
        config: { layout: "month_view", theme: "light" }
    });

    setTimeout(function() {
        var b = document.querySelector('.booking-confirmation');
        if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// ============================================================
// NOTES DÉTAILLÉES POUR CAL.COM
// ============================================================
function buildCalNotes(planName, price) {
    var fp = price * 2;
    var m = leadData.furniture;
    var fn = getFormuleName(planName);
    var pb = leadData.problems.join(', ') || 'Non précisé';

    var h = leadData.name + ' - ' + leadData.phone + '\n' + m + ' – Formule "' + fn + '"\n\n';
    var d = '';

    if (planName.indexOf('ESSENTIEL') !== -1) {
        d = 'Prestation de nettoyage en surface du ' + m.toLowerCase() + ' comprenant :\n\n'
            + '• Nettoyage en surface du textile\n'
            + '• Produits hypoallergéniques et écologiques\n'
            + '• Séchage 24/48h\n';
    } else if (planName.indexOf('RENAISSANCE') !== -1) {
        d = 'Prestation de nettoyage en profondeur du ' + m.toLowerCase() + ' comprenant :\n\n'
            + '• Pré-traitement ciblé des taches (graisses, auréoles, traces du quotidien)\n'
            + '• Nettoyage complet des tissus par injection-extraction\n'
            + '• Désinfection et assainissement du textile\n'
            + '• Élimination des odeurs incrustées\n'
            + '• Séchage rapide assisté (réduction significative du temps d\'humidité)\n';
    } else if (planName.indexOf('ARMURE') !== -1) {
        d = 'Prestation de nettoyage en profondeur du ' + m.toLowerCase() + ' + protection comprenant :\n\n'
            + '• Pré-traitement ciblé des taches (graisses, auréoles, traces du quotidien)\n'
            + '• Nettoyage complet des tissus par injection-extraction\n'
            + '• Désinfection et assainissement du textile\n'
            + '• Élimination des odeurs incrustées\n'
            + '• Séchage rapide assisté\n'
            + '• Protection textile invisible anti-taches\n'
            + '• Intervention d\'entretien comprise (6 mois à 1 an)\n';
    }

    var p = '\nTarif total : ' + fp + '€\nA votre charge : ' + price + '€\n(50% pris en charge par l\'État)\n';
    var c = '\nProblèmes signalés : ' + pb + '\nVille : ' + leadData.city;

    return h + d + p + c;
}

function getFormuleName(planName) {
    if (planName.indexOf('ESSENTIEL') !== -1) return 'Essentiel';
    if (planName.indexOf('RENAISSANCE') !== -1) return 'Renaissance';
    if (planName.indexOf('ARMURE') !== -1) return 'Armure';
    return planName;
}

function showCallbackConfirm() {
    var f = document.querySelector('.booking-fallback');
    f.innerHTML = '<div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:16px;color:#14532d;font-weight:600;font-size:14px;line-height:1.6;max-width:400px;margin:0 auto;">✅ C\'est noté ! Thierry vous contacte très vite entre 9h-19h.</div>';
}

// INIT
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('co-btn-back').style.visibility = 'hidden';
});
