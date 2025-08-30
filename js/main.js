// ===== APLICACIÓN PRINCIPAL RICK AND MORTY =====

/**
 * Clase principal de la aplicación
 */
class RickAndMortyApp {
  constructor() {
    this.currentPage = 1;
    this.currentFilters = {
      name: '',
      status: '',
      species: ''
    };
    this.characters = [];
    this.totalPages = 1;
    this.totalCharacters = 0;
    this.currentCharacterIndex = 0;
    this.allSpecies = [];
    this.favorites = new Set(Utils.StorageManager.get('favorites', []));
    
    // Referencias a elementos del DOM
    this.elements = {};
    
    // Managers
    this.themeManager = new Utils.ThemeManager();
    
    this.init();
  }

  /**
   * Inicializa la aplicación
   */
  async init() {
    try {
      this.bindElements();
      this.bindEvents();
      this.updateFavoritesCount();
      await this.loadInitialData();
      this.setupBackToTop();
    } catch (error) {
      console.error('Error al inicializar la aplicación:', error);
      Utils.showError('Error al cargar la aplicación. Por favor, recarga la página.');
    }
  }

  /**
   * Vincula elementos del DOM
   */
  bindElements() {
    this.elements = {
      // Búsqueda y filtros
      searchInput: document.getElementById('searchInput'),
      searchBtn: document.getElementById('searchBtn'),
      statusFilter: document.getElementById('statusFilter'),
      speciesFilter: document.getElementById('speciesFilter'),
      clearFilters: document.getElementById('clearFilters'),
      
      // Resultados
      resultsCount: document.getElementById('resultsCount'),
      charactersGrid: document.getElementById('charactersGrid'),
      pagination: document.getElementById('pagination'),
      
      // Loading y errores
      loadingSpinner: document.getElementById('loadingSpinner'),
      errorMessage: document.getElementById('errorMessage'),
      retryBtn: document.getElementById('retryBtn'),
      
      // Modal
      modalOverlay: document.getElementById('modalOverlay'),
      characterModal: document.getElementById('characterModal'),
      modalContent: document.getElementById('modalContent'),
      modalClose: document.getElementById('modalClose'),
      prevCharacter: document.getElementById('prevCharacter'),
      nextCharacter: document.getElementById('nextCharacter'),
      
      // Tema y navegación
      favoritesToggle: document.getElementById('favoritesToggle'),
      favoritesCount: document.getElementById('favoritesCount'),
      themeToggle: document.getElementById('themeToggle'),
      backToTop: document.getElementById('backToTop'),
      
      // Botones extra
      modalFavoriteBtn: document.getElementById('modalFavoriteBtn')
    };
  }

