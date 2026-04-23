const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0, profileId = localStorage.getItem('game_user_id'), isLogin = false;
let timeRemaining = 30, hasPlacedBet = false, currentGameState = "BETTING";

const suits = ['♠', '♥', '♦', '♣'], values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// --- Live Timer System ---
function startLiveTimer() {
    setInterval(() => {
        timeRemaining--;
        if (timeRemaining <= 0) { timeRemaining = 30; resetTable(); }
        updateTimerUI();
        if (timeRemaining === 10) startDealingPhase();
    }, 1000);
}

function updateTimerUI() {
    const bar = document.getElementById('timer-bar'), num = document.getElementById('timer-num'), status = document.getElementById('status-text');
    num.innerText = timeRemaining;
    bar.style.width = (timeRemaining / 30) * 100 + "%";
    if (timeRemaining > 10) {
        status.innerText = "လောင်းကြေးတင်ရန် အချိန်ကျန်"; status.style.color = "#28a745";
        document.getElementById('bet-btn').disabled = hasPlacedBet;
        currentGameState = "BETTING";
    } else {
        status.innerText = "ဖဲဝေနေသည်..."; status.style.color = "#dc3545";
        document.getElementById('bet-btn').disabled = true;
        currentGameState = "DEALING";
    }
}

// --- Card Logic ---
function createCardUI(vIdx, sIdx) {
    const s = suits[sIdx], v = values[vIdx];
    return `<div class="card ${ (s === '♥' || s === '♦') ? 'red' : 'black' }">
                <div class="t">${v}${s}</div><div class="m">${s}</div>
            </div>`;
}

function placeLiveBet() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if (coins < bet) return alert("ငွေမလုံလောက်ပါ");
    if (currentGameState !== "BETTING") return alert("နောက်တစ်ပွဲစောင့်ပါ");
    coins -= bet; hasPlacedBet = true; updateUI();
    document.getElementById('my-bet-status').innerText = bet + "K";
    document.getElementById('bet-btn').disabled = true;
}

function startDealingPhase() {
    document.getElementById('snd-card').play();
    const slots = ['dealer-cards', 'p1-cards', 'me-cards', 'p2-cards', 'p3-cards', 'p4-cards'];
    let scores = {};

    slots.forEach((slot, index) => {
        setTimeout(() => {
            const v1 = Math.floor(Math.random()*13), s1 = Math.floor(Math.random()*4);
            const v2 = Math.floor(Math.random()*13), s2 = Math.floor(Math.random()*4);
            document.getElementById(slot).innerHTML = createCardUI(v1, s1) + createCardUI(v2, s2);
            scores[slot] = ( (v1 >= 9 ? 0 : v1+1) + (v2 >= 9 ? 0 : v2+1) ) % 10;
            if (index === slots.length - 1 && hasPlacedBet) checkResult(scores);
        }, index * 200);
    });
}

function checkResult(scores) {
    const bet = parseInt(document.getElementById('bet-amount').value);
    setTimeout(() => {
        if (scores['me-cards'] > scores['dealer-cards']) {
            let win = (scores['me-cards'] >= 8) ? bet * 3 : bet * 2;
            coins += win; document.getElementById('snd-win').play();
        } else if (scores['me-cards'] === scores['dealer-cards']) { coins += bet; }
        syncDB();
    }, 1500);
}

function resetTable() {
    hasPlacedBet = false; document.getElementById('my-bet-status').innerText = "";
    ['dealer-cards', 'p1-cards', 'me-cards', 'p2-cards', 'p3-cards', 'p4-cards'].forEach(s => document.getElementById(s).innerHTML = "");
}

// --- Other Games & System ---
async function playSlot() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if(coins < bet) return alert("ငွေမလုံလောက်ပါ");
    coins -= bet; updateUI();
    let c = 0; const itv = setInterval(() => {
        const icons = ['💎', '🍒', '🔔', '⭐'];
        document.getElementById('r1').innerText = icons[Math.floor(Math.random()*4)];
        document.getElementById('r2').innerText = icons[Math.floor(Math.random()*4)];
        document.getElementById('r3').innerText = icons[Math.floor(Math.random()*4)];
        if(++c > 10) { clearInterval(itv); syncDB(); }
    }, 100);
}

async function handleAuth() {
    const user = document.getElementById('username').value.trim(), pass = document.getElementById('password').value.trim();
    if (!isLogin) {
        const { data } = await supabaseClient.from('profiles').insert([{username: user, password: pass, coins: 5000}]).select().single();
        if (data) { localStorage.setItem('game_user_id', data.id); location.reload(); }
    } else {
        const { data } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if (data) { localStorage.setItem('game_user_id', data.id); location.reload(); }
    }
}

async function init() {
    if (!profileId) return;
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('game-page').style.display = 'block';
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (data) { coins = data.coins; document.getElementById('display-user').innerText = data.username; updateUI(); startLiveTimer(); }
}

function updateUI() { document.getElementById('balance').innerText = coins.toLocaleString(); }
async function syncDB() { await supabaseClient.from('profiles').update({coins: coins}).eq('id', profileId); updateUI(); }
function toggleAuth() { isLogin = !isLogin; document.getElementById('auth-title').innerText = isLogin ? "LOGIN" : "CREATE ACCOUNT"; }
function switchGame(t) { 
    ['shan', 'slot', 'dice'].forEach(g => document.getElementById(g+'-area').style.display = (g===t?'block':'none'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.id==='btn-'+t));
}
function handleLogout() { localStorage.clear(); location.reload(); }
function openWallet() { document.getElementById('wallet-modal').style.display='flex'; }
function closeWallet() { document.getElementById('wallet-modal').style.display='none'; }
init();
