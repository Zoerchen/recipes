//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////// Scraping //////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Das Rezept einer eingegebenden URL scrapen.
 */
async function scrapeRecipe(url) {

    //Session anfragen
    const { data: { session } } = await db.auth.getSession()

    //Wenn nicht eingeloggt, dann Alert und abbrechen
    //nur als Absicherung, da die Funktion nur freigeschaltet sein, sollte, wenn eingeloggt ist
    if (!session) {
        alert("Du bist nicht autorisiert, neue Rezepte zu erstellen.")
        return
    }

    //Warte Nachricht
    document.getElementById("waiting").classList.remove("hidden");
    document.getElementById("waiting-text").textContent = "Das Rezept wird gescraped... Warte noch einen Moment.";
    //Token holen
    const token = session.access_token

    //Das Python-Skript starten, um das Rezept zu scrapen
    const response = await fetch("https://recipes-dtto.onrender.com/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url, token: token })
    })
    const data = await response.json()

    //Überprüfen, ob erfolgreich und Info schreiben.
    if (data.success) {
        document.getElementById("waiting-text").textContent = "Das Rezept wurde erfolgreich gespeichert.";
        document.getElementById("close-waiting").classList.remove("hidden");
        document.getElementById("to-recipe").classList.remove("hidden");

        await updateRecipes();
    }
    else {
        document.getElementById("waiting-text").textContent = "Das Rezept konnte nicht gespeichert werden. Ein Fehler ist aufgetreten: " + data.error;
        document.getElementById("close-waiting").classList.remove("hidden");
    }

}

document.getElementById("close-waiting").addEventListener("click", function () {
    //Wenn nicht erfolgreich gespeichert  zurück zum neue rezepte seite
    if (document.getElementById("to-recipe").classList.contains("hidden")) {
        document.getElementById("waiting").classList.add("hidden");
        document.getElementById("close-waiting").classList.add("hidden");
    }
    //wenn erfolgreich gespeichert alles schließen
    else {
        //Scrollen erlauben
        document.body.style.overflow = "";

        //waiting schließen
        document.getElementById("waiting").classList.add("hidden");
        document.getElementById("close-waiting").classList.add("hidden");
        document.getElementById("to-recipe").classList.add("hidden");


        //neues Rezepte fenster ausblenden
        document.getElementById("new-recipe").classList.add("hidden");


        //URL und Meldungen clearen 
        document.getElementById("scrape-url").value = "";
        document.getElementById("scrape-errors").textContent = "";
    }
})

document.getElementById("to-recipe").addEventListener("click", function () {
    alert("in Arbeit");
})

document.getElementById("scrape-button").addEventListener("click", async function () {
    const url = document.getElementById("scrape-url").value;
    await scrapeRecipe(url)
})





    (async function () {
        const params = new URLSearchParams(window.location.search);
        const importUrl = params.get('import');
        if (!importUrl) return;

        const { data: { session } } = await db.auth.getSession();

        if (!session) {
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
