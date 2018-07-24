document.addEventListener("DOMContentLoaded", function(event) {
    // Attach event listeners to sliders to update value on change
    for (const elem of document.querySelectorAll("input[type=range]")) {
        elem.addEventListener("input", function(e) {
            elem.nextElementSibling.innerHTML = e.target.value;
        });
    }
});
