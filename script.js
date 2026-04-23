let coins = 5000, pId = localStorage.getItem('game_user_id'), time = 30;

if (!pId && !window.location.href.includes('signup.html')) {
    window.location.href = 'signup.html';
}

const symbols = ['🍒', '🍋', '🔔', '💎', '7️⃣', '🍀'];

// Slot Logic
function spinSlot() {
    if (coins < 100) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ");
    coins -= 100; updateUI();
    document.getElementById('slot-msg').innerText = "လှည့်နေသည်...";
    
    let res = [0,0,0].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
    
    setTimeout(() => {
        document.getElementById('s1').innerText = res[0];
        document.getElementById('s2').innerText = res[1];
        document.getElementById('s3').innerText = res[2];

        if (res[0] === res[1] && res[1] === res[2]) {
            coins += 5000;
            document.getElementById('slot-msg').innerText = "🏆 BIG WIN! +5000 K";
        } else {
            document.getElementById('slot-msg').innerText = "ထပ်မံကြိုးစားပါ";
        }
        updateUI();
    }, 1000);
}

// Shan Koe Mee Timer
function startTimer() {
    setInterval(() => {
        time--;
        if (time <= 0) { time = 30; resetTable(); }
        document.getElementById('timer-num').innerText = time;
        document.getElementById('bar').style.width = (time/30)*100 + "%";
        if (time === 10) dealCards();
    }, 1000);
}

function dealCards() {
    ['d-cards','p1-cards','p2-cards','my-cards'].forEach(id => {
        document.getElementById(id).innerHTML = `<div class="card">A♠</div><div class="card">9♥</div>`;
    });
}

function tab(n) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(n).classList.add('active');
    document.getElementById('t-'+n).classList.add('active');
}

function updateUI() {
    document.getElementById('user-display').innerText = localStorage.getItem('game_username');
    document.getElementById('coin-display').innerText = coins.toLocaleString();
}

function logout() { localStorage.clear(); window.location.href = 'signup.html'; }
function resetTable() { ['d-cards','p1-cards','p2-cards','my-cards'].forEach(id => document.getElementById(id).innerHTML = ""); }

updateUI();
startTimer();
