// ==============================
// Google Apps Script Web App URL
// ==============================
const BASE_URL = "https://script.google.com/macros/s/AKfycby2kThZAKcslw-1XJSnWyeWWDar7Vf45_vUzn6O2l9Qv6zksE7103W1TkL5D8UlGBkz/exec";

// ==============================
// Global Variables
// ==============================
let employees = [];
let filteredEmployees = [];
let allData = [];
let allLinks = [];
let dataReady = false;

// ==============================
// Helper: Safe Date Parser
// ==============================
function parseDate(value) {
    if (!value) return null;

    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "string" && value.includes("/")) {
        value = value.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");
    }

    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
}

// ==============================
// WAIT FOR DATA
// ==============================
function waitForDataAndRender(name) {
    if (!dataReady) {
        setTimeout(() => waitForDataAndRender(name), 300);
        return;
    }
    renderMistakes(name);
}

// ==============================
// LOAD DATA
// ==============================
document.addEventListener("DOMContentLoaded", () => {

    Promise.all([
        fetch(BASE_URL + "?type=employee").then(r => r.json()),
        fetch(BASE_URL + "?type=links").then(r => r.json()),
        fetch(BASE_URL + "?type=mistake").then(r => r.json())
    ])
    .then(([employeeData, linksData, mistakeData]) => {

        employees = employeeData || [];
        filteredEmployees = employeeData || [];
        allLinks = linksData || [];
        allData = mistakeData || [];

        renderLinks("BO","boLinks");
        renderLinks("Deposit PLY","depositPlyLinks");
        renderLinks("Deposit Sheet","depositSheetLinks");
        renderLinks("SOP","sopLinks");
        renderLinks("Sports BO","sportsBoLinks");
        renderLinks("Sports","sportsGameLinks");
        renderLinks("Other","otherLinks");

        dataReady = true;

        if (employees.length > 0) {
            renderMistakes("");
        }

    })
    .catch(err => {
        console.error("DATA LOAD ERROR:", err);
        alert("Unable to load Data");
    });

});

// ==============================
// EMPLOYEE LIST
// ==============================
function renderEmployeeList(list) {

    const container = document.getElementById("employeeList");
    if (!container) return;

    container.innerHTML = "";

    list.forEach(emp => {

        const card = document.createElement("div");
        card.className = "employee";

        card.innerHTML = `
            <h4>${emp["CS Name"] || "-"}</h4>
            <p>${emp["STAFF Position"] || "-"}</p>
        `;

        card.onclick = () => {
            showEmployeeByObject(emp);
            document.getElementById("search").value = emp["CS Name"] || "";
            container.innerHTML = "";
        };

        container.appendChild(card);
    });
}

// ==============================
// LOAD MONTHS
// ==============================
function loadMonths(allData) {

    const select = document.getElementById("monthSelect");
    if (!select) return;

    select.innerHTML = '<option value="All">All Months</option>';

    const months = [];

    allData.forEach(item => {

        const d = parseDate(item["Date"]);
        if (!d) return;

        const month = d.toLocaleString("default", {
            month: "long",
            year: "numeric"
        });

        if (!months.includes(month)) {
            months.push(month);
        }
    });

    months.forEach(month => {
        const option = document.createElement("option");
        option.value = month;
        option.textContent = month;
        select.appendChild(option);
    });
}

// ==============================
// SEARCH
// ==============================
document.getElementById("search").addEventListener("keyup", function () {

    const txt = this.value.trim().toLowerCase();

    if (!txt) {
        document.getElementById("employeeList").innerHTML = "";
        return;
    }

    const filtered = employees.filter(emp =>
        String(emp["CS Name"] || "").toLowerCase().includes(txt)
    );

    renderEmployeeList(filtered);
});

// ==============================
// SHOW EMPLOYEE
// ==============================
function showEmployeeByObject(emp, showReport = true) {
    if (!emp) return;

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value || "-";
    };

    setText("empName", emp["CS Name"]);
    setText("empPosition", emp["STAFF Position"]);
    setText("psd", emp["PSD ID"]);
    setText("office", emp["Office Location"] || emp["Office Locaton"] || "-");
    setText("teamid", emp["STAFF MS Team ID"]);
    setText("agent", emp["ICX Agent"]);
    setText("group", emp["Group"]);

    const search = document.getElementById("search");
    if (search) search.value = emp["CS Name"] || "";

    const list = document.getElementById("employeeList");
    if (list) list.innerHTML = "";

    // Avatar SAFE
    const avatar = document.getElementById("avatar");
    if (avatar) {
        const name = (emp?.["CS Name"] || "").trim();
avatar.innerText = name.length ? name.charAt(0).toUpperCase() : "?";
    }

    // Brands (safe call assumed setBrand exists)
    setBrand("superbo", emp["Super BO"]);
    setBrand("dp", emp["DP"]);
    setBrand("kv", emp["KV"]);
    setBrand("hb", emp["HB"]);
    setBrand("jb", emp["JB"]);
    setBrand("jway", emp["JWAY"]);
    setBrand("sb", emp["SB"]);
    setBrand("slb", emp["SLB"]);
    setBrand("bjdb", emp["BJDB"]);
    setBrand("bn", emp["BN"]);
    setBrand("bdvegas", emp["BDVegas"]);
    setBrand("cpc88", emp["CPC88"]);
    setBrand("deshi777", emp["Deshi777"]);

    if (showReport) {
        renderMistakes(emp["CS Name"]);
    }
}

