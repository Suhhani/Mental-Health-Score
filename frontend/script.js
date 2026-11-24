
const API_URL = "http://127.0.0.1:8000/predict";

const form = document.getElementById("predictionForm");
const submitButton = document.getElementById("submitButton");
const formMessage = document.getElementById("formMessage");
const resultsSection = document.getElementById("results");

function getStudentData() {
    return {
        age: Number(document.getElementById("age").value),
        gender: document.getElementById("gender").value,
        country: document.getElementById("country").value,
        academic_level: document.getElementById("academic_level").value,
        most_used_platform: document.getElementById("most_used_platform").value,
        purpose_of_use: document.getElementById("purpose_of_use").value,
        avg_daily_usage_hours: Number(
            document.getElementById("avg_daily_usage_hours").value
        ),
        daily_unlocks: Number(
            document.getElementById("daily_unlocks").value
        ),
        study_hours: Number(
            document.getElementById("study_hours").value
        ),
        physical_activity_hours: Number(
            document.getElementById("physical_activity_hours").value
        ),
        sleep_hours_per_night: Number(
            document.getElementById("sleep_hours_per_night").value
        ),
        stress_level: document.getElementById("stress_level").value
    };
}

function validateStudentData(data) {
    if (!Number.isInteger(data.age) || data.age < 10 || data.age > 100) {
        return "Age must be a whole number between 10 and 100.";
    }

    if (!Number.isInteger(data.daily_unlocks) || data.daily_unlocks < 0) {
        return "Daily phone unlocks must be a whole number of zero or more.";
    }

    const hourFields = [
        ["Social media usage", data.avg_daily_usage_hours],
        ["Study hours", data.study_hours],
        ["Physical activity", data.physical_activity_hours],
        ["Sleep hours", data.sleep_hours_per_night]
    ];

    for (const [name, value] of hourFields) {
        if (!Number.isFinite(value) || value < 0 || value > 24) {
            return `${name} must be between 0 and 24 hours.`;
        }
    }

    return "";
}

function showInputSummary(data) {
    const labels = {
        age: "Age",
        gender: "Gender",
        country: "Country",
        academic_level: "Academic level",
        most_used_platform: "Most used platform",
        purpose_of_use: "Main purpose",
        avg_daily_usage_hours: "Social media hours",
        daily_unlocks: "Daily unlocks",
        study_hours: "Study hours",
        physical_activity_hours: "Physical activity hours",
        sleep_hours_per_night: "Sleep hours",
        stress_level: "Stress level"
    };

    const summary = document.getElementById("inputSummary");
    summary.replaceChildren();

    for (const [key, label] of Object.entries(labels)) {
        const item = document.createElement("div");
        item.className = "summary-item";

        const name = document.createElement("span");
        name.textContent = label;

        const value = document.createElement("strong");
        value.textContent = data[key];

        item.append(name, value);
        summary.appendChild(item);
    }
}

function showPrediction(score, data) {
    document.getElementById("predictedScore").textContent = score.toFixed(2);

    showInputSummary(data);

    resultsSection.classList.remove("hidden");
    resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formMessage.textContent = "";

    if (!form.reportValidity()) {
        return;
    }

    const studentData = getStudentData();
    const validationError = validateStudentData(studentData);

    if (validationError) {
        formMessage.textContent = validationError;
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Generating prediction...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            const detail = result.detail;
            const message = Array.isArray(detail)
                ? detail.map(error => error.msg).join(" ")
                : detail || "The server could not process your request.";

            throw new Error(message);
        }

        const score = Number(result.predicted_mental_health_score);

        if (!Number.isFinite(score)) {
            throw new Error("The server returned an invalid prediction.");
        }

        showPrediction(score, studentData);

    } catch (error) {
        if (error instanceof TypeError) {
            formMessage.textContent =
                "Could not connect to the backend. Check that FastAPI is running.";
        } else {
            formMessage.textContent = error.message;
        }
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Generate prediction";
    }
});

document.getElementById("editButton").addEventListener("click", () => {
    document.getElementById("prediction").scrollIntoView({
        behavior: "smooth"
    });
});

document.getElementById("newPredictionButton").addEventListener("click", () => {
    form.reset();
    resultsSection.classList.add("hidden");
    formMessage.textContent = "";

    document.getElementById("prediction").scrollIntoView({
        behavior: "smooth"
    });
});
