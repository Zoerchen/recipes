////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////// Login-In Log-Out /////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        /**
         * Klicken des Log-Zeichen im Header führt zum Login wenn nicht eingeloggt
         * und loggt aus, wenn man ein geloggt ist
         */
        document.getElementById("log").addEventListener("click", async function() {

            //Prüfen, ob eingeloggt oder nicht
            const { data: { session } } = await db.auth.getSession()

            // Wenn eingeloggt
            if (session)
            {
                // ausloggen
                await db.auth.signOut();

                logOut();

                //Seite neu laden
                await updateRecipes();
            }

            //Wenn nicht eingeloggt
            else
            {
                //Login anzeigen
                document.getElementById("login").classList.remove("hidden")  
                //Scrollen verboten
                document.body.style.overflow = "hidden" 
            }
        })


        /**
         * Auf der Log-In-Seite den Button klicken, um sich einzuloggen,
         * prüfen der Eingabe, zurück zur Seite Icon ändern
         */
        document.getElementById("login-btn").addEventListener("click", async function() {
    
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            const { data, error } = await db.auth.signInWithPassword({
                email: email,
                password: password
            })

            if (error)
            {
                // Fehlermeldung anzeigen
                document.getElementById("login-email").classList.add("input-error");
                document.getElementById("login-password").classList.add("input-error");

                document.getElementById("login-email").classList.add("wackel-element");
                document.getElementById("login-password").classList.add("wackel-element");

                // Animation zurücksetzen, damit sie erneut ausgelöst werden kann
                setTimeout(() => {
                    document.getElementById("login-email").classList.remove("wackel-element");
                    document.getElementById("login-password").classList.remove("wackel-element");
                }, 500)
                
            }
            else
            {
                // Login Verstecken
                document.getElementById("login").classList.add("hidden")  
                //Scrollen erlauben
                document.body.style.overflow = ""

                // Fehlermeldung verstecken
                document.getElementById("login-email").classList.remove("input-error");
                document.getElementById("login-password").classList.remove("input-error");

                // Eingabe leeren
                document.getElementById("login-email").value = "";
                document.getElementById("login-password").value = "";

                logIn();

                //Rezepte laden
                await updateRecipes();
            }
        })

        /**
         * Auf der Log-In-Seite den Button klicken, um uneingeloggt fortzufahren
         */
        document.getElementById("not-sign-in").addEventListener("click", async function() {

            //Felder leeren
            document.getElementById("login-email").value = "";
            document.getElementById("login-password").value = "";

            // Login Verstecken
            document.getElementById("login").classList.add("hidden")  
            //Scrollen erlauben
            document.body.style.overflow = ""

            //Rezepte laden
            await updateRecipes();

            // Fehlermeldung entfernen
            document.getElementById("login-email").classList.remove("input-error");
            document.getElementById("login-password").classList.remove("input-error");
        })


        /**
         * Wenn die Seite neu geladen wird, Rezepte laden
         * den Login-Status überprüfen und je nachdem richtiges Symbol anzeigen
         */
        document.addEventListener('DOMContentLoaded', async function() {

            //Login-In Status abrufen
            const { data: { session } } = await db.auth.getSession()
            
            //richtige Session laden
            if (session){ logIn() } else { logOut() }

            //Rezepte laden
            await updateRecipes();
        })

        /**
         * Loggt aus.
         * Verändert die Symbole und ersteckt extra Funktionen.
         */
        function logOut()
        {
            //Icon ändern
            document.getElementById("log").classList.add("fa-sign-in");
            document.getElementById("log").classList.remove("fa-sign-out");

            //Verstecke Funktionen, die nur eingeloggt gehen
            document.getElementById("to-new-recipe-div").classList.add("hidden");
            document.getElementById("edit-div").classList.add("hidden");
        }

        /**
         * Loggt ein.
         * Verändert die Symbole und zeigt extra Funktionen.
         */
        function logIn()
        {
            //logout-zeichen zeigen
            document.getElementById("log").classList.add("fa-sign-out");
            document.getElementById("log").classList.remove("fa-sign-in");

            //Zeige Funktionen, die nur eingeloggt gehen
            document.getElementById("to-new-recipe-div").classList.remove("hidden")
            document.getElementById("edit-div").classList.remove("hidden")
        }

    

        //online https://recipes-dtto.onrender.com/scrape
        //lokal http://localhost:8000/scrape