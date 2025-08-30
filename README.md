# Rick and Morty Character Explorer 🚀

Una aplicación web completa que consume la API de Rick and Morty para mostrar información detallada de personajes, implementando conceptos avanzados de JavaScript vanilla, diseño responsivo y mejores prácticas de desarrollo web.

## 🌟 Características Principales

### Funcionalidades Core
- **Grid Responsivo**: Visualización adaptativa de personajes (1-6 columnas según dispositivo)
- **Búsqueda en Tiempo Real**: Filtrado instantáneo por nombre con debounce
- **Filtros Avanzados**: Por estado (vivo/muerto/desconocido) y especie
- **Paginación Inteligente**: Navegación eficiente entre páginas de resultados
- **Modal Detallado**: Información completa con navegación entre personajes
- **Modo Oscuro/Claro**: Toggle de tema con persistencia en localStorage

### Características UX/UI
- **Loading Spinners**: Indicadores visuales durante cargas
- **Manejo de Errores**: Mensajes informativos y opciones de reintento
- **Lazy Loading**: Carga optimizada de imágenes
- **Back to Top**: Botón flotante para navegación rápida
- **Animaciones Suaves**: Transiciones CSS para mejor experiencia
- **Accesibilidad**: Navegación por teclado y indicadores visuales

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño moderno con Grid, Flexbox y Custom Properties
- **JavaScript ES6+**: Vanilla JS con clases, async/await, y módulos
- **Rick and Morty API**: Fuente de datos externa
- **Local Storage**: Persistencia de preferencias
- **Intersection Observer**: Lazy loading optimizado

## 📁 Estructura del Proyecto

```
RickAndMortyWeb/
├── index.html              # Página principal
├── css/
│   ├── styles.css          # Estilos principales
│   └── responsive.css      # Media queries y responsividad
├── js/
│   ├── main.js            # Lógica principal de la aplicación
│   ├── api.js             # Manejo de peticiones a la API
│   └── utils.js           # Funciones utilitarias
├── assets/
│   └── images/            # Recursos gráficos
└── README.md              # Documentación
```

## 🚀 Instalación y Uso

### Requisitos Previos
- Navegador web moderno (Chrome 60+, Firefox 55+, Safari 12+)
- Conexión a internet para consumir la API

### Instalación
1. **Clonar o descargar** el proyecto
2. **Abrir** `index.html` en un navegador web
3. **¡Listo!** La aplicación se carga automáticamente

### Uso Local con Servidor
Para mejor rendimiento y evitar problemas de CORS:

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (npx)
npx serve .

# Con PHP
php -S localhost:8000
```

Luego visita `http://localhost:8000`

## 🎯 Funcionalidades Detalladas

### 1. Búsqueda y Filtrado
- **Búsqueda por nombre**: Filtrado en tiempo real con debounce (500ms)
- **Filtro por estado**: Vivo, Muerto, Desconocido
- **Filtro por especie**: Dropdown dinámico con todas las especies disponibles
- **Limpiar filtros**: Botón para resetear todos los filtros

### 2. Visualización de Personajes
- **Tarjetas informativas**: Imagen, nombre, estado, especie y origen
- **Indicadores visuales**: Colores para estados (verde/rojo/naranja)
- **Hover effects**: Animaciones suaves al pasar el mouse
- **Click para detalles**: Acceso rápido al modal

### 3. Modal de Detalles
- **Información completa**: Todos los datos del personaje
- **Lista de episodios**: Primeros 5 episodios con formato legible
- **Navegación**: Botones anterior/siguiente entre personajes
- **Cierre múltiple**: Click fuera, botón X, o tecla Escape

### 4. Paginación
- **Navegación intuitiva**: Botones anterior/siguiente
- **Páginas numeradas**: Con puntos suspensivos para muchas páginas
- **Página actual**: Destacada visualmente
- **Scroll automático**: Al cambiar página

### 5. Tema Oscuro/Claro
- **Toggle visual**: Icono de luna/sol
- **Persistencia**: Guarda preferencia en localStorage
- **Transiciones suaves**: Cambio gradual entre temas

## 💻 Conceptos JavaScript Implementados

### Programación Orientada a Objetos
```javascript
class RickAndMortyApp {
  constructor() {
    this.currentPage = 1;
    this.currentFilters = {};
    // ...
  }
}
```

### Async/Await y Manejo de Promesas
```javascript
async loadCharacters() {
  try {
    const response = await api.searchCharacters(this.currentFilters);
    this.renderCharacters(response.results);
  } catch (error) {
    this.handleError(error);
  }
}
```

### Métodos de Array
```javascript
// map() para transformar datos
const episodeIds = character.episode.map(url => extractIdFromUrl(url));

// filter() para filtrar resultados
const validIds = episodeIds.filter(id => id !== null);

// forEach() para iteraciones
characters.forEach((character, index) => {
  const card = this.createCharacterCard(character, index);
});
```

