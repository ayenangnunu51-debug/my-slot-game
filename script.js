// Supabase Setup
const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let timeRemaining = 30;
let hasPlacedBet = false;
let currentGameState = "BETTING";

// --- ၁။ Timer စနစ် (Auto Loop) ---
function startLiveTimer() {
    console.log("Timer Started");
    setInterval(() => {
        timeRemaining--;
        if (timeRemaining <= 0) {
            timeRemaining = 30;
            resetTable();
        }
        
        updateTimerUI();

        // ၁၀ စက္ကန့်အလိုမှာ ဖဲဝေမည်
        if (timeRemaining === 10) {
            currentGameState = "DEALING";
            startDealing();
        }
    }, 1000);
}

function updateTimerUI() {
    const bar = document.getElementById('timer-bar');
    const num = document.getElementById('timer-num');
    const status = document.getElementById('status-text');
    
    if(num) num.innerText = timeRemaining;
    if(bar) bar.style.width = (timeRemaining / 30) * 100 + "%";

    if (timeRemaining > 10) {
        if(status) status.innerText = "လောင်းကြေးတင်ရန် အချိန်ကျန်";
        document.getElementById('bet-btn').disabled = hasPlacedBet;
    } else {
        if(status) status.innerText = "ဖဲဝေနေသည်... ခေတ္တစောင့်ပါ";
        document.getElementById('bet-btn').disabled = true;
    }
}

// --- ၂။ ဖဲဝေခြင်း Logic (Fan Style) ---
function startDealing() {
    document.getElementById('snd-card').play();
    const ids = ['dealer-cards', 'p1-cards', 'p2-cards', 'p3-cards', 'p4-cards', 'me-cards'];
    let scores = {};

    ids.forEach((id, index) => {
        setTimeout(() => {
            const v1 = Math.floor(Math.random()*13), s1 = Math.floor(Math.random()*4);
            const v2 = Math.floor(Math.random()*13), s2 = Math.floor(Math.random()*4);
            
            document.getElementById(id).innerHTML = renderCard(v1, s1) + renderCard(v2, s2);
            scores[id] = (getVal(v1) + getVal(v2)) % 10;

            if (index === ids.length - 1 && hasPlacedBet) {
                checkWinLoss(scores);
            }
        }, index * 400);
    });
}

function renderCard(vIdx, sIdx) {
    const suits = ['♠', '♥', '♦', '♣'], values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const s = suits[sIdx], v = values[vIdx];
    return `<div class="card ${(s==='♥'||s==='♦')?'red':'black'}">
                <div class="v">${v}${s}</div>
                <div class="s">${s}</div>
            </div>`;
}

function getVal(n) { return (n >= 9) ? 0 : n + 1; }

// --- ၃။ Betting & Database Logic ---
async function placeLiveBet() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if (coins < bet) return alert("ငွေမလုံလောက်ပါ");
    
    coins -= bet;
    hasPlacedBet = true;
    updateUI();
    document.getElementById('my-bet-label').innerText = bet + " K";
    document.getElementById('bet-btn').disabled = true;
}

function checkWinLoss(scores) {
    const my = scores['me-cards'], dl = scores['dealer-cards'];
    const bet = parseInt(document.getElementById('bet-amount').value);
    
    setTimeout(() => {
        if (my > dl) {
            let mult = (my >= 8) ? 3 : 2;
            coins += bet * mult;
            document.getElementById('snd-win').play();
            alert("နိုင်ပါသည်!");
        } else if (my === dl) {
            coins += bet;
            alert("သရေ");
        } else {
            alert("ဒိုင်စားပါသည်");
        }
        syncDB();
    }, 1200);
}

// --- ၄။ Initialization ---
async function init() {
    if (!profileId) return;
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (data) {
        coins = data.coins;
        document.getElementById('display-user').innerText = data.username;
        updateUI();
        startLiveTimer(); // ပင်မ Timer စတင်နှိုးခြင်း
    }
}

function updateUI() { document.getElementById('balance').innerText = coins.toLocaleString(); }
async function syncDB() { await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId); updateUI(); }
function resetTable() {
    hasPlacedBet = false;
    document.getElementById('my-bet-label').innerText = "";
    ['dealer-cards', 'p1-cards', 'p2-cards', 'p3-cards', 'p4-cards', 'me-cards'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = "";
    });
}

init();