// ==============================
// BRAND CARD
// ==============================
function setBrand(id, value) {

    const box = document.getElementById(id);
    if (!box) return;

    const title = box.dataset?.title || "";

    if (value && value.toString().trim() !== "") {

        box.className = "brand-card active-brand";

        box.innerHTML = `
            <div class="brand-name">${title}</div>
            <div class="brand-value">${value}</div>
        `;

    } else {

        box.className = "brand-card inactive-brand";

        box.innerHTML = `
            <div class="brand-name">${title}</div>
            <div class="brand-value">No Access</div>
        `;
    }
}

// ==============================
// PAGE SWITCH
// ==============================
function showPage(page, element) {

    ["employeePage", "linksPage", "depositPage", "SOPPage", "SportsPage", "OtherPage"]
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        });

    document.querySelectorAll(".menu-item")
        .forEach(item => item.classList.remove("active"));

    const target = document.getElementById(page + "Page");
    if (target) target.style.display = "block";

    if (element) element.classList.add("active");
}

// ==============================
// MISTAKES
// ==============================
function getRunningMonth() {
    return new Date().toLocaleString("default", {
        month: "long",
        year: "numeric"
    });
}

function renderMistakes(csName) {

    const container = document.getElementById("mistakeContainer");
    if (!container) return;

    const runningMonth = getRunningMonth();

    container.innerHTML = `
        <div class="mistake-header">
            <div>
        
                <h2>Showing mistakes for the current month<h2>
            </div>
            <div class="month-badge">📅 ${runningMonth}</div>
        </div>
    `;

    const cleanName = String(csName || "").trim().toLowerCase();

    let mistakes = allData.filter(item => {

        const d = parseDate(item["Date"]);
        if (!d) return false;

        const itemMonth = d.toLocaleString("default", {
            month: "long",
            year: "numeric"
        });

        const itemName = String(item["CS Name"] || "").trim().toLowerCase();

        const matchName = !csName || itemName === cleanName;

        return matchName && itemMonth === runningMonth;
    });

    mistakes.sort((a, b) => parseDate(b["Date"]) - parseDate(a["Date"]));

    if (!mistakes.length) {
        container.innerHTML += `<p class="no-data">No mistakes found for ${runningMonth}</p>`;
        return;
    }

    const html = mistakes.map(item => {

        const date = parseDate(item["Date"]);

        const badgeColor = {
            "Wrong Information": "wrong-information",
            "Not Follow SOP": "not-follow-sop",
            "Late Reply": "late-reply",
            "No Reply": "no-reply",
            "Angry With Player": "angry-player",
            "Non Professional": "non-professional",
            "No solution": "no-solution",
            "No explanation": "no-explanation",
            "Verbal warning": "verbal-warning",
            "Warning letter": "warning-letter"
        };

        const colorClass = badgeColor[item["Subject"]] || "default";

        return `
        <div class="mistake-card ${colorClass}">
            <div class="card-top">
                <span class="subject">${item["Subject"]}</span>
                <span class="date">📅 ${date ? date.toLocaleDateString("en-GB") : "-"}</span>
            </div>

            <p class="remarks"><strong>REMARKS:</strong> ${item["Detailed Remark"] || "-"}</p>
            <hr>

            <p class="link">
                ${item["Screenshot link"]
                    ? `<a href="${item["Screenshot link"]}" target="_blank">View Screenshot</a>`
                    : "No Screenshot"}
            </p>
        </div>
        `;
    }).join("");

    container.innerHTML += html;

    container.innerHTML += `
        <div class="end-list">
            <hr><span>ⓘ End of list</span><hr>
        </div>
    `;
}

// ==============================
// LINKS
// ==============================
function renderLinks(category, containerId) {

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    allLinks
        .filter(item =>
            item.Category === category &&
            String(item.Active).toUpperCase() === "TRUE"
        )
        .forEach(item => {

            container.innerHTML += `
                <div class="link-card ${item.Color}">
                    <a href="${item.URL}" target="_blank">${item.Name}</a>
                </div>
            `;
        });
}
