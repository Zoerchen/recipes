////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////// Header /////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Verkleinert den Header, beim Scrollen nach unten.
         */
        window.addEventListener("scroll", function() {

            //Wenn runter gescrollt wird, mache eine kleine Version des Headers
            if (window.scrollY > 30)
            {
                document.getElementById("header").classList.add("header-small");    
            }
            else
            {
                document.getElementById("header").classList.remove("header-small");
            }
        })


        ////////////// Suchen /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Alles was passiert, wenn auf das Suchicon im Header geklickt wird.
         */
        document.getElementById("header-left").addEventListener("click", function() {

            // Nach oben Springen, wenn die  neuSuche aktiviert wird
            if (document.getElementById("header").classList.contains("header-small")
                && (document.getElementById("search-field").classList.contains("hidden"))
            ) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }

            //Schließen der Suche -> Suchfeld zurücksetzen, alle Rezepte laden
            if (document.getElementById("search-value").value != "") {
                
                //Suchbegriff leeren
                document.getElementById("search-value").value = "";
                
                //Nach oben springen
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

                // Den Container einmal leeren, damit die Rezepte nicht doppelt angezeigt wernden
                document.getElementById("book").innerHTML = ""

                //Rezepte die der Suchanfrage entsprechen anzeigen
                recipes_all.forEach(loadRecipes); 
            }

            //Menu schließen, wenn es gerade geöffnet ist -> immer nur eins von beiden Offen
            if (!(document.getElementById("menu").classList.contains("hidden"))) 
            {
                closeMenu();
            }

            //Das Suchfeld öffnen und schließen
            if (document.getElementById("search-field").classList.contains("hidden"))
            {
                openSearch()
            }
            else
            {
                closeSearch()
            }

            //Automatisch ins Suchfeld fokussieren
            document.getElementById('search-value').focus();
        })

        /**
         * Überprüft, ob ein Suchbegriff in den Titeln der Rezepte vorhanden ist,
         * und updated die Übersicht der Rezepte nach diesem Kriterium.
         */
        document.getElementById("search-value").addEventListener("input", function() {

            //Bei jeder Änderung im Suchfeld suchbegriff laden
            const search_term = document.getElementById("search-value").value;

            recipes_search = []; //leeren

            //Durch alle Rezepte iterieren und überprüfen ob Suchwort im Titel enthalten ist
            for (const recipe of recipes_all)
            {
                if (recipe.title.toLowerCase().includes(search_term.toLowerCase()))  //Wenn der Rezeptename den suchbegriff beinhaltet ()  
                {
                    recipes_search.push(recipe); //Zu den Rezepten die der Suchanfrage entsprechen hinzufügen    
                }
            }

            // Den Container einmal leeren, damit die Rezepte nicht doppelt angezeigt wernden
            document.getElementById("book").innerHTML = ""

            //Rezepte die der Suchanfrage entsprechen anzeigen
            recipes_search.forEach(loadRecipes);    
        })


        /**
         * Öffne das Suchfeld.
         */
        function openSearch()
        {
            document.getElementById("search-field").classList.remove("hidden");
            document.getElementById("header").classList.add("search-mode");
            document.getElementById("search-icon").classList.add("fa-times");
            document.getElementById("search-icon").classList.remove("fa-search");
        }

        /**
         * Schließe das Suchfeld.
         */
        function closeSearch()
        {
            document.getElementById("search-field").classList.add("hidden");
            document.getElementById("header").classList.remove("search-mode");
            document.getElementById("search-icon").classList.remove("fa-times");
            document.getElementById("search-icon").classList.add("fa-search");
                
            
        }

        /**
         * Verstecke das Suchfeld.
         */
        function hideSearch()
        {
            closeSearch()
            document.getElementById("search-icon").classList.add("hidden"); 
        }

        /**
         * Zeige wieder das Suchfeld.
         */
        function showSearch()
        {
            document.getElementById("search-icon").classList.remove("hidden");
        }


        ////////////// Menu /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Alles was passiert, wenn auf das Menu-Icon im Header geklickt wird,
         */
        document.getElementById("header-right").addEventListener("click", function() {

            //Wenn das Suchfeld offen ist, dieses schließen
            if (!(document.getElementById("search-field").classList.contains("hidden"))) 
            {
                closeSearch();
            }

            //Das Menu öffnen und Schließen
            if (document.getElementById("menu").classList.contains("hidden")) 
            {
                openMenu();
            }
            else
            {
                closeMenu();
            }

        })

        
        /**
         * Das Menu öffnen.
         */
        function openMenu()
        {   
            document.getElementById("menu").classList.remove("hidden");
            document.getElementById("header").classList.add("search-mode");
            document.getElementById("menu-icon").classList.add("fa-times");
            document.getElementById("menu-icon").classList.remove("fa-bars");
        }
        
        /**
         * Das Menu schließen.
         */
        function closeMenu()
        {   
            document.getElementById("menu").classList.add("hidden");
            document.getElementById("header").classList.remove("search-mode");
            document.getElementById("menu-icon").classList.remove("fa-times");
            document.getElementById("menu-icon").classList.add("fa-bars");
        }

        /**
         * Das Menu verstecken.
         */
        function hideMenu()
        {   
            closeMenu();
            document.getElementById("menu-icon").classList.add("hidden");

        }

        /**
         * Das Menu zeigen
         */
        function showMenu()
        {   
            document.getElementById("menu-icon").classList.remove("hidden");

        }


        ///////// Menu-Icons ///////////////////////////////////////////////////////////////////////////////////

        /**
         * Klicken des Menu-Icons: Ein neues Rezept hinzufügen.
         */
        document.getElementById("to-new-recipe").addEventListener("click", async function()
        { 
            //Session anfragen
            const { data: { session } } = await db.auth.getSession()

            //Wenn nicht eingeloggt, dann Alert und abbrechen
            //eigentlich nur als back-up, den symbol sollte gar nicht da sein, wenn ausgeloggt
            if (!session) {
                alert("Du bist nicht autorisiert, Rezepte zu erstellen. Bitte logge dich ein.");
                return
            }

            //Scrollen verboten
            document.body.style.overflow = "hidden";
            

            //neues Rezepte fenster zeigen
            document.getElementById("new-recipe").classList.remove("hidden");


        })

        /**
         * Klicken des Menu-Icons: Zurück zur Rezepteübersicht von der neues Rezept-Seite
         */
        document.getElementById("back").addEventListener("click", async function()
        { 
            //Scrollen erlauben
            document.body.style.overflow = "";


            //neues Rezepte fenster ausblenden
            document.getElementById("new-recipe").classList.add("hidden");

            
            //URL und Meldungen clearen 
            document.getElementById("scrape-url").value = ""; 
            document.getElementById("scrape-errors").textContent = "";

            await updateRecipes();
        })    

        
        
        
        /**
         * Klicken des Menu-Icons: Zurück nach oben.
         */
        document.getElementById("back-to-top").addEventListener("click", function()
        {   
            //Menu schließen
            closeMenu();
            
            //Nach oben scrollen
            window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

        })
        
        /**
         * Klicken des Menu-Icons: Zur Shoppingliste.
         */
        document.getElementById("to-shopping-list").addEventListener("click", function()
        {   
            alert("In Arbeit.");
        })

        ///////// Detail-Menu-Items ///////////////////////////////////////////////////////////////////////////////////

        /**
         * Klicken von <: Vorheriges Rezept anzeigen.
         */
        document.getElementById("previous").addEventListener("click", function()
        {   
            //Den Index auf den Vorherigen setzen (Grenzen werden beachtet)
            currentIndex = Math.max(0, currentIndex - 1); //Vorherigen Index aufrufen (mit Grenze)
            
            //Detailansicht leeren
            clearDetails() 
            
            //Detailansicht des neuen Rezeptes laden
            detailRecipe(currentIndex);
        })

        /**
         * Klicken von Buch-Icon: Zurück zur Rezepteübersicht.
         */
        document.getElementById("back-to-recipes").addEventListener("click", function()
        {   
            detailToRecipes();
        })

        /**
         * Klicken von >: Nächstes Rezept anzeigen.
         */
        document.getElementById("next").addEventListener("click", function()
        {   
            //Den Index auf den Nächsten setzen (Grenzen werden beachtet)
            currentIndex = Math.min(currentIndex + 1, recipes_all.length - 1);
            
            //Detailansicht leeren
            clearDetails() 
            
            //Detailansicht des neuen Rezeptes laden
            detailRecipe(currentIndex);
        })

        /**
         * Klicken von edit-Icon: Das aktuelle Rezept editieren.
         */
        document.getElementById("edit").addEventListener("click", async function()
        {  
            //Session anfragen
            const { data: { session } } = await db.auth.getSession()

            //Wenn nicht eingeloggt, dann Alert und abbrechen
            if (!session) {
                alert("Du bist nicht autorisiert, Rezepte zu bearbeiten. Bitte logge dich ein.");
                return
            } 
        

            //Ändere die Überschrift
            document.getElementById("header-title").textContent = "Rezept bearbeiten";

            //öffne den Edit-Mode
            openEditMode();

            //Lade das aktuelle Rezept in den Edit-Mode
            loadRecipeToEditMode(currentIndex);

            
        })

        /**
         * Klicken von Link-Icon: Den externen Link öffnen.
         */
        document.getElementById("external-link").addEventListener("click", function()
        {   
            //pass (wird in detailRecipes() angehangen)
        })

        /**
         * Klicken von EInkaufs-Icon: Die Einkaufsliste öffnen.
         */
        document.getElementById("to-shopping-list-detail").addEventListener("click", function()
        {   
            alert("In Arbeit.");
        })


        ///////// Edit-Menu-Items ///////////////////////////////////////////////////////////////////////////////////

