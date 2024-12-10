// scrapeText.js

function scrapeVisibleText() {
    const visibleTextElements = Array.from(document.body.querySelectorAll("*:not(script):not(style)"))
        .filter(el => el.offsetParent !== null)
        .map(el => el.innerText.trim())
        .filter(text => text.length > 0);
    return visibleTextElements.join("\n");
}

function downloadTextFile(filename, text) {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
function downloadFile(filename, text) {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Example usage:
downloadFile("output.txt", scrapeVisibleText());

