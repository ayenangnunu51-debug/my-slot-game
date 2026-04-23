const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let isLoginMode = false;
let walletType = '';

const slotIcons = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];
const diceIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// --- Auth Section ---
function switchMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "LOGIN" : "CREATE ACCOUNT";
    document.getElementById('auth-btn').innerText = isLoginMode ? "Login ဝင်မည်" : "အကောင့်ဖွင့်မည်";
}

async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if (!user || !pass) return alert("ဖြည့်စွက်ပါ");

    if (!isLoginMode) {
        // Username တူမတူစစ်ခြင်း
        const { data: check } = await supabaseClient.from('profiles').select('username').eq('username', user).maybeSingle();
        if (check) return alert("❌ ဤနာမည် သုံးပြီးသားဖြစ်နေပါသည်။");

        const { data, error } = await supabaseClient.from('profiles').insert([{ username: user, password: pass, coins: 5000 }]).select().single();
        if (error) return alert("Error: " + error.message);
        localStorage.setItem('game_user_id', data.id);
        window.location.href = "index.html";
    } else {
        const { data } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if (data) {
            localStorage.setItem('game_user_id', data.id);
            window.location.href = "index.html";
        } else alert("❌ မှားယွင်းနေပါသည်။");
    }
}

// --- Game Initialization ---
async function fetchUser() {
    if (!profileId) {
        if (!window.location.pathname.includes("signup.html")) window.location.href = "signup.html";
        return;
    }
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (data) {
        coins = data.coins;
        document.getElementById('user-name').innerText = data.username;
        updateUI();
        // Daily Bonus Logic
        const today = new Date().toDateString();
        if (data.last_login !== today) {
            coins += 1000; alert("🎁 နေ့စဉ်လက်ဆောင် 1,000K ရရှိပါသည်!");
            await supabaseClient.from('profiles').update({ coins: coins, last_login: today }).eq('id', profileId);
            updateUI();
        }
    }
}

function updateUI() {
    const bal = document.getElementById('balance');
    if(bal) bal.innerText = coins.toLocaleString();
}

async function saveCoins() {
    updateUI();
    await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
}

function switchGame(game) {
    document.querySelectorAll('.game-panel').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`${game}-area`).style.display = 'block';
    document.getElementById(`nav-${game}`).classList.add('active');
}

// --- Games ---
async function playSlot() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if (coins < bet) return alert("လက်ကျန်မလုံလောက်ပါ");
    coins -= bet; updateUI();
    document.getElementById('snd-spin').play();

    let c = 0;
    const t = setInterval(() => {
        document.getElementById('r1').innerText = slotIcons[Math.floor(Math.random()*6)];
        document.getElementById('r2').innerText = slotIcons[Math.floor(Math.random()*6)];
        document.getElementById('r3').innerText = slotIcons[Math.floor(Math.random()*6)];
        if (++c > 12) {
            clearInterval(t);
            const r = [document.getElementById('r1').innerText, document.getElementById('r2').innerText, document.getElementById('r3').innerText];
            if (r[0] === r[1] && r[1] === r[2]) {
                coins += bet * 10; document.getElementById('snd-win').play(); alert("JACKPOT! x10");
            } else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) {
                coins += bet * 2; alert("WIN! x2");
            }
            saveCoins();
        }
    }, 100);
}

async function playDice(choice) {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if (coins < bet) return alert("လက်ကျန်မလုံလောက်ပါ");
    coins -= bet; updateUI();
    document.getElementById('snd-dice').play();
    let c = 0;
    const t = setInterval(() => {
        document.getElementById('dice-box').innerText = diceIcons[Math.floor(Math.random()*6)];
        if (++c > 10) {
            clearInterval(t);
            const res = Math.floor(Math.random()*6)+1;
            document.getElementById('dice-box').innerText = diceIcons[res-1];
            if ((choice === 'high' && res >= 4) || (choice === 'low' && res <= 3)) {
                coins += bet * 1.9; document.getElementById('snd-win').play(); alert("DICE WIN!");
            } else alert("LOSE!");
            saveCoins();
        }
    }, 100);
}

async function playWheel() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if (coins < bet) return alert("လက်ကျန်မလုံလောက်ပါ");
    coins -= bet; updateUI();
    const wheel = document.getElementById('wheel-inner');
    const deg = Math.floor(Math.random()*360) + 1800;
    wheel.style.transition = "transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)";
    wheel.style.transform = `rotate(${deg}deg)`;
    setTimeout(() => {
        const mult = [0, 2, 0, 5, 0, 1.5][Math.floor(Math.random()*6)];
        if (mult > 0) { coins += bet * mult; document.getElementById('snd-win').play(); alert(`WHEEL WIN x${mult}`); }
        else alert("LOSE!");
        wheel.style.transition = "none"; wheel.style.transform = "rotate(0deg)";
        saveCoins();
    }, 3200);
}

// --- Wallet ---
function showWallet(type) {
    walletType = type;
    document.getElementById('wallet-modal').style.display = 'flex';
    document.getElementById('modal-rem-bal').innerText = coins.toLocaleString();
}
function updateRemCalc() {
    const amt = parseInt(document.getElementById('wallet-amount').value) || 0;
    document.getElementById('modal-rem-bal').innerText = (walletType === 'withdraw' ? coins - amt : coins + amt).toLocaleString();
}
async function submitWallet() {
    const amt = parseInt(document.getElementById('wallet-amount').value);
    const phone = document.getElementById('wallet-phone').value;
    if (!amt || !phone) return alert("အချက်အလက်ဖြည့်ပါ");
    const { error } = await supabaseClient.from('transactions').insert([{ profile_id: profileId, type: walletType, amount: amt, details: phone, status: 'pending' }]);
    if (!error) {
        if (walletType === 'withdraw') { coins -= amt; saveCoins(); }
        alert("Success! Pending admin approval.");
        closeWallet();
    }
}
function closeWallet() { document.getElementById('wallet-modal').style.display = 'none'; }
function handleLogout() { localStorage.clear(); window.location.href = "signup.html"; }
fetchUser();
