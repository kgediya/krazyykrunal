const lambdaURL = "https://klowln2vbpv2qlzkyirioteeeu0fucxh.lambda-url.us-east-1.on.aws/";

const refs = {};

function setStatus(message, state = "loading") {
    refs.statusBanner.textContent = message;
    refs.statusBanner.dataset.state = state;
    if (refs.portalState) {
        refs.portalState.textContent =
            state === "ready" ? "Healthy" : state === "error" ? "Attention" : "Syncing";
    }
}

function setRevealResult(message) {
    refs.revealResult.textContent = message;
}

function setBusy(isBusy) {
    [
        refs.submitNew,
        refs.submitRemove,
        refs.submitReveal,
        refs.refreshData,
    ].forEach((button) => {
        button.disabled = isBusy;
    });
}

async function callAwsLambdaFunction(data) {
    const response = await fetch(lambdaURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
}

function createOption(name) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    return option;
}

function renderAttendeeOptions(attendees) {
    [refs.attendees, refs.secretSanta].forEach((select) => {
        select.innerHTML = "";
        if (!attendees.length) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No participants yet";
            select.appendChild(option);
            return;
        }

        attendees.forEach((attendee) => {
            select.appendChild(createOption(attendee.name));
        });
    });
}

function renderParticipantsTable(attendees) {
    refs.tableBody.innerHTML = "";

    if (!attendees.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 2;
        cell.textContent = "No participants yet. Add your first name to begin the draw.";
        row.appendChild(cell);
        refs.tableBody.appendChild(row);
        return;
    }

    attendees.forEach((attendee) => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = attendee.name;

        const linkCell = document.createElement("td");
        const link = document.createElement("a");
        link.className = "invite-link";
        link.href = `https://krazyykrunal.com/secretsanta/?id=${attendee.uuid}`;
        link.textContent = "Open invite";
        link.target = "_blank";
        link.rel = "noreferrer";
        linkCell.appendChild(link);

        row.appendChild(nameCell);
        row.appendChild(linkCell);
        refs.tableBody.appendChild(row);
    });
}

async function loadParticipants() {
    setBusy(true);
    setStatus("Loading participants...", "loading");

    try {
        const response = await callAwsLambdaFunction({ operation: "get_attendees" });
        const attendees = Array.isArray(response?.Items) ? response.Items : [];
        renderAttendeeOptions(attendees);
        renderParticipantsTable(attendees);
        if (refs.participantTotal) {
            refs.participantTotal.textContent = String(attendees.length);
        }
        setStatus(`Loaded ${attendees.length} participant${attendees.length === 1 ? "" : "s"}.`, "ready");
    } catch (error) {
        console.error("Failed to load attendees", error);
        if (refs.participantTotal) {
            refs.participantTotal.textContent = "0";
        }
        setStatus("Unable to load participants right now.", "error");
    } finally {
        setBusy(false);
    }
}

async function addParticipant() {
    const name = refs.nameInput.value.trim();
    if (!name) {
        setStatus("Enter a participant name before adding.", "error");
        refs.nameInput.focus();
        return;
    }

    setBusy(true);
    setStatus(`Adding ${name}...`, "loading");

    try {
        await callAwsLambdaFunction({ operation: "add_attendee", name });
        refs.nameInput.value = "";
        await loadParticipants();
        setStatus(`${name} was added successfully.`, "ready");
    } catch (error) {
        console.error("Failed to add attendee", error);
        setStatus(`Couldn't add ${name}.`, "error");
    } finally {
        setBusy(false);
    }
}

async function removeParticipant() {
    const name = refs.attendees.value;
    if (!name) {
        setStatus("Select a participant to remove.", "error");
        return;
    }

    setBusy(true);
    setStatus(`Removing ${name}...`, "loading");

    try {
        await callAwsLambdaFunction({ operation: "remove_attendee", name });
        await loadParticipants();
        setRevealResult("Select a participant to preview their giftee.");
        setStatus(`${name} was removed successfully.`, "ready");
    } catch (error) {
        console.error("Failed to remove attendee", error);
        setStatus(`Couldn't remove ${name}.`, "error");
    } finally {
        setBusy(false);
    }
}

async function previewReveal() {
    const name = refs.secretSanta.value;
    if (!name) {
        setStatus("Select a participant to preview their giftee.", "error");
        return;
    }

    setBusy(true);
    setStatus(`Checking ${name}'s giftee...`, "loading");

    try {
        const response = await callAwsLambdaFunction({ operation: "map_giftee", name });
        const gifteeName = response?.giftee?.name || response?.name;
        if (gifteeName) {
            setRevealResult(`${name}'s giftee is ${gifteeName}.`);
            setStatus("Reveal preview loaded.", "ready");
        } else {
            setRevealResult(`No giftee mapping was returned for ${name}.`);
            setStatus("Reveal preview completed with no giftee.", "error");
        }
    } catch (error) {
        console.error("Failed to preview reveal", error);
        setRevealResult(`Couldn't load ${name}'s giftee right now.`);
        setStatus("Reveal preview failed.", "error");
    } finally {
        setBusy(false);
    }
}

function init() {
    refs.nameInput = document.getElementById("name_id");
    refs.attendees = document.getElementById("attendees");
    refs.secretSanta = document.getElementById("secret-santa");
    refs.submitNew = document.getElementById("submit-new");
    refs.submitRemove = document.getElementById("submit-remove");
    refs.submitReveal = document.getElementById("submit-santa");
    refs.refreshData = document.getElementById("refresh-data");
    refs.statusBanner = document.getElementById("status_banner");
    refs.revealResult = document.getElementById("reveal_result");
    refs.tableBody = document.querySelector("#participants-table tbody");
    refs.participantTotal = document.getElementById("participant_total");
    refs.portalState = document.getElementById("portal_state");

    refs.submitNew.addEventListener("click", addParticipant);
    refs.submitRemove.addEventListener("click", removeParticipant);
    refs.submitReveal.addEventListener("click", previewReveal);
    refs.refreshData.addEventListener("click", loadParticipants);
    refs.nameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            addParticipant();
        }
    });

    loadParticipants();
}

window.addEventListener("DOMContentLoaded", init);
