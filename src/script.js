const BEARER_TOKEN = "XX|XX";
let alleProdukte = [];

document.addEventListener('DOMContentLoaded', function() {
    // 1. Produkte von der API laden (Aufgabe 1)
    let container = document.getElementById('product-list');
    if (container) {
        // Hier ladet es 12 Produkte
        fetch('https://web-modules.dev/api/v1/products/12', {
            headers: { 'Authorization': 'Bearer ' + BEARER_TOKEN }
        })
            .then(res => res.json())
            .then(data => {
                // Swagger Struktur: Die Produkte liegen im Feld "products"
                alleProdukte = data.products;
                produkteAnzeigen(alleProdukte);
            })
            .catch(err => {
                console.log("Fehler beim API-Laden, nutze lokale Datei als Fallback");
                // Fallback auf lokale Datei, falls API offline
                fetch('products.json')
                    .then(res => res.json())
                    .then(data => {
                        alleProdukte = data;
                        produkteAnzeigen(alleProdukte);
                    });
            });

        // Filter-Logik
        let filterForm = document.querySelector('.Filters');
        if (filterForm) {
            filterForm.addEventListener('submit', function(event) {
                event.preventDefault();
                filterAnwenden();
            });
        }
    }

    // Testimonials von der API laden (Aufgabe 1)
    let testimonialContainer = document.getElementById('testimonial-list');
    if (testimonialContainer) {
        fetch('https://web-modules.dev/api/v1/testimonials/9', {
            headers: { 'Authorization': 'Bearer ' + BEARER_TOKEN }
        })
            .then(res => res.json())
            .then(data => {
                testimonialContainer.innerHTML = ''; // Leeren
                // Swagger Struktur
                data.testimonials.forEach(function(t) {
                    let item = `
                    <li class="Testimonial-Box">
                        <h5 class="Testimonial-Text">${t.quote}</h5>
                        <p class="Testimonial-Name">${t.firstname} ${t.lastname}</p>
                        <p class="Testimonial-Company">${t.company}</p>
                        <img src="${t.avatar}" alt="${t.firstname}" class="Testimonial-Image">
                        <button class="like-btn" onclick="likeFunktion(this, 'testimonial', ${t.id})">
                            ❤️ <span class="like-number">${t.likes_count}</span>
                        </button>
                    </li>`;
                    testimonialContainer.innerHTML += item;
                });
            })
            .catch(err => console.log("Fehler bei Testimonials API"));
    }
});

// Funktion zum Anzeigen der Produkte
function produkteAnzeigen(produkte) {
    let container = document.getElementById('product-list');
    if (!container) return;
    container.innerHTML = '';

    if (produkte.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Keine Produkte gefunden :(</p>';
        return;
    }

    produkte.forEach(function(p) {
        // Hier ist der likes_count von der API (Swagger Feldname)
        let likeCount = p.likes_count !== undefined ? p.likes_count : (p.likes || 0);

        let card = `
            <li>
                <article class="Product-Card">
                    <header>
                        <img class="Product-Image" src="${p.image}" alt="${p.name}">
                        <h3 class="product-name">${p.name}</h3>
                        <p class="product-category"><span>${p.category.name || p.category}</span></p>
                    </header>
                    <section class="Product-Specs">
                        <ul>
                            ${p.description ? `<li>${p.description}</li>` : (p.specs ? p.specs.map(s => `<li>${s}</li>`).join('') : '')}
                        </ul>
                    </section>
                    <footer class="Product-Pricing">
                        <data class="Product-Price">Fr. ${p.price}</data>
                        <button class="like-btn" onclick="likeFunktion(this, 'product', ${p.id})">
                            ❤️ <span class="like-number">${likeCount}</span>
                        </button>
                    </footer>
                </article>
            </li>`;
        container.innerHTML += card;
    });
}

// Like Funktion angepasst an Swagger POST /like
function likeFunktion(btn, type, id) {
    // API verlangt laut Swagger: type (string) und id (integer)
    fetch('https://web-modules.dev/api/v1/like', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + BEARER_TOKEN,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            type: type,
            id: parseInt(id)
        })
    })
        .then(function(res) {
            if (res.ok) {
                let numberSpan = btn.querySelector('.like-number');
                let neueZahl = parseInt(numberSpan.innerText) + 1;
                numberSpan.innerText = neueZahl;
                btn.style.color = 'red';
            }
        })
        .catch(err => console.log("Like Fehler"));
}

