/**
 * Main JavaScript for the Usagey Express Example
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile menu toggle
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }
  
  // Set active navigation based on current path
  const currentPath = document.currentPath || window.location.pathname;
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      if (window.innerWidth >= 640) { // Desktop navigation
        link.classList.add('border-blue-500', 'text-gray-900');
        link.classList.remove('border-transparent', 'text-gray-500');
      } else { // Mobile navigation
        link.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-700');
        link.classList.remove('border-transparent', 'text-gray-600');
      }
    }
  });
  
  // Handle API key input display/hide
  const apiKeyInput = document.getElementById('apiKey');
  const toggleApiKeyVisibility = document.getElementById('toggleApiKeyVisibility');
  
  if (apiKeyInput && toggleApiKeyVisibility) {
    toggleApiKeyVisibility.addEventListener('click', function() {
      const type = apiKeyInput.getAttribute('type');
      if (type === 'password') {
        apiKeyInput.setAttribute('type', 'text');
        toggleApiKeyVisibility.textContent = 'Hide';
      } else {
        apiKeyInput.setAttribute('type', 'password');
        toggleApiKeyVisibility.textContent = 'Show';
      }
    });
  }
});

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @param {string} buttonId - ID of the button that was clicked
 */
function copyToClipboard(text, buttonId) {
  navigator.clipboard.writeText(text).then(() => {
    const button = document.getElementById(buttonId);
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}