/* eslint-env browser */
/* eslint no-param-reassign: ["error", { "props": false }] */
document.addEventListener('DOMContentLoaded', () => {
  // Attach event listeners to sliders to update value on change
  document.querySelectorAll('input[type=range]').forEach((elem) => {
    elem.addEventListener('input', (e) => {
      elem.nextElementSibling.innerHTML = e.target.value;
    });
  });
});
