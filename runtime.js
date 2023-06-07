function setElementClass(element, className) {
    if (!element || !className) {
        return;
    }

    var currentClasses = element.className.split(' ');
    var newClass = className.trim();

    // Check if the class is already set
    if (currentClasses.indexOf(newClass) === -1) {
        // Append the new class to the existing class
        currentClasses.push(newClass);
        element.className = currentClasses.join(' ');
    }
}


window.addEventListener("load", (event) => {
    const __e = document.querySelectorAll(".content p:first-of-type")[0];
    setElementClass(__e, "first-paragraph");
});