// Filter Logik
function filterAnwenden() {
    let kategorieAuswahl = document.querySelector('select[name="Category"]').value;
    let preisAuswahl = document.querySelector('select[name="Price"]').value;
    let gefilterteListe = alleProdukte;

    if (kategorieAuswahl !== "" && kategorieAuswahl !== "ALL") {
        gefilterteListe = gefilterteListe.filter(function(p) {
            // Check für API Struktur (Objekt) oder lokale Struktur (String)
            let catName = p.category.name ? p.category.name : p.category;
            return catName === kategorieAuswahl;
        });
    }

    if (preisAuswahl !== "" && preisAuswahl !== "ALL") {
        gefilterteListe = gefilterteListe.filter(function(p) {
            let preis = p.price;
            // Gestützt an die HTML values: "0-1000", "1001-10000", "10001-1000000"
            if (preisAuswahl === "0-1000") return preis <= 1000;
            if (preisAuswahl === "1001-10000") return preis > 1000 && preis <= 10000;
            if (preisAuswahl === "10001-1000000") return preis > 10000 && preis <= 1000000;
            return true;
        });
    }
    produkteAnzeigen(gefilterteListe);
}

// Navigation / Sidebar
const navBtn = document.getElementById('nav-button');
const sidebar = document.querySelector('.sidebar');
if (navBtn && sidebar) {
    navBtn.addEventListener('click', function() {
        sidebar.classList.toggle('offen');
    });
}

// Formular Validierung
document.getElementById('feedback-form')?.addEventListener('submit', function(event) {
    event.preventDefault();

    // Fehlermeldungen
    document.querySelectorAll('.error-msg').forEach(el => el.innerText = '');
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    var name = document.getElementById('InputName').value.trim();
    var email = document.getElementById('InputEmail').value.trim();
    var comment = document.getElementById('comment').value.trim();
    var designRating = document.querySelector('input[name="design_rating"]:checked')?.value;
    var compRating = document.querySelector('input[name="comp_rating"]:checked')?.value;

    var isValid = true;

    // Validierung Name: Notwendig, 3-100 Zeichen
    if (name.length < 3 || name.length > 100) {
        document.getElementById('error-name').innerText = "Name muss zwischen 3 und 100 Zeichen lang sein.";
        document.getElementById('InputName').classList.add('input-error');
        isValid = false;
    }

    // Validierung E-Mail: Notwendig, Gültigkeit, Max 254 Zeichen
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
        document.getElementById('error-email').innerText = "Gültige E-Mail erforderlich (max. 254 Zeichen).";
        document.getElementById('InputEmail').classList.add('input-error');
        isValid = false;
    }

    // Validierung Ratings: Notwendig
    if (!designRating) {
        document.getElementById('error-design').innerText = "Bitte Design bewerten.";
        isValid = false;
    }
    if (!compRating) {
        document.getElementById('error-comp').innerText = "Bitte Komponenten bewerten.";
        isValid = false;
    }

    // Absenden nur wenn isValid wahr ist
    if (isValid) {
        // Objekt mit den Pflichtfeldern erstellen
        var payload = {
            name: name,
            email: email,
            rating_design: parseInt(designRating),
            rating_components: parseInt(compRating)
        };

        // nur wenn ein Kommentar da ist, füge ich ihn dem Objekt hinzu
        // So wird das Feld "comment" gar nicht erst im JSON mitgeschickt, wenn es leer ist
        if (comment && comment.length > 0) {
            payload.comment = comment;
        }

        fetch('https://web-modules.dev/api/v1/feedback', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + BEARER_TOKEN,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            // Hier schickt es nun das dynamisch erstellte Objekt
            body: JSON.stringify(payload)
        })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(() => {
                alert("Feedback erfolgreich gesendet!");
                document.getElementById('feedback-form').reset();
                showStatistics();
            })
            .catch(() => alert("Fehler beim Senden an den Server."));
    }
});


// Statistik (Aufgabe 4)
function showStatistics() {
    fetch('https://web-modules.dev/api/v1/feedback', {
        headers: { 'Authorization': 'Bearer ' + BEARER_TOKEN, 'Accept': 'application/json' }
    })
        .then(res => res.json())
        .then(json => {
            var feedbacks = json.feedbacks || [];
            var total = feedbacks.length;
            var sumD = 0, sumC = 0;
            feedbacks.forEach(f => { sumD += f.rating_design; sumC += f.rating_components; });

            var statsOutput = document.getElementById('stats-output');
            if (statsOutput) {
                document.getElementById('stats-area').style.display = 'block';
                statsOutput.innerHTML = `
                <p>Anzahl Feedbacks: <strong>${total}</strong></p>
                <table border="1" style="width:100%; border-collapse: collapse;">
                    <tr><th>Kategorie</th><th>Durchschnitt</th></tr>
                    <tr><td>Design</td><td>${total > 0 ? (sumD/total).toFixed(1) : 0}</td></tr>
                    <tr><td>Komponenten</td><td>${total > 0 ? (sumC/total).toFixed(1) : 0}</td></tr>
                </table>`;
            }
        });
}
showStatistics();