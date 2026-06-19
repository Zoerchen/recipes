

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////// globale Variablen ///////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let recipes_all = []; // alle Rezepte
let currentIndex = 0; // Der Index von recipe_all des ausgewählten Rezeptes
let recipes_search = []; // alle Rezepte, die einem Suchkriterium entsprechen
let isNew = false; //Rezept ist neu
const url_db = 'https://asbmoywkzznouburpxnl.supabase.co' // Datenbank url
const key_db = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzYm1veXdrenpub3VidXJweG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTYxNzQsImV4cCI6MjA5MzgzMjE3NH0.Wsk_WVoyKXn-e0wWuz6xOUR3e6uMZkDbVF1e8rQK2Wg"

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////// allgemeine Funktionen /////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Verbindung mit Supabase herstellen.
 */
const { createClient } = supabase
const db = createClient(url_db, key_db)
console.log(db)


/**
 * Die Rezepte aus der Database runterladen und in globaler Variable speichern.
 * Dann die Rezepte anzeigen mit loadRecipes()-Funktion.
 */
async function updateRecipes(event) {
    // alle rezepte laden
    const { data, error } = await db
        .from('recipes')
        .select("*")
        .order('title', { ascending: true }) // alphabetisch nach Titel

    recipes_all = data;

    // Den Container einmal leeren, damit die Rezepte nicht doppelt angezeigt wernden
    document.getElementById("book").innerHTML = ""

    //Rezepte anzeigen
    recipes_all.forEach(loadRecipes);
}





////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////// Funktionen auf der Rezepte-Übersicht /////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Rezepte als Karten anzeigen.
 * Nur Bild und Titel.
 */
function loadRecipes(recipe) {
    // Rezeptkarte erstellen
    const recipe_card = document.createElement("div")
    recipe_card.classList.add("card");
    recipe_card.addEventListener("click", function () { clickRecipe(recipes_all.indexOf(recipe)) }); // einn rezept anklicken
    document.getElementById("book").appendChild(recipe_card);

    //Bild hinzufügen
    const card_image = document.createElement("img");
    card_image.src = recipe.image || "https://placehold.co/300x200/transparent/transparent";
    card_image.alt = "Bild kann nicht geladen werden."
    card_image.loading = "lazy"; //Laden auf den sichtbaren Bereich (Viewport) zu beschränken
    recipe_card.appendChild(card_image)

    //Titel hinzufügen
    const card_title = document.createElement("h2");
    if ((recipe.title || "").length > 20) {
        card_title.textContent = recipe.title.slice(0, 20) + "...";
        card_title.dataset.tooltip = recipe.title //damit der ganze Titel angezeigt wird wenn man drauf bleibt
    }
    else {
        card_title.textContent = recipe.title;
    }
    recipe_card.appendChild(card_title)

}

/**
 * Alles was passiert, wenn man eine Rezepte-Karte anklickt.
 * Eine kleine Verzögerung, damit das Klick-Feedback sichtbar ist
 * @param index - Der Index des Angeklickten Rezeptes
 */
function clickRecipe(index) {
    //Zeitliche Verzögerung
    setTimeout(function () {
        //Die Detailansicht des Rezeptes Laden über den Index
        detailRecipe(index);

        //Nach oben Scrollen (Da neue Ansicht geöffnet wird)
        window.scrollTo(0, 0)

        //Rezepteansicht schließen
        document.getElementById("book").classList.add("hidden");

        //Die Icons der Menuleiste im header ändern
        document.getElementById("menu-book").classList.add("hidden");
        document.getElementById("menu-detail").classList.remove("hidden");


        //Verstecke die Suche
        hideSearch();

        //Menu schließen
        closeMenu();

        //Detailansicht öffnen
        document.getElementById("detail-area").classList.remove("hidden");

    }, 200)
}


/**
 * Auf der Neue Rezepte seite, klicken des feldes: Manuell eingeben,
 * öffnet dann eine leere Edit-Seite
 */
