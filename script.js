const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let isLogin = false;

const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Card UI Generator
function createCard(vIdx, sIdx) {
    const s = suits[sIdx];
    const v = values[vIdx];
    const color = (s === '♥' || s === '♦') ? 'red' : 'black';
    return `<div class="card ${color}">
        <div class="t">${v}${s}</div>
        <div class="m">${s}</div>
    </div>`;
}

// Shan Koe Mee Multi-Player Logic
async function playShanMulti() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if(coins < bet) return alert("ငွေမလုံလောက်ပါ");
    
    document.getElementById('shan-btn').disabled = true;
    coins -= bet; updateUI();
    document.getElementById('snd-card').play();

    const slots = ['dealer-cards', 'p1-cards', 'me-cards', 'p2-cards', 'p3-cards', 'p4-cards'];
    let scores = {};

    slots.forEach(slot => {
        const v1 = Math.floor(Math.random()*13);
        const s1 = Math.floor(Math.random()*4);
        const v2 = Math.floor(Math.random()*13);
        const s2 = Math.floor(Math.random()*4);
        
        document.getElementById(slot).innerHTML = createCard(v1, s1) + createCard(v2, s2);
        scores[slot] = (getScore(v1) + getScore(v2)) % 10;
    });

    setTimeout(() => {
        const myScore = scores['me-cards'];
        const dScore = scores['dealer-cards'];

        if(myScore > dScore) {
            let win = (myScore >= 8) ? bet * 3 : bet * 2;
            coins += win; document.getElementById('snd-win').play();
            alert(`နိုင်ပါသည်! ရှမ်း ${myScore} ပေါက်`);
        } else if(myScore === dScore) {
            coins += bet; alert("သရေကျပါသည်");
        } else {
            alert(`ဒိုင်စားသွားပါသည် (ဒိုင်: ${dScore} မှတ်)`);
        }
        syncDB();
        document.getElementById('shan-btn').disabled = false;
    }, 1200);
}

function getScore(n) { return (n >= 9) ? 0 : n + 1; }

// Core Functions (Auth, UI, Sync)
async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(!isLogin) {
        const { data: exist } = await supabaseClient.from('profiles').select('username').eq('username', user).maybeSingle();
        if(exist) return alert("နာမည်ရှိပြီးသားပါ။");
        const { data } = await supabaseClient.from('profiles').insert([{username: user, password: pass, coins: 5000}]).select().single();
        localStorage.setItem('game_user_id', data.id); location.reload();
    } else {
        const { data } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if(data) { localStorage.setItem('game_user_id', data.id); location.reload(); }
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
async function syncDB() { await supabaseClient.from('profiles').update({coins: coins}).eq('id', profileId); }
function toggleAuth() { isLogin = !isLogin; document.getElementById('auth-title').innerText = isLogin ? "LOGIN" : "CREATE ACCOUNT"; }
function switchGame(t) { 
    ['shan', 'slot', 'dice'].forEach(g => document.getElementById(g+'-area').style.display = (g===t?'block':'none'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.id==='btn-'+t));
}
function handleLogout() { localStorage.clear(); location.reload(); }
init();
