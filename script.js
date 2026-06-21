const mesice = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];
let tempYear = 2026, aktualniRok = 2026, aktualniMesic = 0, aktualniDen = 1, currentCategory = 'daily'; 
let lastGeneratedTextReport = ''; 

// --- Navigace --- 
function showScreen(id) { 
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden')); 
    document.getElementById(id).classList.remove('hidden'); 
    if (id === 'settings-screen') renderTemplates(); 
} 

function changeYear(delta) { 
    tempYear += delta; 
    document.getElementById('year-display').innerText = tempYear; 
} 

// --- Výběr roku ---
function selectYear() { 
    aktualniRok = tempYear; 
    document.getElementById('selected-year-title').innerText = aktualniRok; 
    initMonths(); 
    showScreen('year-screen'); 
} 

// --- Kalendář --- 
function initMonths() { 
    const grid = document.getElementById('months-grid'); 
    grid.innerHTML = ''; 
    mesice.forEach((m, i) => { 
        const b = document.createElement('button'); 
        b.className = 'btn-main'; 
        b.innerText = m; 
        b.onclick = () => { openMonthMenu(i); }; 
        grid.appendChild(b); 
    }); 
} 

function openMonthMenu(mIdx) {
    aktualniMesic = mIdx;
    document.getElementById('menu-month-title').innerText = mesice[mIdx];
    showScreen('month-menu-screen');
}

function selectCategory(cat) {
    currentCategory = cat;
    const badge = document.getElementById('current-category-badge');
    if (cat === 'daily') {
        badge.innerText = 'Můj plán';
        badge.style.backgroundColor = '#e2e8f0';
    } else {
        badge.innerText = 'Jakub';
        badge.style.backgroundColor = '#dbeafe';
    }
    showDays();
}

function showDays() { 
    const grid = document.getElementById('days-grid'); 
    grid.innerHTML = ''; 
    document.getElementById('current-month-title').innerText = mesice[aktualniMesic]; 
    const days = new Date(aktualniRok, aktualniMesic + 1, 0).getDate(); 
    
    for(let i = 1; i <= days; i++) { 
        const b = document.createElement('button'); 
        b.className = 'btn-main'; 
        b.innerText = i; 
        b.onclick = () => { aktualniDen = i; openModal(); }; 
        grid.appendChild(b); 
    } 
    showScreen('day-screen'); 
} 

// --- Modální okna --- 
function openModal() { 
    document.getElementById('date-label').innerText = `${aktualniDen}. ${mesice[aktualniMesic]} ${aktualniRok}`; 
    const priceInput = document.getElementById('price-input');
    if (currentCategory === 'daily') {
        priceInput.style.display = 'none';
    } else {
        priceInput.style.display = 'block';
    }
    document.getElementById('task-modal').classList.remove('hidden'); 
    renderTemplates(); 
    renderTasks(); 
} 

function closeModal(id) { 
    document.getElementById(id).classList.add('hidden'); 
} 

// --- Úkoly --- 
function addTask() { 
    const taskDropdown = document.getElementById('template-dropdown'); 
    const taskName = taskDropdown.value; 
    if (!taskName) return; 
     
    let finalTaskText = taskName;
    const key = `tasks_${currentCategory}_${aktualniRok}_${aktualniMesic}_${aktualniDen}`;

    if (currentCategory === 'jakub') {
        const priceValue = document.getElementById('price-input').value.trim();
        if (priceValue) {
            finalTaskText = `${taskName} | ${priceValue}`;
        }
    }

    const tasks = JSON.parse(localStorage.getItem(key) || '[]'); 
    tasks.push(finalTaskText); 
    localStorage.setItem(key, JSON.stringify(tasks)); 
    
    document.getElementById('price-input').value = '';
    renderTasks(); 
} 

function renderTasks() { 
    const list = document.getElementById('task-list'); 
    const key = `tasks_${currentCategory}_${aktualniRok}_${aktualniMesic}_${aktualniDen}`;
    const tasks = JSON.parse(localStorage.getItem(key) || '[]'); 
     
    list.innerHTML = tasks.map((t, i) => ` 
        <div class="task-item"> 
            <span>${t}</span> 
            <button onclick="deleteTask('${key}', ${i})" style="color:var(--danger); border:none; background:none; font-weight:bold; cursor:pointer; font-size:1.1rem;">✕</button> 
        </div>`).join(''); 
} 

function deleteTask(key, i) { 
    const tasks = JSON.parse(localStorage.getItem(key)); 
    tasks.splice(i, 1); 
    localStorage.setItem(key, JSON.stringify(tasks)); 
    renderTasks(); 
} 