### Destructuring y Template Literals
```javascript
const { name, status, species, origin } = character;
const cardHTML = `
  <h3>${name}</h3>
  <p>Estado: ${status}</p>
  <p>Especie: ${species}</p>
`;
```

### Event Handling Avanzado
```javascript
// Debounce para optimizar búsquedas
const debouncedSearch = Utils.debounce(() => this.handleSearch(), 500);

// Event delegation
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('detail-btn')) {
    this.showCharacterModal(e.target.dataset.characterId);
  }
});
```

## 🎨 Diseño y UX

### Paleta de Colores
- **Primario**: `#00b4d8` (Azul Rick and Morty)
- **Secundario**: `#90e0ef` (Azul claro)
- **Acento**: `#f72585` (Rosa/Magenta)
- **Estados**:
  - Vivo: `#28a745` (Verde)
  - Muerto: `#dc3545` (Rojo)
  - Desconocido: `#fd7e14` (Naranja)

### Responsive Breakpoints
- **Mobile**: < 576px (1 columna)
- **Tablet**: 576px - 991px (2-3 columnas)
- **Desktop**: 992px - 1199px (4 columnas)
- **Large**: 1200px+ (5-6 columnas)

### Tipografía
- **Fuente principal**: Inter (Google Fonts)
- **Fallbacks**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

## ⚡ Optimizaciones de Rendimiento

### Caché Inteligente
```javascript
class RickAndMortyAPI {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }
}
```

### Debounce en Búsquedas
```javascript
const debouncedSearch = Utils.debounce(() => this.handleSearch(), 500);
```

### Lazy Loading de Imágenes
```javascript
function lazyLoadImage(img, src) {
  const observer = new IntersectionObserver((entries) => {
    // Cargar imagen cuando sea visible
  });
}
```

### Throttle en Scroll
```javascript
const throttledScroll = Utils.throttle(() => this.handleScroll(), 100);
```

## 🔧 API de Rick and Morty

### Endpoints Utilizados
- **Personajes**: `https://rickandmortyapi.com/api/character`
- **Búsqueda**: `https://rickandmortyapi.com/api/character?name={name}`
- **Filtros**: `https://rickandmortyapi.com/api/character?status={status}&species={species}`
- **Episodios**: `https://rickandmortyapi.com/api/episode/{id}`

### Manejo de Errores
```javascript
try {
  const response = await api.getCharacters();
} catch (error) {
  const userMessage = APIHelpers.handleAPIError(error);
  Utils.showError(userMessage);
}
```

## 🧪 Testing y Debugging

### Console Logging
La aplicación incluye logging detallado para debugging:
```javascript
console.log('Cargando personajes:', filters);
console.error('Error en API:', error);
```

### Error Boundaries
Manejo global de errores no capturados:
```javascript
window.addEventListener('unhandledrejection', (e) => {
  console.error('Promesa rechazada:', e.reason);
  Utils.showError('Error de conexión.');
});
```

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Características Modernas Utilizadas
- CSS Grid y Flexbox
- CSS Custom Properties (Variables)
- Fetch API
- Intersection Observer
- Local Storage
- ES6+ (Clases, Arrow Functions, Template Literals)

## 🚀 Posibles Mejoras Futuras

### Funcionalidades
- [ ] Favoritos con localStorage
- [ ] Compartir personajes (URL con parámetros)
- [ ] Comparador de personajes
- [ ] Filtro por ubicación
- [ ] Búsqueda por episodio

### Técnicas
- [ ] Service Worker para cache offline
- [ ] Progressive Web App (PWA)
- [ ] Infinite scroll
- [ ] Virtual scrolling para listas grandes
- [ ] Tests unitarios con Jest

### UX/UI
- [ ] Skeleton loading
- [ ] Micro-animaciones
- [ ] Modo de alto contraste
- [ ] Soporte para múltiples idiomas

## 👨‍💻 Desarrollo

### Estructura del Código
- **Modular**: Separación clara de responsabilidades
- **Reutilizable**: Funciones utilitarias genéricas
- **Mantenible**: Código comentado y bien estructurado
- **Escalable**: Arquitectura preparada para nuevas funcionalidades

### Mejores Prácticas Implementadas
- ✅ Separación de concerns (HTML/CSS/JS)
- ✅ Mobile-first responsive design
- ✅ Accesibilidad web (ARIA, navegación por teclado)
- ✅ Optimización de rendimiento
- ✅ Manejo robusto de errores
- ✅ Código limpio y documentado

## 📄 Licencia

Este proyecto es de uso educativo para el Diplomado Front End. Los datos son proporcionados por la [Rick and Morty API](https://rickandmortyapi.com/) bajo licencia libre.

## 🤝 Contribuciones

Este es un proyecto educativo, pero las sugerencias y mejoras son bienvenidas:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

Desarrollado con ❤️ para los chicos del Diplomado de Front End

---

**¡Wubba Lubba Dub Dub!** 🛸

*"La ciencia no se trata de por qué, se trata de por qué no."* - Rick Sanchez#   R i c k - a n d - M o r t y - C h a r a c t e r - E x p l o r e r  
 