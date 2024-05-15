<h1 align="center" id="title">opedy</h1>

<p id="description">aplikacja do przeprowadzania opedów (( wip ))</p>

  
  
<h2>🤓 Feats</h2>

W tej aplikacji możesz:

*   wylosuj opeda z trzech kategorii !
*   wybierz go po nazwie
*   pełna kontrola nad filmem dzięki zaawansowanej technologii html5 video element
*   zapisuj wyniki graczy
*   wyświatlaj wyniki graczy

<h2>🛠👩‍🏭 Instalacja:</h2>

<p>1. zainstaluj dockera (u siebie)</p>

<p>2. sklonuj repo</p>

```
git clone https://github.com/AdamCala/opedy.git
```

<p>3. w folderze backend stwórz folder video</p>

<p>4. w folderze video stwórz foldery reprezentujące kategorie na które chcesz podzielić video</p>

<p>5. wrzuć video do środka</p>

<p>6. zbuduj kontenery</p>

```
docker-compose build
```

<p>7. odpal kontenery</p>

```
docker-compose up -d
```

<p>8. odwiedź panel szefa na</p>

```
http://localhost:5174/
```

  
  
<h2>🧱 Budulec</h2>

Technologie użyte:

*   Docker 🐋
*   SQLite 📁
*   React ⚛️
*   Vite 💽
*   pyftpdlib 📤
*   Flask 🧪
