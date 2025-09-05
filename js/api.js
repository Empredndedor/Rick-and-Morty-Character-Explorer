// ===== API DE RICK AND MORTY =====

/**
 * Clase para manejar todas las peticiones a la API de Rick and Morty
 */
class RickAndMortyAPI {
  constructor() {
    this.baseURL = 'https://rickandmortyapi.com/api';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Realiza una petición HTTP con manejo de errores y caché
   * @param {string} url - URL de la petición
   * @param {Object} options - Opciones de la petición
   * @returns {Promise<Object>} Respuesta de la API
   */
  async fetchWithCache(url, options = {}) {
    // Verificar caché
    const cacheKey = url;
    const cachedData = this.cache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < this.cacheTimeout) {
      return cachedData.data;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      // Guardar en caché
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Error en la petición:', error);
      throw new Error(`Error al conectar con la API: ${error.message}`);
    }
  }

  /**
   * Obtiene todos los personajes con paginación
   * @param {number} page - Número de página
   * @returns {Promise<Object>} Datos de personajes
   */
  async getCharacters(page = 1) {
    const url = `${this.baseURL}/character?page=${page}`;
    return await this.fetchWithCache(url);
  }

  /**
   * Obtiene un personaje específico por ID
   * @param {number} id - ID del personaje
   * @returns {Promise<Object>} Datos del personaje
   */
  async getCharacter(id) {
    const url = `${this.baseURL}/character/${id}`;
    return await this.fetchWithCache(url);
  }

  /**
   * Busca personajes por nombre
   * @param {string} name - Nombre a buscar
   * @param {number} page - Número de página
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  async searchCharactersByName(name, page = 1) {
    if (!name.trim()) {
      return await this.getCharacters(page);
    }
    
    const url = `${this.baseURL}/character?name=${encodeURIComponent(name)}&page=${page}`;
    return await this.fetchWithCache(url);
  }

  /**
   * Filtra personajes por estado
   * @param {string} status - Estado (alive, dead, unknown)
   * @param {number} page - Número de página
   * @returns {Promise<Object>} Personajes filtrados
   */
  async getCharactersByStatus(status, page = 1) {
    const url = `${this.baseURL}/character?status=${status}&page=${page}`;
    return await this.fetchWithCache(url);
  }

  /**
   * Filtra personajes por especie
   * @param {string} species - Especie
   * @param {number} page - Número de página
   * @returns {Promise<Object>} Personajes filtrados
   */
  async getCharactersBySpecies(species, page = 1) {
    const url = `${this.baseURL}/character?species=${encodeURIComponent(species)}&page=${page}`;
    return await this.fetchWithCache(url);
  }

  /**
   * Búsqueda avanzada con múltiples filtros
   * @param {Object} filters - Filtros de búsqueda
   * @param {number} page - Número de página
   * @returns {Promise<Object>} Resultados filtrados
   */
  async searchCharacters(filters = {}, page = 1) {
    if (filters.episode) {
      const episode = await this.getEpisode(filters.episode);
      const characterIds = episode.characters.map(url => url.split('/').pop());
      const characters = await this.getMultipleCharacters(characterIds);
      return {
        info: {
          count: characters.length,
          pages: 1,
          next: null,
          prev: null
        },
        results: characters
      };
    }

    const params = new URLSearchParams();
    
    if (filters.name) {
      params.append('name', filters.name);
    }
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    if (filters.species) {
      params.append('species', filters.species);
    }
    
    if (filters.gender) {
      params.append('gender', filters.gender);
    }
    
    params.append('page', page);
    
    const url = `${this.baseURL}/character?${params.toString()}`;
    return await this.fetchWithCache(url);
  }

  /**
   * Obtiene múltiples personajes por sus IDs
   * @param {Array<number>} ids - Array de IDs
   * @returns {Promise<Array>} Array de personajes
   */
  async getMultipleCharacters(ids) {
    if (!ids || ids.length === 0) {
      return [];
    }
    
    const url = `${this.baseURL}/character/${ids.join(',')}`;
    const result = await this.fetchWithCache(url);
    
    // La API devuelve un objeto si es un solo personaje, o un array si son múltiples
    return Array.isArray(result) ? result : [result];
  }

  /**
   * Obtiene información de un episodio
   * @param {number} id - ID del episodio
   * @returns {Promise<Object>} Datos del episodio
   */
  async getEpisode(id) {
    const url = `${this.baseURL}/episode/${id}`;
    return await this.fetchWithCache(url);
  }