document.getElementById("new-recipe-manuell").addEventListener("click", function () {
    //Scrollen erlauben
    document.body.style.overflow = "";

    //Ändere die Überschrift
    document.getElementById("header-title").textContent = "neues Rezept erstellen";

    isNew = true;

    //Nach oben Scrollen (Da neue Ansicht geöffnet wird)
    window.scrollTo(0, 0)

    //Schließe das scrape-Menu
    document.getElementById("menu-scrape").classList.add("hidden");

    //Schließe die scrape-Seite
    document.getElementById("new-recipe").classList.add("hidden");


    //Editansicht öffnen
    openEditMode()



})





////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////// Funktionen, in der Detailübersicht /////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Die Detailansicht schließen und die Rezepteübersicht öffnen.
 */

function detailToRecipes() {
    //Detailsicht ausblenden und leeren
    document.getElementById("detail-area").classList.add("hidden");
    clearDetails()
    //Rezepteübersicht einblenden
    document.getElementById("book").classList.remove("hidden");

    //Suchicon im Header wieder einblenden
    showSearch()

    //Die Icons der Menuleiste im header ändern
    document.getElementById("menu-detail").classList.add("hidden");
    document.getElementById("menu-book").classList.remove("hidden");

    //Menu einklappen
    closeMenu();

    //Wenn die Suche noch aktiv ist, wieder in den Suchmodus:
    if (document.getElementById("search-value").value != "") {
        openSearch();
    }

    //den Titel des Headers wieder verallgemeinern
    document.getElementById("header-title").textContent = "Rezepte";
}


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//Überlegung: Hier könnte man es auch so machen, wenn man im Suchmodus ist, dann
//wird nur durch die gefilterten Rezepte geblättert
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!



/**
 * Die Detailansicht leeren.
 */
function clearDetails() {
    document.getElementById("detail-title").innerHTML = "";
    document.getElementById("detail-url").innerHTML = "";
    document.getElementById("detail-image").innerHTML = "";
    document.getElementById("detail-description").innerHTML = "";
    document.getElementById("detail-ingredients").innerHTML = "";
    document.getElementById("detail-yields").innerHTML = "";
    document.getElementById("detail-instructions").innerHTML = "";
    document.getElementById("detail-time").innerHTML = "";
    document.getElementById("detail-category").innerHTML = "";
    document.getElementById("detail-notes").innerHTML = "";
    document.getElementById("detail-created").innerHTML = "";
    document.getElementById("detail-changed").innerHTML = "";

}


/**
 * Laden der Detailansicht eines ausgewählten Rezeptes.
 * @param index - Der Index in recipes_all des ausgewählten Rezptes
 */
function detailRecipe(index) {
    //Ansicht säubern
    clearDetails();


    //Das Rezept über den Index aus allen Rezepten laden
    const recipe = recipes_all[index];

    //Titel soll im Header angezeigt werden
    document.getElementById("header-title").textContent = recipe.title;

    //Den Index vom Ausgewählten Rezept speichern
    currentIndex = recipes_all.indexOf(recipe);

    //Elemente erzeugen
    const title = document.createElement("p");
    const url = document.createElement("p");
    const image = document.createElement("p");
    const description = document.createElement("p");
    const ingredients = document.createElement("p");
    const yields = document.createElement("p");
    const instructions = document.createElement("p");
    const time = document.createElement("p");
    const category = document.createElement("p");
    const notes = document.createElement("p");
    const created = document.createElement("p");
    const changed = document.createElement("p");

    //Inhalt hinzufügen
    title.textContent = recipe.title;
    url.textContent = recipe.url;
    image.textContent = recipe.image;
    description.textContent = recipe.description;
    ingredients.textContent = recipe.ingredients;
    yields.textContent = recipe.yields;
    instructions.textContent = recipe.instructions;
    time.textContent = recipe.time;
    notes.textContent = recipe.notes;
    created.textContent = recipe.created;
    changed.textContent = recipe.changed;

    //Den Containern anhängen
    document.getElementById("detail-title").appendChild(title);
    document.getElementById("detail-url").appendChild(url);
    document.getElementById("detail-image").appendChild(image);
    document.getElementById("detail-description").appendChild(description);
    document.getElementById("detail-ingredients").appendChild(ingredients);
    document.getElementById("detail-yields").appendChild(yields);
    document.getElementById("detail-instructions").appendChild(instructions);
    document.getElementById("detail-time").appendChild(time);
    document.getElementById("detail-category").appendChild(category);
    document.getElementById("detail-notes").appendChild(notes);
    document.getElementById("detail-created").appendChild(created);
    document.getElementById("detail-changed").appendChild(changed);



    //Link mit icon verbinden
    document.getElementById("external-link").onclick = () => window.open(recipe.url, "_blank");

    //Bild hinzufügen
    const image_real = document.createElement("img");
    image_real.src = recipe.image || "https://placehold.co/300x200/transparent/transparent";
    image_real.loading = "lazy"; //Laden auf den sichtbaren Bereich (Viewport) zu beschränken
    document.getElementById("detail-image").appendChild(image_real)


}

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//Editierfunktion bauen
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