//!!!
//Hier brauche ich noch Fenster die abfragen ob man wirklich löschen möchte

        /**
         * Klicken Rezept-Speichern buttons,
         * Das Rezept wird gespeichert, also auch so in die Datenbank geschrieben,
         * es wird zurück zur Detailansicht navigiert
         */
        document.getElementById("save").addEventListener("click", async function()
        {   
            
            
            //Rezept speichern
            await saveRecipe();
            
            //Schließe den Editiermodus
            closeEditMode();
            
        })

        /**
         * Klicken von Discard-Icon: Die Änderungen verwerfen und wieder aus dem Editiermodus rausgehen. save undo delete
         */
        document.getElementById("undo").addEventListener("click", function()
        {   
            //Wenn ein neues Rezept erstellt wurde und Undo gemacht werden soll
            if (isNew)
            {
                //Variable zurücksetzen
                isNew = false;    
                //Neues Rezept-seite öffnen
                document.getElementById("new-recipe").classList.remove("hidden");    
                //Editieransicht schließen
                document.getElementById("edit-area").classList.add("hidden");

                //Schließe das Edit-Header-Menu
                document.getElementById("menu-edit").classList.add("hidden");

                //Öffne das scrape menu
                document.getElementById("menu-scrape").classList.remove("hidden");

                //Edit felder leeren
                emptyEditMode();

                //Ändere die Überschrift
                document.getElementById("header-title").textContent = "neues Rezept hinzufügen";
            }
            //Wenn ein Rezept editiert wurde und undo gemacht werden soll
            else
            {
                //Schließe den Editiermodus
                closeEditMode();
            }
            
            
        })

        /**
         * Klicken des Rezept-Löschensbuttons
         */
        document.getElementById("delete").addEventListener("click", function()
        {  
           alert("In Arbeit"); 
        })