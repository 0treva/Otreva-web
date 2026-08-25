# Otreva

Blog independiente de Otreva y Spiegel, diseñado para una lectura limpia y sin distracciones. La interfaz toma como referencia la claridad editorial de Medium, pero mantiene una identidad propia para ambos autores.

## Contenido

- 11 entradas publicadas por dos autores.
- 10 ensayos de Spiegel migrados desde su [archivo original en Medium](https://spiegel-pablo27.medium.com/), con sus títulos, fechas, contenido, imágenes y enlaces de origen.
- 1 entrada del archivo original de Otreva.
- Filtros por autor, búsqueda de texto y tiempos de lectura calculados a partir del contenido completo.
- Tema claro y oscuro con respeto por la preferencia del sistema.
- Vista individual optimizada para lectura, progreso de página, enlaces para compartir y artículos relacionados.
- Diseño adaptable para escritorio, tableta y móvil.

## Ejecutar localmente

El contenido se carga con `fetch`, por lo que conviene servir la carpeta por HTTP:

```bash
python3 -m http.server 8000
```

Después abre [http://localhost:8000](http://localhost:8000).

## Estructura principal

```text
index.html        Portada y archivo
post.html         Vista individual de lectura
app.js            Búsqueda, filtros, tema y render del archivo
post.js           Render seguro del artículo y metadatos
style.css         Sistema visual y estilos adaptables
blog-data.json    Fuente de contenido
donations.html    Página de apoyo
```

## Añadir una entrada

Agrega un objeto a `blog-data.json` con este formato:

```json
{
  "id": 17,
  "title": "Título",
  "author": "otreva",
  "date": "2026-08-24T12:00:00Z",
  "content": "<p>Contenido del artículo.</p>",
  "content_type": "html",
  "cover": null,
  "tags": ["tema"]
}
```

Los autores admitidos en la interfaz pública son `otreva` y `spiegel`. Para una entrada migrada, se puede incluir `source_url` con la dirección de la publicación original.

## Publicación

El repositorio está preparado para GitHub Pages y conserva el dominio personalizado indicado en `CNAME`.

---

Sin anuncios, sin algoritmos y con espacio para pensar.