// --- Databáze šablon --- 
function renderTemplates() { 
    const drop = document.getElementById('template-dropdown'); 
    const base = JSON.parse(localStorage.getItem('my_tasks_base') || '[]'); 
    
    if (drop) {
        drop.innerHTML = '<option value="">Vyberte úkol z DB</option>'; 
        base.forEach(t => drop.innerHTML += `<option value="${t}">${t}</option>`); 
    }
    
    const list = document.getElementById('templates-list');
    if (list) {
        list.innerHTML = base.map((t, i) => `
            <div class="task-item">
                <span>${t}</span>
                <button onclick="deleteTemplate(${i})" style="color:var(--danger); border:none; background:none; font-weight:bold; cursor:pointer; font-size:1.1rem;">✕</button>
            </div>`).join('');
    }
} 

function addTemplate() { 
    const inp = document.getElementById('template-input'); 
    if(!inp.value || inp.value.trim() === "") return; 
    const base = JSON.parse(localStorage.getItem('my_tasks_base') || '[]'); 
    base.push(inp.value.trim()); 
    localStorage.setItem('my_tasks_base', JSON.stringify(base)); 
    inp.value = ''; 
    renderTemplates(); 
} 

function deleteTemplate(index) {
    const base = JSON.parse(localStorage.getItem('my_tasks_base') || '[]'); 
    base.splice(index, 1);
    localStorage.setItem('my_tasks_base', JSON.stringify(base)); 
    renderTemplates();
}

// --- Pokročilý export podle let ---
function exportDataByYear() {
    const selectedYear = document.getElementById('backup-year-select').value;
    let backupData = {};
    
    if (localStorage.getItem('my_tasks_base')) {
        backupData['my_tasks_base'] = localStorage.getItem('my_tasks_base');
    }

    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key.startsWith('tasks_')) {
            if (selectedYear === 'all') {
                backupData[key] = localStorage.getItem(key);
            } else {
                let parts = key.split('_');
                if (parts[2] === selectedYear) {
                    backupData[key] = localStorage.getItem(key);
                }
            }
        }
    }
    
    let blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    
    let fileName = selectedYear === 'all' ? 'planner_zaloha_VSE.json' : `planner_zaloha_${selectedYear}.json`;
    a.download = fileName;
    a.click();
}

// --- Import dat ---
function importAllData(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let importedData = JSON.parse(e.target.result);
            Object.keys(importedData).forEach(key => {
                localStorage.setItem(key, importedData[key]);
            });
            alert('Data byla úspěšně importována a spojena!');
            renderTemplates();
        } catch (err) {
            alert('Chyba: Neplatný soubor zálohy.');
        }
    };
    reader.readAsText(file);
}

// --- Přehled a kopírování --- 
function showMonthlyReport(cat) { 
    const content = document.getElementById('report-content'); 
    content.innerHTML = ''; 
    let textReportArr = []; 
    const days = new Date(aktualniRok, aktualniMesic + 1, 0).getDate(); 
     
    for(let d = 1; d <= days; d++) { 
        const key = `tasks_${cat}_${aktualniRok}_${aktualniMesic}_${d}`;
        const tasks = JSON.parse(localStorage.getItem(key) || '[]'); 
         
        if(tasks.length > 0) { 
            let dayBlock = `<div style="margin-bottom: 15px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px;">`;
            dayBlock += `<strong style="font-size: 1.1rem; color: var(--primary); display: block; margin-bottom: 5px;">${d}. ${mesice[aktualniMesic]}:</strong>`;
            let textDayBlock = `${d}. ${mesice[aktualniMesic]}:\n`;
            
            tasks.forEach(task => {
                dayBlock += `<div style="padding: 3px 0 3px 10px; font-size: 1rem; color: #334155;">• ${task}</div>`;
                textDayBlock += `• ${task}\n`;
            });
            
            dayBlock += `</div>`;
            content.innerHTML += dayBlock; 
            textReportArr.push(textDayBlock);
        } 
    } 
    
    lastGeneratedTextReport = textReportArr.join('\n');
    if(!lastGeneratedTextReport) {
        content.innerHTML = '<div style="text-align:center; color:#64748b; padding-top:20px;">Žádné úkoly pro tento měsíc</div>';
        lastGeneratedTextReport = "Žádné úkoly.";
    }
    document.getElementById('report-modal').classList.remove('hidden'); 
}

function copyReportToClipboard() {
    navigator.clipboard.writeText(lastGeneratedTextReport).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const oldText = copyBtn.innerText;
        copyBtn.innerText = 'OK!';
        copyBtn.style.borderColor = '#10b981';
        copyBtn.style.color = '#10b981';
        setTimeout(() => {
            copyBtn.innerText = oldText;
            copyBtn.style.borderColor = '#ef4444';
            copyBtn.style.color = '#ef4444';
        }, 1200);
    }).catch(err => {
        alert('Chyba při kopírování: ' + err);
    });
}

// --- Registrace Service Workeru pro PWA mobilní instalaci ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registrován úspěšně.', reg))
            .catch(err => console.log('Registrace Service Workeru selhala.', err));
    });
}

initMonths();