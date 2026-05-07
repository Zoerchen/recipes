#import fastapi # das Backend Framework
#import uvicorn # der Server der FastAPI ausführt
from supabase import create_client
from recipe_scrapers import scrape_me # Scraping Package
from recipe_scrapers import SCRAPERS
from recipe_scrapers import scrape_html
from urllib.parse import urlparse
import requests
from recipe_scrapers._exceptions import NoSchemaFoundInWildMode
from datetime import datetime
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

########################################################################################################################################################
##################### FastAPI ##########################################################################################################################
########################################################################################################################################################

app = FastAPI()

# Definiert wie die Anfrage aussehen soll (wir wollen eine url als string)
class ScrapeRequest(BaseModel):
    request_url: str
    token: str


#CORS aktivieren
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://zoerchen.github.io",
        "http://127.0.0.1:5500",  # für lokale Entwicklung
        "http://localhost:5500"    # für lokale Entwicklung],  # später auf deine GitHub Pages URL einschränken
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

########################################################################################################################################################
##################### URL eingeben (lokal) #####################################################################################################################
########################################################################################################################################################

# URL eingeben
#url = "https://www.zaubertopf.de/zimtschnecken-kekse-thermomix-rezept/"
#url = "https://www.zuckerjagdwurst.com/de/rezepte/knuspriger-kartoffelsalat-spargel-veganes-honig-senf-dressing"

########################################################################################################################################################
##################### Hilfsfunktionen ###############################################################################################
########################################################################################################################################################


########## List to String Methode ##########

def to_str(value):
    if isinstance(value, list):
        return ', '.join(str(v) for v in value)
    return str(value) if value else ""


########################################################################################################################################################
##################### Testen, ob Webseite supported wird ###############################################################################################
########################################################################################################################################################

def scrapingRecipe(url):
    # Browser-Header
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    # Webseite ist supported von Scraper
    if SCRAPERS.get(urlparse(url).netloc.replace("www.", "")): # wird die parsed domain der webseite verwendet
        
        print("supported")

        # Das Rezept von der URL scrapen
        scraper = scrape_me(url) 

    # Webseite ist nicht supported vom Scraper
    else:
        # checken ob es ein Rezepteschema gibt
        try:
            # html über requests bekommen
            html = requests.get(url, headers=headers).text
            
            # html scrapen
            scraper = scrape_html(html, org_url=url, wild_mode=True)

            # Webseite hat ein Rezeptschema
            if scraper.schema.data:
                print("Rezeptschema")
            else: print("kein Rezepteschma, aber scrape_html hat irgendwie funktioniert")


        # Webseite hat kein Rezeptschema
        except NoSchemaFoundInWildMode:
            print("Kein Rezeptschema gefunden - manuelle Eingabe nötig")
            # später: Fehlermeldung an die Web-App zurückschicken
        
        # andere Fehler
        except Exception as e:
            print("Anderer Fehler:", e)

########################################################################################################################################################
##################### Rezept Scrapen ###################################################################################################################
########################################################################################################################################################

    # JSON mit allen Informationen erstellen
    json = scraper.to_json() 

    # Funktion, um die Elemente mit Werten zufüllen, falls vorhanden
    def safe_get(json, key):
        try:
            value = json[key]
            return value if value is not None else ""
        except Exception as e:
            print(f"{key} nicht gefunden: {e}")
            return ""

    # Elemente mit Strings füllen
    title        = safe_get(json, "title")
    url          = safe_get(json, "canonical_url")
    image        = safe_get(json, "image")
    description  = safe_get(json, "description")
    yields       = safe_get(json, "yields")
    created = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    changed = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

    #Format: ingredients list
    # List into string
    # Es gibt auch Ingredient_groups (list) mit Infos wofür die Ingredients genutzt werden
    ingredients_get = safe_get(json, "ingredients")
    ingredients = ', '.join(ingredients_get) if ingredients_get else ""


    #time
    #Erstmal die drei möglichen Zeit Angaben holen
    total_time = safe_get(json, "total_time")
    prep_time = safe_get(json, "prep_time")
    cook_time = safe_get(json, "cook_time")
    #und dann als gesamten String vereinen
    time = ""
    time += ("Gesamtzeit: " + str(total_time) + " ") if total_time else ""
    time += ("Vorbereitungszeit: " + str(prep_time) + " ") if prep_time else ""
    time += ("Kochzeit: " + str(cook_time)) if cook_time else ""


    #category soll mit category (string) und keywords (string) gefüllt werden 
    category_get = safe_get(json, "category")
    keywords_get = safe_get(json, "keywords")
    keywords = ', '.join(keywords_get) if keywords_get else ""
    # als string vereinigen
    if (category_get and keywords):
        category = category_get + ", " + keywords
    elif (category_get):
        category = category_get
    elif (keywords):
        category = keywords
    else:
        category = ""

    #instructions (type string)
    # es gibt auch noch instructions_list (list)
    instructions = safe_get(json, "instructions")


    #notes
    language = safe_get(json, "language")
    site_name = safe_get(json, "site_name")
    author = safe_get(json, "author")
    cooking_method = safe_get(json, "cooking_method")
    cuisine = safe_get(json, "cuisine")
    equipment = safe_get(json, "equipment")
    dietary_restrictions = safe_get(json, "dietary_restrictions")
    nutrients = safe_get(json, "nutrients")
    ratings = safe_get(json, "ratings")
    rating_count = safe_get(json, "rating_count")
    #als String vereinigen \n Absatz
    notes = ""
    notes += ("Sprache: " + language +"\n") if language else ""
    notes += ("Seitenname: " + site_name +"\n") if site_name else ""
    notes += ("Autor: " + author +"\n") if author else ""
    notes += ("Methode: " + cooking_method +"\n") if cooking_method else ""
    notes += ("Kochart: " + cuisine +"\n") if cuisine else ""
    notes += ("Equipment: " + equipment +"\n") if equipment else ""
    notes += ("Diät: " + to_str(dietary_restrictions) +"\n") if dietary_restrictions else ""
    notes += ("Nährwerte: " + to_str(nutrients) +"\n")
    notes += ("Bewertung: " + str(ratings) +"\n") if ratings else ""
    notes += ("von: " + str(rating_count) +" Bewertungen") if rating_count else ""

########################################################################################################################################################
##################### Rezept in die Datenbank schreiben ################################################################################################
########################################################################################################################################################

    # Rezept in die Supabase schreiben
    db_service.table("recipes").insert({
        "title": title, "url" : url, "image" : image,
        "description" : description, "ingredients" : ingredients, "yields" : yields,
        "instructions" : instructions, "time" : time, "category" : category,
        "notes" : notes, "created" : created, "changed" : changed
        }).execute()
    



########################################################################################################################################################
##################### FastAPI ##########################################################################################################################
########################################################################################################################################################


# Mit Supabase verbinden
load_dotenv()
url = os.getenv("SUPABASE_URL")
anon_key = os.getenv("SUPABASE_KEY") # Anon key
service_key = os.getenv("SUPABASE_SERVICE_KEY") #Service Role Key
db_anon = create_client(url, anon_key) # für Auth-Prüfung
db_service = create_client(url, service_key) # für Datenbank


@app.post("/scrape")
async def scrape_recipe(request: ScrapeRequest):

    # Prüfen ob der User eingeloggt ist
    token = request.token  # JWT Token vom Browser mitschicken

    
    user = db_anon.auth.get_user(token)

    if not user.user:
        return {"error": "Nicht eingeloggt"}
    
    request_url = request.request_url
    scrapingRecipe(request_url)

    
    return {"success": True, "url": request_url}