/**
 * Klicken des Editier-Buttons.
 * Das aktuell geladene Rezept wird bearbeitet
 */
function openEditMode() {
    //Öffne das Edit-Header-Menu
    document.getElementById("menu-edit").classList.remove("hidden");

    //Schließe das book-Header-Menu
    document.getElementById("menu-book").classList.add("hidden");

    //Schließe das Detail-Header-Menu
    document.getElementById("menu-detail").classList.add("hidden");

    //Entferne den Menu-Schließe-Button, damit man auf jeden Fall speichert/löscht/verwirft
    document.getElementById("menu-icon").classList.add("hidden");

    //Detailansicht schließen
    document.getElementById("detail-area").classList.add("hidden");

    //Rezepteansicht schließen
    document.getElementById("book").classList.add("hidden");


    //Editieransicht öffnen
    document.getElementById("edit-area").classList.remove("hidden");

}

/**
 * Den Editiermodus beenden und wieder in die Detailansicht zurückgehen.
 */
function closeEditMode() {
    //Detailansicht öffnen
    document.getElementById("detail-area").classList.remove("hidden");
    //Editieransicht schließen
    document.getElementById("edit-area").classList.add("hidden");

    //Schließe das Edit-Header-Menu
    document.getElementById("menu-edit").classList.add("hidden");

    //Füge den Menu-Schließe-Button, wieder hinzu
    document.getElementById("menu-icon").classList.remove("hidden");
    document.getElementById("menu-detail").classList.remove("hidden");

    //Menu schließen
    closeMenu();

    //Ändere die Überschrift
    document.getElementById("header-title").textContent = recipes_all[currentIndex].title;

}

/**
 * Das aktuelle Rezept in den Editiermodus laden.
 */
function loadRecipeToEditMode(index) {
    //Rezept laden
    recipe = recipes_all[index];

    //Das Aktuelle Rezept in den Input einfügen
    document.getElementById("edit-title-input").value = recipe.title;
    document.getElementById("edit-url-input").value = recipe.url;
    document.getElementById("edit-image-input").value = recipe.image;
    document.getElementById("edit-description-input").value = recipe.description;
    document.getElementById("edit-ingredients-input").value = recipe.ingredients;
    document.getElementById("edit-yields-input").value = recipe.yields;
    document.getElementById("edit-instructions-input").value = recipe.instructions;
    document.getElementById("edit-time-input").value = recipe.time;
    document.getElementById("edit-category-input").value = recipe.category;
    document.getElementById("edit-notes-input").value = recipe.notes;
    document.getElementById("edit-created-input").value = recipe.created;
    document.getElementById("edit-changed-input").value = recipe.changed;

}

