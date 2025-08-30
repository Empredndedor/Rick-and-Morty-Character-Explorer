// ===== UTILIDADES GENERALES =====

/**
 * Debounce function para optimizar búsquedas
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @param {boolean} immediate - Ejecutar inmediatamente
 * @returns {Function} Función debounced
 */
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * Throttle function para optimizar eventos de scroll
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite de tiempo en ms
 * @returns {Function} Función throttled
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Capitaliza la primera letra de una cadena
 * @param {string} str - Cadena a capitalizar
 * @returns {string} Cadena capitalizada
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formatea el estado del personaje para mostrar
 * @param {string} status - Estado del personaje
 * @returns {string} Estado formateado
 */
function formatStatus(status) {
  const statusMap = {
    'alive': 'Vivo',
    'dead': 'Muerto',
    'unknown': 'Desconocido'
  };
  return statusMap[status?.toLowerCase()] || status;
}

/**
 * Obtiene la clase CSS para el indicador de estado
 * @param {string} status - Estado del personaje
 * @returns {string} Clase CSS
 */
function getStatusClass(status) {
  const statusClasses = {
    'alive': 'status-alive',
    'dead': 'status-dead',
    'unknown': 'status-unknown'
  };
  return statusClasses[status?.toLowerCase()] || 'status-unknown';
}

/**
 * Formatea el género para mostrar
 * @param {string} gender - Género del personaje
 * @returns {string} Género formateado
 */
function formatGender(gender) {
  const genderMap = {
    'male': 'Masculino',
    'female': 'Femenino',
    'genderless': 'Sin género',
    'unknown': 'Desconocido'
  };
  return genderMap[gender?.toLowerCase()] || gender;
}

/**
 * Extrae el ID de una URL de la API
 * @param {string} url - URL de la API
 * @returns {number} ID extraído
 */
function extractIdFromUrl(url) {
  if (!url) return null;
  const matches = url.match(/\/(\d+)\/?$/);
  return matches ? parseInt(matches[1]) : null;
}

/**
 * Crea un elemento HTML con atributos y contenido
 * @param {string} tag - Etiqueta HTML
 * @param {Object} attributes - Atributos del elemento
 * @param {string} content - Contenido del elemento
 * @returns {HTMLElement} Elemento creado
 */
function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });

  if (content) {
    element.innerHTML = content;
  }

  return element;
}

/**
 * Muestra un mensaje de error
 * @param {string} message - Mensaje de error
 * @param {HTMLElement} container - Contenedor donde mostrar el error
 */
function showError(message, container = null) {
  const errorContainer = container || document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');

  if (errorContainer && errorText) {
    errorText.textContent = message;
    errorContainer.style.display = 'block';
  }
}

/**
 * Oculta el mensaje de error
 */
function hideError() {
  const errorContainer = document.getElementById('errorMessage');
  if (errorContainer) {
    errorContainer.style.display = 'none';
  }
}

/**
 * Muestra el spinner de carga
 */
function showLoading() {
  const loadingSpinner = document.getElementById('loadingSpinner');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'flex';
  }
}

/**
 * Oculta el spinner de carga
 */
function hideLoading() {
  const loadingSpinner = document.getElementById('loadingSpinner');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'none';
  }
}

/**
 * Actualiza el contador de resultados
 * @param {number} count - Número de resultados
 * @param {number} total - Total de resultados
 */
function updateResultsCount(count, total = null) {
  const resultsCount = document.getElementById('resultsCount');
  if (resultsCount) {
    if (total !== null) {
      resultsCount.textContent = `Mostrando ${count} de ${total} personajes`;
    } else {
      resultsCount.textContent = `${count} personajes encontrados`;
    }
  }
}

/**
 * Scroll suave hacia un elemento
 * @param {HTMLElement|string} target - Elemento o selector
 * @param {number} offset - Offset en píxeles
 */
function smoothScrollTo(target, offset = 0) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
}

/**
 * Scroll hacia arriba
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/**
 * Verifica si un elemento está visible en el viewport
 * @param {HTMLElement} element - Elemento a verificar
 * @returns {boolean} True si está visible
 */
function isElementVisible(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Lazy loading para imágenes
 * @param {HTMLImageElement} img - Elemento imagen
 * @param {string} src - URL de la imagen
 */
function lazyLoadImage(img, src) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target;
        image.src = src;
        image.classList.add('fade-in');
        observer.unobserve(image);
      }
    });
  });

  observer.observe(img);
}

/**
 * Manejo del tema (claro/oscuro)
 */
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    this.applyTheme();
    this.updateToggleIcon();
  }

  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    this.updateToggleIcon();
    localStorage.setItem('theme', this.theme);
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  updateToggleIcon() {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = this.theme === 'light' ? '🌙' : '☀️';
    }
  }
}

/**
 * Manejo del almacenamiento local
 */
class StorageManager {
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Error al guardar en localStorage:', error);
    }
  }

  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Error al leer de localStorage:', error);
      return defaultValue;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Error al eliminar de localStorage:', error);
    }
  }

  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Error al limpiar localStorage:', error);
    }
  }
}

/**
 * Validador de formularios
 */
class FormValidator {
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }
}

/**
 * Manejo de eventos del teclado
 */
class KeyboardManager {
  static isEnterKey(event) {
    return event.key === 'Enter' || event.keyCode === 13;
  }

  static isEscapeKey(event) {
    return event.key === 'Escape' || event.keyCode === 27;
  }

  static isArrowKey(event) {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);
  }
}

// Exportar funciones para uso global
window.Utils = {
  debounce,
  throttle,
  capitalize,
  formatStatus,
  getStatusClass,
  formatGender,
  extractIdFromUrl,
  createElement,
  showError,
  hideError,
  showLoading,
  hideLoading,
  updateResultsCount,
  smoothScrollTo,
  scrollToTop,
  isElementVisible,
  lazyLoadImage,
  ThemeManager,
  StorageManager,
  FormValidator,
  KeyboardManager
};