// feedback.js

/**
 * Opens a feedback form for reporting a dark pattern.
 */
function openFeedbackForm() {
    // Check if the form already exists to avoid duplicates
    if (document.getElementById("darkPatternFeedbackForm")) return;

    const form = document.createElement("div");
    form.id = "darkPatternFeedbackForm";
    form.style.position = "fixed";
    form.style.bottom = "20px";
    form.style.right = "20px";
    form.style.zIndex = "10001";
    form.style.backgroundColor = "#fff";
    form.style.padding = "20px";
    form.style.border = "1px solid #ddd";
    form.style.borderRadius = "5px";
    form.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    form.innerHTML = `
        <label for="feedbackDescription">Describe the issue:</label><br>
        <textarea id="feedbackDescription" rows="4" style="width: 100%;"></textarea><br>
        <button id="submitFeedback" style="margin-top: 10px;">Submit</button>
        <button id="cancelFeedback" style="margin-top: 10px; margin-left: 10px;">Cancel</button>
    `;

    document.body.appendChild(form);

    // Attach event listeners to the form buttons
    document.getElementById("submitFeedback").addEventListener("click", submitFeedback);
    document.getElementById("cancelFeedback").addEventListener("click", () => {
        const existingForm = document.getElementById("darkPatternFeedbackForm");
        if (existingForm) document.body.removeChild(existingForm);
    });
    console.log("Button clicked!");
}

/**
 * Handles feedback submission.
 */
function submitFeedback() {
    const description = document.getElementById("feedbackDescription").value.trim();
    if (description) {
        // Save feedback to storage or send it to a server
        const feedbackData = {
            timestamp: new Date().toISOString(),
            description,
            url: window.location.href
        };

        saveFeedback(feedbackData);

        alert("Thank you for your feedback!");
        const form = document.getElementById("darkPatternFeedbackForm");
        if (form) document.body.removeChild(form);
    } else {
        alert("Please provide a description before submitting.");
    }
}

/**
 * Saves feedback to a central database or local storage.
 * @param {object} feedbackData - The feedback data to be saved.
 */
function saveFeedback(feedbackData) {
    console.log("Feedback data saved:", feedbackData); // Replace with API call or local storage
    // Example for local storage:
    const existingFeedback = JSON.parse(localStorage.getItem("darkPatternFeedback") || "[]");
    existingFeedback.push(feedbackData);
    localStorage.setItem("darkPatternFeedback", JSON.stringify(existingFeedback));
}

// document.addEventListener("DOMContentLoaded", function() {
//     // Attach the event listener after the DOM is loaded
//     const reportButton = document.getElementById("reportDarkPatternButton");
//     if (reportButton) {
//         reportButton.addEventListener("click", openFeedbackForm);
//     }
// });

document.addEventListener("DOMContentLoaded", function() {
    const reportButton = document.getElementById("reportDarkPatternButton");
    if (reportButton) {
        reportButton.addEventListener("click", function() {
            console.log("Button clicked!"); // Add this line to check if the button is being clicked
            openFeedbackForm();
        });
    }
});