/**
 * Editiermodus leeren
 */
function emptyEditMode() {
    //Leeren
    document.getElementById("edit-title-input").value = "";
    document.getElementById("edit-url-input").value = "";
    document.getElementById("edit-image-input").value = "";
    document.getElementById("edit-description-input").value = "";
    document.getElementById("edit-ingredients-input").value = "";
    document.getElementById("edit-yields-input").value = "";
    document.getElementById("edit-instructions-input").value = "";
    document.getElementById("edit-time-input").value = "";
    document.getElementById("edit-category-input").value = "";
    document.getElementById("edit-notes-input").value = "";
    document.getElementById("edit-created-input").value = "";
    document.getElementById("edit-changed-input").value = "";

}

/**
 * Das bearbeitete oder neue Rezept sichern.
 */
async function saveRecipe() {

    //Den Input auslesen
    const title = document.getElementById("edit-title-input").value;
    const url = document.getElementById("edit-url-input").value;
    const image = document.getElementById("edit-image-input").value;
    const description = document.getElementById("edit-description-input").value;
    const ingredients = document.getElementById("edit-ingredients-input").value;
    const yields = document.getElementById("edit-yields-input").value;
    const instructions = document.getElementById("edit-instructions-input").value;
    const time = document.getElementById("edit-time-input").value;
    const category = document.getElementById("edit-category-input").value;
    const notes = document.getElementById("edit-notes-input").value;
    const created = document.getElementById("edit-created-input").value;
    const changed = document.getElementById("edit-changed-input").value;

    let currentID;

    //Wenn es ein neues Rezept ist, neu in die Datenbank einfügen
    if (isNew) {
        // In Datenbank schreiben
        const { data, error } = await db //await: Warte bis Supabase reagiert
            .from('recipes')
            .insert({
                title: title, url: url, image: image,
                description: description, ingredients: ingredients, yields: yields,
                instructions: instructions, time: time, category: category,
                notes: notes, created: created, changed: changed
            })
            .select()
            .single();
        console.log(error);

        //die ID des eingefügten Rezeptes laden
        currentID = data.id;

        //Variable zurücksetzen
        isNew = false;
    }
    //Wenn es eine Bearbeitung ist, die Datenbank updaten
    else {
        //Aktuelle ID merken
        currentID = recipes_all[currentIndex].id

        // In Datenbank schreiben
        const { data, error } = await db //await: Warte bis Supabase reagiert
            .from('recipes')
            .update({
                title: title, url: url, image: image,
                description: description, ingredients: ingredients, yields: yields,
                instructions: instructions, time: time, category: category,
                notes: notes, created: created, changed: changed
            })
            .eq('id', currentID)
    }

    //!!!
    // er lädt immer kurz ein anderes Rezept
    //es gibt eine kleine verzögerung die ich nicht finden kann
    //!!!

    //lokale Rezeptdaten neuladen
    await updateRecipes();
    console.log(recipes_all);

    //Den Index aktualisieren (falls er sich geändert hat, durch andere Reihenfolge in db)
    currentIndex = recipes_all.findIndex(r => r.id === currentID);

    // Editierfelder leeren
    emptyEditMode();

    //Detailansicht updaten
    detailRecipe(currentIndex);

}


(async function () {
    const params = new URLSearchParams(window.location.search);
    const importUrl = params.get('import');
    if (!importUrl) return;

    const { data: { session } } = await db.auth.getSession();

    if (!session) {
        document.getElementById("new-recipe").classList.remove("hidden");
        document.getElementById("waiting").classList.remove("hidden");
        document.getElementById("waiting-text").textContent = "Du bist nicht eingeloggt.";
        document.getElementById("close-waiting").classList.remove("hidden");
        return;
    }

    document.getElementById("new-recipe").classList.remove("hidden");
    document.getElementById("scrape-url").value = importUrl;
    await scrapeRecipe(importUrl);
    window.history.replaceState({}, document.title, window.location.pathname);
})();