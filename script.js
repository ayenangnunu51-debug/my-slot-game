const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let isLogin = false;
let currentWallet = '';

// --- Auth Section ---
function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? "LOGIN" : "CREATE ACCOUNT";
    document.getElementById('auth-btn').innerText = isLogin ? "Login ဝင်မည်" : "အကောင့်ဖွင့်မည်";
}

async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(!user || !pass) return alert("Username နှင့် Password ဖြည့်ပါ");

    if(!isLogin) {
        // Username တူမတူစစ်ခြင်း
        const { data: exist } = await supabaseClient.from('profiles').select('username').eq('username', user).maybeSingle();
        if(exist) return alert("❌ ဤနာမည် သုံးပြီးသားဖြစ်နေပါသည်။");

        const { data, error } = await supabaseClient.from('profiles').insert([{username: user, password: pass, coins: 5000}]).select().single();
        if(error) return alert(error.message);
        localStorage.setItem('game_user_id', data.id);
        location.reload();
    } else {
        const { data } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if(data) { localStorage.setItem('game_user_id', data.id); location.reload(); }
        else alert("❌ မှားယွင်းနေပါသည်။");
    }
}

// --- App Logic ---
async function init() {
    if(!profileId) return;
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('game-page').style.display = 'block';

    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if(data) {
        coins = data.coins;
        document.getElementById('display-user').innerText = data.username;
        updateUI();

        // Daily Bonus (တစ်နေ့တစ်ကြိမ်)
        const today = new Date().toDateString();
        if(data.last_login !== today) {
            coins += 1000;
            alert("🎁 နေ့စဉ်လက်ဆောင် 1,000 K ရရှိပါသည်!");
            await supabaseClient.from('profiles').update({coins: coins, last_login: today}).eq('id', profileId);
            updateUI();
        }
    } else { localStorage.clear(); location.reload(); }
}

function updateUI() { document.getElementById('balance').innerText = coins.toLocaleString(); }
async function syncDB() { await supabaseClient.from('profiles').update({coins: coins}).eq('id', profileId); updateUI(); }

function switchGame(type) {
    ['slot', 'dice', 'wheel'].forEach(g => document.getElementById(g+'-area').style.display = g === type ? 'block' : 'none');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.id === 'btn-'+type));
}

// --- Game Logic ---
async function playSlot() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if(coins < bet) return alert("လက်ကျန်ငွေမလုံလောက်ပါ");
    coins -= bet; updateUI();
    document.getElementById('snd-spin').play();
    let c = 0;
    const t = setInterval(() => {
        const icons = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];
        const r = [icons[Math.floor(Math.random()*6)], icons[Math.floor(Math.random()*6)], icons[Math.floor(Math.random()*6)]];
        document.getElementById('r1').innerText = r[0]; document.getElementById('r2').innerText = r[1]; document.getElementById('r3').innerText = r[2];
        if(++c > 12) {
            clearInterval(t);
            if(r[0]===r[1] && r[1]===r[2]) { coins += bet*10; document.getElementById('snd-win').play(); alert("JACKPOT x10!"); }
            else if(r[0]===r[1] || r[1]===r[2] || r[0]===r[2]) { coins += bet*2; alert("WIN x2!"); }
            syncDB();
        }
    }, 100);
}

async function playDice(choice) {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if(coins < bet) return alert("လက်ကျန်ငွေမလုံလောက်ပါ");
    coins -= bet; updateUI();
    document.getElementById('snd-dice').play();
    const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    let c = 0;
    const t = setInterval(() => {
        document.getElementById('dice-view').innerText = faces[Math.floor(Math.random()*6)];
        if(++c > 10) {
            clearInterval(t);
            const res = Math.floor(Math.random()*6)+1;
            document.getElementById('dice-view').innerText = faces[res-1];
            if((choice==='high' && res>=4) || (choice==='low' && res<=3)) { coins += bet*1.9; document.getElementById('snd-win').play(); alert("DICE WIN!"); }
            else alert("ရှုံးပါသည်");
            syncDB();
        }
    }, 100);
}

async function playWheel() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if(coins < bet) return alert("လက်ကျန်ငွေမလုံလောက်ပါ");
    coins -= bet; updateUI();
    const w = document.getElementById('wheel-inner');
    const deg = Math.floor(Math.random()*360) + 1440;
    w.style.transition = "transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)";
    w.style.transform = `rotate(${deg}deg)`;
    setTimeout(() => {
        const mult = [0, 2, 0, 5, 0, 1.5][Math.floor(Math.random()*6)];
        if(mult > 0) { coins += bet*mult; document.getElementById('snd-win').play(); alert(`WHEEL WIN x${mult}`); }
        else alert("နောက်တစ်ခေါက် ပြန်ကြိုးစားပါ");
        w.style.transition = "none"; w.style.transform = "rotate(0deg)";
        syncDB();
    }, 3200);
}

// --- Wallet ---
function openWallet(type) { currentWallet = type; document.getElementById('w-title').innerText = type==='deposit' ? "ငွေသွင်း" : "ငွေထုတ်"; document.getElementById('wallet-modal').style.display='flex'; }
function closeWallet() { document.getElementById('wallet-modal').style.display='none'; }
async function submitWallet() {
    const amt = parseInt(document.getElementById('w-amount').value);
    if(!amt || amt < 1000) return alert("အနည်းဆုံး ၁၀၀၀ ကျပ်ပါ။");
    await supabaseClient.from('transactions').insert([{profile_id: profileId, type: currentWallet, amount: amt, details: document.getElementById('w-phone').value, status: 'pending'}]);
    if(currentWallet === 'withdraw') { coins -= amt; syncDB(); }
    alert("တင်ပြပြီးပါပြီ။"); closeWallet();
}

function handleLogout() { localStorage.clear(); location.reload(); }
init();
