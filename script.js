// Supabase Configuration
const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

// Game Variables
let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let isLogin = false;
let timeRemaining = 30;
let hasPlacedBet = false;
let currentGameState = "BETTING"; // BETTING or DEALING

const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// --- ၁။ Timer စနစ် (၂၄ နာရီပတ်လုံး အလိုလိုလည်ပတ်ရန်) ---
function startLiveLoop() {
    setInterval(() => {
        timeRemaining--;
        if (timeRemaining <= 0) {
            timeRemaining = 30;
            resetTable();
        }
        
        updateTimerUI();

        // ၁၀ စက္ကန့်အလိုမှာ ဖဲဝေခြင်းကို စတင်မည်
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
        status.innerText = "လောင်းကြေးတင်ရန် အချိန်ကျန်";
        status.style.color = "#28a745";
        document.getElementById('bet-btn').disabled = hasPlacedBet;
        currentGameState = "BETTING";
    } else {
        status.innerText = "ဖဲဝေနေသည်... ခေတ္တစောင့်ပါ";
        status.style.color = "#dc3545";
        document.getElementById('bet-btn').disabled = true;
    }
}

// --- ၂။ ဖဲဝေခြင်း Logic (ပုံထဲကအတိုင်း Fan Style ဖြန့်ဝေရန်) ---
function startDealing() {
    document.getElementById('snd-card').play();
    const seatIds = ['dealer-cards', 'p1-cards', 'p2-cards', 'p3-cards', 'p4-cards', 'me-cards'];
    let finalScores = {};

    seatIds.forEach((id, index) => {
        setTimeout(() => {
            const card1 = getRandomCard();
            const card2 = getRandomCard();
            
            const cardHTML = renderCard(card1) + renderCard(card2);
            document.getElementById(id).innerHTML = cardHTML;
            
            finalScores[id] = (getCardValue(card1.v) + getCardValue(card2.v)) % 10;

            // အားလုံးဝေပြီးလို့ ကိုယ့်အလှည့်ရောက်ရင် ရလဒ်တွက်မည်
            if (index === seatIds.length - 1 && hasPlacedBet) {
                calculateResult(finalScores);
            }
        }, index * 300); // တစ်ယောက်ချင်းစီကို Delay လေးနဲ့ ဝေပေးခြင်း
    });
}

function getRandomCard() {
    const v = values[Math.floor(Math.random() * values.length)];
    const s = suits[Math.floor(Math.random() * suits.length)];
    const color = (s === '♥' || s === '♦') ? 'red' : 'black';
    return { v, s, color };
}

function renderCard(card) {
    return `<div class="card ${card.color}">
                <div class="t">${card.v}${card.s}</div>
                <div class="m">${card.s}</div>
            </div>`;
}

function getCardValue(v) {
    if (['10', 'J', 'Q', 'K'].includes(v)) return 0;
    if (v === 'A') return 1;
    return parseInt(v);
}

// --- ၃။ လောင်းကြေးနှင့် ရလဒ်ပိုင်း ---
async function placeLiveBet() {
    const betAmt = parseInt(document.getElementById('bet-amount').value);
    if (coins < betAmt) return alert("ငွေမလုံလောက်ပါ");
    if (currentGameState !== "BETTING") return alert("နောက်တစ်ပွဲစောင့်ပါ");

    coins -= betAmt;
    hasPlacedBet = true;
    updateBalanceUI();
    document.getElementById('my-bet-label').innerText = `(${betAmt} K)`;
    document.getElementById('bet-btn').disabled = true;
}

function calculateResult(scores) {
    const myScore = scores['me-cards'];
    const dealerScore = scores['dealer-cards'];
    const betAmt = parseInt(document.getElementById('bet-amount').value);

    setTimeout(() => {
        if (myScore > dealerScore) {
            let winMultiplier = (myScore >= 8) ? 3 : 2;
            coins += betAmt * winMultiplier;
            document.getElementById('snd-win').play();
            alert(`နိုင်ပါသည်! သင်: ${myScore} / ဒိုင်: ${dealerScore}`);
        } else if (myScore === dealerScore) {
            coins += betAmt;
            alert("သရေကျပါသည်");
        } else {
            alert(`ဒိုင်စားပါသည်! သင်: ${myScore} / ဒိုင်: ${dealerScore}`);
        }
        syncWithDatabase();
    }, 1000);
}

// --- ၄။ System Functions (Database & UI) ---
async function init() {
    if (!profileId) {
        document.getElementById('auth-page').style.display = 'block';
        return;
    }
    
    const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (data) {
        coins = data.coins;
        document.getElementById('display-user').innerText = data.username;
        document.getElementById('auth-page').style.display = 'none';
        document.getElementById('game-page').style.display = 'block';
        updateBalanceUI();
        startLiveLoop(); // Timer စတင်ခြင်း
    }
}

async function syncWithDatabase() {
    await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
    updateBalanceUI();
}

function updateBalanceUI() {
    document.getElementById('balance').innerText = coins.toLocaleString();
}

function resetTable() {
    hasPlacedBet = false;
    document.getElementById('my-bet-label').innerText = "";
    const seatIds = ['dealer-cards', 'p1-cards', 'p2-cards', 'p3-cards', 'p4-cards', 'me-cards'];
    seatIds.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = "";
    });
}

// Auth Toggle & Login Logic
function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? "LOGIN" : "CREATE ACCOUNT";
    document.getElementById('auth-btn').innerText = isLogin ? "ဝင်ရောက်မည်" : "အကောင့်ဖွင့်မည်";
}

async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    
    if(!isLogin) {
        const { data } = await supabaseClient.from('profiles').insert([{username: user, password: pass, coins: 5000}]).select().single();
        if(data) { localStorage.setItem('game_user_id', data.id); location.reload(); }
    } else {
        const { data } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if(data) { localStorage.setItem('game_user_id', data.id); location.reload(); } else alert("အချက်အလက်မှားယွင်းနေပါသည်။");
    }
}

function handleLogout() {
    localStorage.clear();
    location.reload();
}

// Start the App
init();
