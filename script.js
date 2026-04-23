const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let isLogin = false;

const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createCardUI(vIdx, sIdx) {
    const s = suits[sIdx];
    const v = values[vIdx];
    const color = (s === '♥' || s === '♦') ? 'red' : 'black';
    return `<div class="card ${color}"><div class="t">${v}${s}</div><div class="m">${s}</div></div>`;
}

// Shan Multi-Player
async function playShanMulti() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if(coins < bet) return alert("ငွေမလုံလောက်ပါ");
    document.getElementById('shan-btn').disabled = true;
    coins -= bet; updateUI();
    document.getElementById('snd-card').play();

    const slots = ['dealer-cards', 'p1-cards', 'me-cards', 'p2-cards', 'p3-cards', 'p4-cards'];
    let finalScores = {};

    slots.forEach(slot => {
        const v1 = Math.floor(Math.random()*13); const s1 = Math.floor(Math.random()*4);
        const v2 = Math.floor(Math.random()*13); const s2 = Math.floor(Math.random()*4);
        document.getElementById(slot).innerHTML = createCardUI(v1, s1) + createCardUI(v2, s2);
        finalScores[slot] = (getScore(v1) + getScore(v2)) % 10;
    });

    setTimeout(() => {
        const myScore = finalScores['me-cards'];
        const dScore = finalScores['dealer-cards'];
        if(myScore > dScore) {
            let win = (myScore >= 8) ? bet * 3 : bet * 2;
            coins += win; document.getElementById('snd-win').play(); alert(`နိုင်ပါသည်! ရှမ်း ${myScore}`);
        } else if(myScore === dScore) {
            coins += bet; alert("သရေကျပါသည်");
        } else { alert(`ဒိုင်စားသွားပါသည် (ဒိုင်: ${dScore})`); }
        syncDB(); document.getElementById('shan-btn').disabled = false;
    }, 1200);
}

function getScore(n) { return (n >= 9) ? 0 : n + 1; }

// Slot Machine
async function playSlot() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if(coins < bet) return alert("ငွေမလုံလောက်ပါ");
    coins -= bet; updateUI();
    document.getElementById('snd-spin').play();
    let count = 0;
    const interval = setInterval(() => {
        const icons = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];
        const r = [icons[Math.floor(Math.random()*6)], icons[Math.floor(Math.random()*6)], icons[Math.floor(Math.random()*6)]];
        document.getElementById('r1').innerText = r[0]; document.getElementById('r2').innerText = r[1]; document.getElementById('r3').innerText = r[2];
        if(++count > 10) {
            clearInterval(interval);
            if(r[0]===r[1] && r[1]===r[2]) { coins += bet*10; document.getElementById('snd-win').play(); alert("JACKPOT!"); }
            syncDB();
        }
    }, 100);
}

// Dice
async function playDice(choice) {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if(coins < bet) return alert("ငွေမလုံလောက်ပါ");
    coins -= bet; updateUI();
    const res = Math.floor(Math.random()*6)+1;
    document.getElementById('dice-view').innerText = ['⚀','⚁','⚂','⚃','⚄','⚅'][res-1];
    if((choice==='high' && res>=4) || (choice==='low' && res<=3)) { coins += bet*1.9; document.getElementById('snd-win').play(); }
    syncDB();
}

// Auth & Core
async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(!isLogin) {
        const { data } = await supabaseClient.from('profiles').insert([{username: user, password: pass, coins: 5000}]).select().single();
        if(data) { localStorage.setItem('game_user_id', data.id); location.reload(); }
    } else {
        const { data } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if(data) { localStorage.setItem('game_user_id', data.id); location.reload(); } else alert("မှားယွင်းနေပါသည်။");
    }
}

async function init() {
    if(!profileId) return;
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('game-page').style.display = 'block';
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if(data) { coins = data.coins; document.getElementById('display-user').innerText = data.username; updateUI(); }
}

function updateUI() { document.getElementById('balance').innerText = coins.toLocaleString(); }
async function syncDB() { await supabaseClient.from('profiles').update({coins: coins}).eq('id', profileId); updateUI(); }
function toggleAuth() { isLogin = !isLogin; document.getElementById('auth-title').innerText = isLogin ? "LOGIN" : "CREATE ACCOUNT"; }
function switchGame(t) { 
    ['shan', 'slot', 'dice'].forEach(g => document.getElementById(g+'-area').style.display = (g===t?'block':'none'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.id==='btn-'+t));
}
function handleLogout() { localStorage.clear(); location.reload(); }
function openWallet(t) { document.getElementById('wallet-modal').style.display='flex'; }
function closeWallet() { document.getElementById('wallet-modal').style.display='none'; }
init();