  /**
   * Vincula eventos
   */
  bindEvents() {
    // Búsqueda
    const debouncedSearch = Utils.debounce(() => this.handleSearch(), 500);
    this.elements.searchInput.addEventListener('input', debouncedSearch);
    this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
    
    // Enter en búsqueda
    this.elements.searchInput.addEventListener('keypress', (e) => {
      if (Utils.KeyboardManager.isEnterKey(e)) {
        this.handleSearch();
      }
    });
    
    // Filtros
    this.elements.statusFilter.addEventListener('change', () => this.handleFilterChange());
    this.elements.speciesFilter.addEventListener('change', () => this.handleFilterChange());
    this.elements.clearFilters.addEventListener('click', () => this.clearAllFilters());
    
    // Modal
    this.elements.modalClose.addEventListener('click', () => this.closeModal());
    this.elements.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.elements.modalOverlay) {
        this.closeModal();
      }
    });
    
    // Navegación en modal
    this.elements.prevCharacter.addEventListener('click', () => this.showPreviousCharacter());
    this.elements.nextCharacter.addEventListener('click', () => this.showNextCharacter());
    
    // Tema
    this.elements.themeToggle.addEventListener('click', () => this.themeManager.toggle());
    
    // Reintentar
    this.elements.retryBtn.addEventListener('click', () => this.loadCharacters());
    
    // Back to top
    this.elements.backToTop.addEventListener('click', () => Utils.scrollToTop());

    // Favorito en modal
    if (this.elements.modalFavoriteBtn) {
      this.elements.modalFavoriteBtn.addEventListener('click', () => {
        const id = parseInt(this.elements.modalFavoriteBtn.dataset.characterId, 10);
        if (!isNaN(id)) {
          this.toggleFavorite(id);
          this.updateModalFavoriteButton(id);
          this.updateCardFavoriteButton(id);
        }
      });
    }
    
    // Teclado global
    document.addEventListener('keydown', (e) => this.handleGlobalKeyboard(e));
    
    // Scroll para back to top
    const throttledScroll = Utils.throttle(() => this.handleScroll(), 100);
    window.addEventListener('scroll', throttledScroll);
    
    // Carga de más personajes al hacer scroll
    window.addEventListener('scroll', () => {
      if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200)) {
        this.loadMoreCharacters();
      }
    });
  }

  /**
   * Carga datos iniciales
   */
  async loadInitialData() {
    Utils.showLoading();
    
    try {
      // Cargar especies para el filtro
      await this.loadSpecies();
      
      // Cargar personajes iniciales
      await this.loadCharacters();
      
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      Utils.showError(APIHelpers.handleAPIError(error));
    } finally {
      Utils.hideLoading();
    }
  }

  /**
   * Carga las especies para el filtro
   */
  async loadSpecies() {
    try {
      this.allSpecies = await api.getAllSpecies();
      this.populateSpeciesFilter();
    } catch (error) {
      console.warn('Error al cargar especies:', error);
    }
  }

  /**
   * Puebla el filtro de especies
   */
  populateSpeciesFilter() {
    const speciesFilter = this.elements.speciesFilter;
    
    // Limpiar opciones existentes (excepto la primera)
    while (speciesFilter.children.length > 1) {
      speciesFilter.removeChild(speciesFilter.lastChild);
    }
    
    // Agregar especies
    this.allSpecies.forEach(species => {
      const option = document.createElement('option');
      option.value = species;
      option.textContent = species;
      speciesFilter.appendChild(option);
    });
  }

  /**
   * Carga personajes según filtros actuales
   */
  async loadCharacters() {
    Utils.showLoading();
    Utils.hideError();
    
    try {
      const response = await api.searchCharacters(this.currentFilters, this.currentPage);
      
      this.characters = response.results;
      this.totalPages = response.info.pages;
      this.totalCharacters = response.info.count;
      
      this.renderCharacters();
      this.renderPagination();
      this.updateResultsDisplay();
      
    } catch (error) {
      console.error('Error al cargar personajes:', error);
      Utils.showError(APIHelpers.handleAPIError(error));
      this.characters = [];
      this.renderCharacters();
    } finally {
      Utils.hideLoading();
    }
  }

  /**
   * Renderiza las tarjetas de personajes
   */
  renderCharacters() {
    const grid = this.elements.charactersGrid;
    grid.innerHTML = '';
    
    if (this.characters.length === 0) {
      const noResults = Utils.createElement('div', {
        className: 'no-results text-center'
      }, `
        <h3>No se encontraron personajes</h3>
        <p>Intenta ajustar tus filtros de búsqueda</p>
      `);
      grid.appendChild(noResults);
      return;
    }
    
    this.characters.forEach((character, index) => {
      const card = this.createCharacterCard(character, index);
      grid.appendChild(card);
    });
  }

  /**
   * Crea una tarjeta de personaje
   * @param {Object} character - Datos del personaje
   * @param {number} index - Índice del personaje
   * @returns {HTMLElement} Tarjeta del personaje
   */
  createCharacterCard(character, index) {
    const card = Utils.createElement('div', {
      className: 'character-card fade-in',
      dataset: { characterId: character.id, index }
    });
    
    const statusClass = Utils.getStatusClass(character.status);
    const formattedStatus = Utils.formatStatus(character.status);
    
    card.innerHTML = `
      <button class="favorite-btn" data-character-id="${character.id}" aria-label="Me gusta">♡</button>
      <img class="character-image" src="${character.image}" alt="${character.name}" loading="lazy">
      <div class="character-info">
        <h3 class="character-name">${character.name}</h3>
        <div class="character-details">
          <div class="character-detail">
            <span class="status-indicator ${statusClass}"></span>
            <span>${formattedStatus}</span>
          </div>
          <div class="character-detail">
            <strong>Especie:</strong> ${character.species}
          </div>
          <div class="character-detail">
            <strong>Origen:</strong> ${character.origin.name}
          </div>
        </div>
        <button class="detail-btn" data-character-id="${character.id}" data-index="${index}">
          Ver Detalles
        </button>
      </div>
    `;
    
    // Event listeners para la tarjeta
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('detail-btn')) {
        this.showCharacterModal(character, index);
      }
    });
    
    const detailBtn = card.querySelector('.detail-btn');
    detailBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showCharacterModal(character, index);
    });

    // Botón de favorito en tarjeta
    const favBtn = card.querySelector('.favorite-btn');
    if (favBtn) {
      if (this.isFavorite(character.id)) {
        favBtn.classList.add('active');
        favBtn.textContent = '❤️';
      } else {
        favBtn.classList.remove('active');
        favBtn.textContent = '♡';
      }

      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFavorite(character.id);
        if (this.isFavorite(character.id)) {
          favBtn.classList.add('active');
          favBtn.textContent = '❤️';
        } else {
          favBtn.classList.remove('active');
          favBtn.textContent = '♡';
        }
      });
    }
    
    return card;
  }

  /**
   * Muestra el modal de detalles del personaje
   * @param {Object} character - Datos del personaje
   * @param {number} index - Índice del personaje
   */
  async showCharacterModal(character, index) {
    this.currentCharacterIndex = index;
    
    try {
      // Mostrar información básica inmediatamente
      this.renderBasicCharacterInfo(character);
      if (this.elements.modalFavoriteBtn) {
        this.elements.modalFavoriteBtn.dataset.characterId = character.id;
        this.updateModalFavoriteButton(character.id);
      }
      this.openModal();
      
      // Cargar información adicional
      await this.loadCharacterDetails(character);
      
    } catch (error) {
      console.error('Error al mostrar detalles del personaje:', error);
      Utils.showError('Error al cargar los detalles del personaje.');
    }
  }

  /**
   * Renderiza información básica del personaje en el modal
   * @param {Object} character - Datos del personaje
   */
  renderBasicCharacterInfo(character) {
    const statusClass = Utils.getStatusClass(character.status);
    const formattedStatus = Utils.formatStatus(character.status);
    const formattedGender = Utils.formatGender(character.gender);
    
    this.elements.modalContent.innerHTML = `
      <div class="modal-character">
        <img class="modal-character-image" src="${character.image}" alt="${character.name}">
        <div class="modal-character-details">
          <div class="modal-character-info">
            <div class="info-group">
              <div class="info-label">Nombre</div>
              <div class="info-value">${character.name}</div>
            </div>
            <div class="info-group">
              <div class="info-label">Estado</div>
              <div class="info-value">
                <span class="status-indicator ${statusClass}"></span>
                ${formattedStatus}
              </div>
            </div>
            <div class="info-group">
              <div class="info-label">Especie</div>
              <div class="info-value">${character.species}</div>
            </div>
            <div class="info-group">
              <div class="info-label">Género</div>
              <div class="info-value">${formattedGender}</div>
            </div>
            <div class="info-group">
              <div class="info-label">Origen</div>
              <div class="info-value">${character.origin.name}</div>
            </div>
            <div class="info-group">
              <div class="info-label">Ubicación actual</div>
              <div class="info-value">${character.location.name}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="loading-episodes">
        <div class="spinner"></div>
        <p>Cargando episodios...</p>
      </div>
    `;
  }

  /**
   * Carga detalles adicionales del personaje
   * @param {Object} character - Datos del personaje
   */
  async loadCharacterDetails(character) {
    try {
      // Obtener IDs de episodios
      const episodeIds = APIHelpers.extractEpisodeIds(character.episode);
      
      if (episodeIds.length > 0) {
        // Cargar primeros 5 episodios
        const episodesToLoad = episodeIds.slice(0, 5);
        const episodes = await api.getMultipleEpisodes(episodesToLoad);
        
        this.renderEpisodes(episodes, character.episode.length);
      } else {
        this.renderNoEpisodes();
      }
      
    } catch (error) {
      console.error('Error al cargar episodios:', error);
      this.renderEpisodeError();
    }
  }

  /**
   * Renderiza la lista de episodios
   * @param {Array} episodes - Lista de episodios
   * @param {number} totalEpisodes - Total de episodios
   */
  renderEpisodes(episodes, totalEpisodes) {
    const loadingEpisodes = this.elements.modalContent.querySelector('.loading-episodes');
    if (loadingEpisodes) {
      loadingEpisodes.remove();
    }
    
    const episodesSection = Utils.createElement('div', {
      className: 'episodes-list'
    });
    
    episodesSection.innerHTML = `
      <h4 class="episodes-title">Episodios (${totalEpisodes} total, mostrando primeros 5)</h4>
      ${episodes.map(episode => `
        <div class="episode-item">
          ${APIHelpers.formatEpisode(episode)}
        </div>
      `).join('')}
    `;
    
    this.elements.modalContent.appendChild(episodesSection);
  }

  /**
   * Renderiza mensaje cuando no hay episodios
   */
  renderNoEpisodes() {
    const loadingEpisodes = this.elements.modalContent.querySelector('.loading-episodes');
    if (loadingEpisodes) {
      loadingEpisodes.innerHTML = '<p>No hay episodios disponibles</p>';
    }
  }

  /**
   * Renderiza error al cargar episodios
   */
  renderEpisodeError() {
    const loadingEpisodes = this.elements.modalContent.querySelector('.loading-episodes');
    if (loadingEpisodes) {
      loadingEpisodes.innerHTML = '<p>Error al cargar episodios</p>';
    }
  }

  /**
   * Abre el modal
   */
  openModal() {
    this.elements.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.updateModalNavigation();
  }

  /**
   * Cierra el modal
   */
  closeModal() {
    this.elements.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /**
   * Muestra el personaje anterior en el modal
   */
  showPreviousCharacter() {
    if (this.currentCharacterIndex > 0) {
      const prevIndex = this.currentCharacterIndex - 1;
      const prevCharacter = this.characters[prevIndex];
      this.showCharacterModal(prevCharacter, prevIndex);
    }
  }

  /**
   * Muestra el siguiente personaje en el modal
   */
  showNextCharacter() {
    if (this.currentCharacterIndex < this.characters.length - 1) {
      const nextIndex = this.currentCharacterIndex + 1;
      const nextCharacter = this.characters[nextIndex];
      this.showCharacterModal(nextCharacter, nextIndex);
    }
  }

  /**
   * Actualiza la navegación del modal
   */
  updateModalNavigation() {
    this.elements.prevCharacter.disabled = this.currentCharacterIndex === 0;
    this.elements.nextCharacter.disabled = this.currentCharacterIndex === this.characters.length - 1;
  }

  /**
   * Renderiza la paginación
   */
  renderPagination() {
    const pagination = this.elements.pagination;
    pagination.innerHTML = '';
    
    if (this.totalPages <= 1) {
      return;
    }
    
    // Botón anterior
    const prevBtn = this.createPageButton('‹ Anterior', this.currentPage - 1, this.currentPage === 1);
    pagination.appendChild(prevBtn);
    
    // Páginas
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    if (startPage > 1) {
      pagination.appendChild(this.createPageButton('1', 1));
      if (startPage > 2) {
        pagination.appendChild(this.createPageButton('...', null, true));
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const btn = this.createPageButton(i.toString(), i, false, i === this.currentPage);
      pagination.appendChild(btn);
    }
    
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        pagination.appendChild(this.createPageButton('...', null, true));
      }
      pagination.appendChild(this.createPageButton(this.totalPages.toString(), this.totalPages));
    }
    
    // Botón siguiente
    const nextBtn = this.createPageButton('Siguiente ›', this.currentPage + 1, this.currentPage === this.totalPages);
    pagination.appendChild(nextBtn);
  }

  /**
   * Crea un botón de página
   * @param {string} text - Texto del botón
   * @param {number} page - Número de página
   * @param {boolean} disabled - Si está deshabilitado
   * @param {boolean} active - Si está activo
   * @returns {HTMLElement} Botón de página
   */
  createPageButton(text, page, disabled = false, active = false) {
    const btn = Utils.createElement('button', {
      className: `page-btn ${active ? 'active' : ''}`,
      disabled: disabled
    }, text);
    
    if (!disabled && page !== null) {
      btn.addEventListener('click', () => this.goToPage(page));
    }
    
    return btn;
  }

  /**
   * Va a una página específica
   * @param {number} page - Número de página
   */
  async goToPage(page) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      await this.loadCharacters();
      Utils.smoothScrollTo('.characters-section', 100);
    }
  }

  /**
   * Maneja la búsqueda
   */
  async handleSearch() {
    const searchTerm = this.elements.searchInput.value.trim();
    this.currentFilters.name = searchTerm;
    this.currentPage = 1;
    await this.loadCharacters();
  }

  /**
   * Maneja cambios en los filtros
   */
  async handleFilterChange() {
    this.currentFilters.status = this.elements.statusFilter.value;
    this.currentFilters.species = this.elements.speciesFilter.value;
    this.currentPage = 1;
    await this.loadCharacters();
  }

  /**
   * Limpia todos los filtros
   */
  async clearAllFilters() {
    this.elements.searchInput.value = '';
    this.elements.statusFilter.value = '';
    this.elements.speciesFilter.value = '';
    
    this.currentFilters = {
      name: '',
      status: '',
      species: ''
    };
    
    this.currentPage = 1;
    await this.loadCharacters();
  }

  /**
   * Actualiza la visualización de resultados
   */
  updateResultsDisplay() {
    const start = (this.currentPage - 1) * 20 + 1;
    const end = Math.min(this.currentPage * 20, this.totalCharacters);
    Utils.updateResultsCount(`${start}-${end}`, this.totalCharacters);
  }

  /** Favoritos */
  isFavorite(id) {
    return this.favorites.has(id);
  }

  toggleFavorite(id) {
    if (this.isFavorite(id)) {
      this.favorites.delete(id);
    } else {
      this.favorites.add(id);
    }
    Utils.StorageManager.set('favorites', Array.from(this.favorites));
    this.updateFavoritesCount();
  }

  updateFavoritesCount() {
    if (this.elements.favoritesCount) {
      this.elements.favoritesCount.textContent = this.favorites.size.toString();
    }
  }

  updateModalFavoriteButton(id) {
    const btn = this.elements.modalFavoriteBtn;
    if (!btn) return;
    if (this.isFavorite(id)) {
      btn.classList.add('active');
      btn.textContent = '❤️';
    } else {
      btn.classList.remove('active');
      btn.textContent = '♡';
    }
  }

  updateCardFavoriteButton(id) {
    const buttons = document.querySelectorAll(`.character-card[data-character-id='${id}'] .favorite-btn`);
    buttons.forEach((btn) => {
      if (this.isFavorite(id)) {
        btn.classList.add('active');
        btn.textContent = '❤️';
      } else {
        btn.classList.remove('active');
        btn.textContent = '♡';
      }
    });
  }

  /**
   * Maneja eventos globales del teclado
   * @param {KeyboardEvent} e - Evento de teclado
   */
  handleGlobalKeyboard(e) {
    // Cerrar modal con Escape
    if (Utils.KeyboardManager.isEscapeKey(e) && this.elements.modalOverlay.classList.contains('active')) {
      this.closeModal();
    }
    
    // Navegación en modal con flechas
    if (this.elements.modalOverlay.classList.contains('active')) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.showPreviousCharacter();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.showNextCharacter();
      }
    }
  }

  /**
   * Maneja el scroll para mostrar/ocultar botón back to top
   */
  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
      this.elements.backToTop.classList.add('visible');
    } else {
      this.elements.backToTop.classList.remove('visible');
    }
  }

  /**
   * Configura el botón back to top
   */
  setupBackToTop() {
    this.handleScroll(); // Verificar posición inicial
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.app = new RickAndMortyApp();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
  console.error('Error global:', e.error);
  Utils.showError('Ha ocurrido un error inesperado. Por favor, recarga la página.');
});

