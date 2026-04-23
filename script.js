const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 5000, pId = localStorage.getItem('game_user_id'), time = 30, betted = false;

// ၁။ Login Check
if (!pId && !window.location.href.includes('signup.html')) {
    window.location.href = 'signup.html';
}

// ၂။ Slot Game Functions
const symbols = ['🍒', '🍋', '🔔', '💎', '7️⃣', '🍀'];
function spinSlot() {
    if (coins < 100) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ");
    coins -= 100; updateUI();
    document.getElementById('slot-status').innerText = "လှည့်နေသည်...";
    
    let result = [0,0,0].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
    
    setTimeout(() => {
        document.getElementById('s1').innerText = result[0];
        document.getElementById('s2').innerText = result[1];
        document.getElementById('s3').innerText = result[2];

        if (result[0] === result[1] && result[1] === result[2]) {
            coins += 5000;
            document.getElementById('slot-status').innerText = "🏆 BIG WIN! +5000 K";
        } else {
            document.getElementById('slot-status').innerText = "ထပ်မံကြိုးစားပါ";
        }
        updateUI();
    }, 1000);
}

// ၃။ ရှမ်းကိုးမီး Timer & Deal
function startLoop() {
    setInterval(() => {
        time--;
        if (time <= 0) { time = 30; resetTable(); }
        document.getElementById('timer-num').innerText = time;
        document.getElementById('bar').style.width = (time/30)*100 + "%";
        if (time === 10) dealCards();
    }, 1000);
}

function dealCards() {
    ['d-cards','p1-cards','p2-cards','my-cards'].forEach((id, i) => {
        setTimeout(() => {
            document.getElementById(id).innerHTML = `<div class="card">A♠</div><div class="card">8♣</div>`;
        }, i * 300);
    });
}

function updateUI() {
    document.getElementById('user-display').innerText = localStorage.getItem('game_username');
    document.getElementById('coin-display').innerText = coins.toLocaleString();
}

function tab(n) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(n).classList.add('active');
    document.getElementById('t-'+n).classList.add('active');
}

function logout() { localStorage.clear(); window.location.href = 'signup.html'; }
function resetTable() { ['d-cards','p1-cards','p2-cards','my-cards'].forEach(id => document.getElementById(id).innerHTML = ""); }

updateUI();
startLoop();