  /**
   * Obtiene múltiples episodios por sus IDs
   * @param {Array<number>} ids - Array de IDs de episodios
   * @returns {Promise<Array>} Array de episodios
   */
  async getMultipleEpisodes(ids) {
    if (!ids || ids.length === 0) {
      return [];
    }
    
    const url = `${this.baseURL}/episode/${ids.join(',')}`;
    const result = await this.fetchWithCache(url);
    
    return Array.isArray(result) ? result : [result];
  }

  /**
   * Obtiene información de una ubicación
   * @param {number} id - ID de la ubicación
   * @returns {Promise<Object>} Datos de la ubicación
   */
  async getLocation(id) {
    const url = `${this.baseURL}/location/${id}`;
    return await this.fetchWithCache(url);
  }

  /**
   * Obtiene todas las especies únicas de los personajes
   * @returns {Promise<Array<string>>} Array de especies
   */
  async getAllSpecies() {
    try {
      const cacheKey = 'all_species';
      const cachedSpecies = this.cache.get(cacheKey);
      
      if (cachedSpecies && Date.now() - cachedSpecies.timestamp < this.cacheTimeout) {
        return cachedSpecies.data;
      }

      const species = new Set();
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        try {
          const response = await this.getCharacters(page);
          
          response.results.forEach(character => {
            if (character.species) {
              species.add(character.species);
            }
          });

          hasNextPage = response.info.next !== null;
          page++;
          
          // Limitar a las primeras 5 páginas para evitar demasiadas peticiones
          if (page > 5) {
            break;
          }
        } catch (error) {
          console.warn(`Error al obtener página ${page}:`, error);
          break;
        }
      }

      const speciesArray = Array.from(species).sort();
      
      // Guardar en caché
      this.cache.set(cacheKey, {
        data: speciesArray,
        timestamp: Date.now()
      });

      return speciesArray;
    } catch (error) {
      console.error('Error al obtener especies:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas generales de la API
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    try {
      const [charactersResponse, episodesResponse, locationsResponse] = await Promise.all([
        this.fetchWithCache(`${this.baseURL}/character`),
        this.fetchWithCache(`${this.baseURL}/episode`),
        this.fetchWithCache(`${this.baseURL}/location`)
      ]);

      return {
        characters: charactersResponse.info.count,
        episodes: episodesResponse.info.count,
        locations: locationsResponse.info.count
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        characters: 0,
        episodes: 0,
        locations: 0
      };
    }
  }

  /**
   * Limpia la caché
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Obtiene el tamaño actual de la caché
   * @returns {number} Número de elementos en caché
   */
  getCacheSize() {
    return this.cache.size;
  }

  /**
   * Verifica si la API está disponible
   * @returns {Promise<boolean>} True si la API está disponible
   */
  async isAPIAvailable() {
    try {
      const response = await fetch(this.baseURL, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Crear instancia global de la API
const api = new RickAndMortyAPI();

// Exportar para uso global
window.RickAndMortyAPI = RickAndMortyAPI;
window.api = api;

// Funciones de conveniencia para uso directo
window.APIHelpers = {
  /**
   * Extrae IDs de episodios de las URLs
   * @param {Array<string>} episodeUrls - URLs de episodios
   * @returns {Array<number>} IDs de episodios
   */
  extractEpisodeIds(episodeUrls) {
    return episodeUrls
      .map(url => Utils.extractIdFromUrl(url))
      .filter(id => id !== null);
  },

  /**
   * Extrae ID de ubicación de la URL
   * @param {string} locationUrl - URL de ubicación
   * @returns {number|null} ID de ubicación
   */
  extractLocationId(locationUrl) {
    return Utils.extractIdFromUrl(locationUrl);
  },

  /**
   * Formatea la información de un episodio
   * @param {Object} episode - Datos del episodio
   * @returns {string} Episodio formateado
   */
  formatEpisode(episode) {
    return `${episode.episode} - ${episode.name}`;
  },

  /**
   * Maneja errores de la API de forma consistente
   * @param {Error} error - Error capturado
   * @returns {string} Mensaje de error formateado
   */
  handleAPIError(error) {
    if (error.message.includes('404')) {
      return 'No se encontraron resultados para tu búsqueda.';
    } else if (error.message.includes('500')) {
      return 'Error del servidor. Por favor, intenta más tarde.';
    } else if (error.message.includes('Network')) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    } else {
      return 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';
    }
  }
};