// Manejar errores de promesas no capturadas
window.addEventListener('unhandledrejection', (e) => {
  console.error('Promesa rechazada no manejada:', e.reason);
  Utils.showError('Error de conexión. Por favor, verifica tu conexión a internet.');
});

async function loadEpisodes() {
    const episodeSelect = document.getElementById('episodeFilter');
    let page = 1, episodes = [], hasMore = true;
    while (hasMore) {
        const res = await fetch(`https://rickandmortyapi.com/api/episode?page=${page}`);
        const data = await res.json();
        episodes = episodes.concat(data.results);
        hasMore = data.info.next !== null;
        page++;
    }
    episodes.forEach(ep => {
        const option = document.createElement('option');
        option.value = ep.id;
        option.textContent = `${ep.episode} - ${ep.name}`;
        episodeSelect.appendChild(option);
    });
}
window.addEventListener('DOMContentLoaded', loadEpisodes);

async function fetchCharacters({ name, status, species, episodeId, page }) {
    let url = `https://rickandmortyapi.com/api/character/?page=${page || 1}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    if (status) url += `&status=${status}`;
    if (species) url += `&species=${encodeURIComponent(species)}`;
    if (episodeId) {
        // Buscar personajes por episodio
        const epRes = await fetch(`https://rickandmortyapi.com/api/episode/${episodeId}`);
        const epData = await epRes.json();
        const characterIds = epData.characters.map(url => url.split('/').pop()).join(',');
        url = `https://rickandmortyapi.com/api/character/${characterIds}`;
        // Aquí deberás adaptar el renderizado porque la respuesta es un array, no paginada
        // ...renderiza los personajes...
        return;
    }
    // ...fetch y render normal...
}

let currentPage = 1;
let isLoading = false;
let hasMore = true;

async function loadMoreCharacters() {
    if (isLoading || !hasMore) return;
    isLoading = true;
    // Usa tus filtros actuales
    await fetchCharacters({
        name: searchInput.value,
        status: statusFilter.value,
        species: speciesFilter.value,
        episodeId: episodeFilter.value,
        page: currentPage
    });
    isLoading = false;
    currentPage++;
}

window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200)) {
        loadMoreCharacters();
    }
});

// Al cambiar filtros o buscar, reinicia currentPage y limpia el grid
function onFilterChange() {
    currentPage = 1;
    hasMore = true;
    charactersGrid.innerHTML = '';
    loadMoreCharacters();
}