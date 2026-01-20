/**
 * GM_addStyle polyfill for Tampermonkey compatibility
 * Adds CSS styles to the page
 */
if (typeof GM_addStyle === 'undefined') {
  window.GM_addStyle = function(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    return style;
  };
}
