const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0, pId = localStorage.getItem('game_user_id'), time = 30;

// Login စစ်ဆေးခြင်း
if (!pId && window.location.pathname.indexOf('signup.html') === -1) {
    window.location.href = 'signup.html';
}

function startTimer() {
    setInterval(() => {
        time--;
        if (time <= 0) { time = 30; resetTable(); }
        document.getElementById('timer-num').innerText = time;
        document.getElementById('timer-bar').style.width = (time/30)*100 + "%";
        if (time === 10) { dealCards(); }
    }, 1000);
}

function dealCards() {
    const seats = ['d-cards', 'p1-cards', 'p2-cards', 'p3-cards', 'p4-cards', 'my-cards'];
    seats.forEach((id, i) => {
        setTimeout(() => {
            document.getElementById(id).innerHTML = drawCard() + drawCard();
        }, i * 300);
    });
}

function drawCard() {
    const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const suits = ['♠','♥','♦','♣'];
    const r = ranks[Math.floor(Math.random()*13)];
    const s = suits[Math.floor(Math.random()*4)];
    const color = (s==='♥'||s==='♦') ? 'red' : '';
    return `<div class="card ${color}">${r}${s}</div>`;
}

function switchTab(name) {
    document.querySelectorAll('.tab-content').forEach(p => p.classList.remove('active'));
    document.getElementById(name + '-panel').classList.add('active');
}

function logout() {
    localStorage.removeItem('game_user_id');
    window.location.href = 'signup.html';
}

async function init() {
    if (!pId) return;
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', pId).maybeSingle();
    if (data) {
        document.getElementById('user-display').innerText = data.username;
        document.getElementById('coin-display').innerText = data.coins;
        startTimer();
    }
}
init();
function resetTable() { ['d-cards','p1-cards','p2-cards','p3-cards','p4-cards','my-cards'].forEach(id => document.getElementById(id).innerHTML = ""); }
