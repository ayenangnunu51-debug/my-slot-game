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
    document.getElementById('toggle-auth').innerHTML = isLoginMode ? 'အကောင့်မရှိသေးဘူးလား? <span style="color: gold;">ဒီမှာဖွင့်ပါ</span>' : 'အကောင့်ရှိပြီးသားလား? <span style="color: gold;">Login ဝင်ပါ</span>';
}

async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if (!user || !pass) return alert("Username နှင့် Password ဖြည့်ပါ");

    if (!isLoginMode) {
        // အကောင့်အသစ်ဖွင့်ခြင်း (Username တူမတူစစ်ခြင်း)
        const { data: existing } = await supabaseClient.from('profiles').select('username').eq('username', user).maybeSingle();
        if (existing) return alert("❌ ဤနာမည် သုံးပြီးသားဖြစ်နေပါသည်။ တခြားနာမည်ပြောင်းပေးပါ။");

        const { data, error } = await supabaseClient.from('profiles').insert([{ username: user, password: pass, coins: 5000 }]).select().single();
        if (error) return alert("Error: " + error.message);
        localStorage.setItem('game_user_id', data.id);
        localStorage.setItem('game_username', data.username);
        window.location.href = "index.html";
    } else {
        // Login ဝင်ခြင်း
        const { data, error } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if (data) {
            localStorage.setItem('game_user_id', data.id);
            localStorage.setItem('game_username', data.username);
            window.location.href = "index.html";
        } else {
            alert("❌ Username (သို့မဟုတ်) Password မှားနေပါသည်။");
        }
    }
}

// --- Core Game Section ---
async function fetchUser() {
    if (!profileId) {
        if (!window.location.href.includes("signup.html")) window.location.href = "signup.html";
        return;
    }
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (data) {
        coins = data.coins;
        document.getElementById('user-name').innerText = data.username;
        updateUI();
    } else {
        handleLogout();
    }
}

function updateUI() {
    document.getElementById('balance').innerText = coins.toLocaleString();
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

// --- Slot Logic ---
async function playSlot() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if (coins < bet) return alert("လက်ကျန်ငွေမလုံလောက်ပါ");
    coins -= bet; updateUI();
    document.getElementById('snd-spin').play();

    let count = 0;
    const timer = setInterval(() => {
        document.getElementById('r1').innerText = slotIcons[Math.floor(Math.random() * 6)];
        document.getElementById('r2').innerText = slotIcons[Math.floor(Math.random() * 6)];
        document.getElementById('r3').innerText = slotIcons[Math.floor(Math.random() * 6)];
        if (++count > 15) {
            clearInterval(timer);
            const r = [document.getElementById('r1').innerText, document.getElementById('r2').innerText, document.getElementById('r3').innerText];
            if (r[0] === r[1] && r[1] === r[2]) {
                const win = bet * 10; coins += win; document.getElementById('snd-win').play(); alert(`JACKPOT! x10 = ${win}K`);
            } else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) {
                const win = bet * 2; coins += win; alert(`နှစ်လုံးတူ! x2 = ${win}K`);
            }
            saveCoins();
        }
    }, 100);
}

// --- Dice Logic ---
async function playDice(choice) {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if (coins < bet) return alert("လက်ကျန်ငွေမလုံလောက်ပါ");
    coins -= bet; updateUI();
    document.getElementById('snd-dice').play();

    let count = 0;
    const timer = setInterval(() => {
        document.getElementById('dice-box').innerText = diceIcons[Math.floor(Math.random() * 6)];
        if (++count > 10) {
            clearInterval(timer);
            const res = Math.floor(Math.random() * 6) + 1;
            document.getElementById('dice-box').innerText = diceIcons[res-1];
            const isHigh = res >= 4;
            if ((choice === 'high' && isHigh) || (choice === 'low' && !isHigh)) {
                const win = bet * 1.9; coins += win; document.getElementById('snd-win').play(); alert(`🎯 နိုင်ပါသည်! ${win}K ရရှိပါသည်`);
            } else alert("❌ ရှုံးပါသည်");
            saveCoins();
        }
    }, 100);
}

// --- Wheel Logic ---
async function playWheel() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if (coins < bet) return alert("လက်ကျန်ငွေမလုံလောက်ပါ");
    coins -= bet; updateUI();

    const wheel = document.getElementById('wheel-inner');
    const deg = Math.floor(Math.random() * 360) + 1800;
    wheel.style.transition = "transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)";
    wheel.style.transform = `rotate(${deg}deg)`;

    setTimeout(() => {
        const multipliers = [0, 2, 0, 5, 0, 1.5];
        const mult = multipliers[Math.floor(Math.random() * 6)];
        if (mult > 0) {
            const win = bet * mult; coins += win; document.getElementById('snd-win').play(); alert(`🎡 ကံထူးပါသည်! x${mult} = ${win}K`);
        } else alert("🎡 နောက်တစ်ခါ ပြန်ကြိုးစားပါ");
        wheel.style.transform = "rotate(0deg)";
        wheel.style.transition = "none";
        saveCoins();
    }, 3500);
}

// --- Wallet Section ---
function showWallet(type) {
    walletType = type;
    document.getElementById('wallet-modal').style.display = 'flex';
    document.getElementById('wallet-title').innerText = type === 'deposit' ? "ငွေသွင်းမည်" : "ငွေထုတ်မည်";
    document.getElementById('modal-cur-bal').innerText = coins.toLocaleString();
    updateRemCalc();
}

function updateRemCalc() {
    const amt = parseInt(document.getElementById('wallet-amount').value) || 0;
    const rem = walletType === 'withdraw' ? coins - amt : coins + amt;
    document.getElementById('modal-rem-bal').innerText = rem.toLocaleString();
}

async function submitWallet() {
    const amt = parseInt(document.getElementById('wallet-amount').value);
    const phone = document.getElementById('wallet-phone').value;
    if (!amt || amt < 1000) return alert("အနည်းဆုံး ၁၀၀၀ ကျပ်ထည့်ပါ");
    if (walletType === 'withdraw' && amt > coins) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ");

    const { error } = await supabaseClient.from('transactions').insert([{ profile_id: profileId, type: walletType, amount: amt, details: phone, status: 'pending' }]);
    if (!error) {
        if (walletType === 'withdraw') { coins -= amt; saveCoins(); }
        alert("✅ တောင်းဆိုမှု အောင်မြင်ပါသည်။ Admin အတည်ပြုချက်ကို စောင့်ပါ။");
        closeWallet();
    } else alert("Error: " + error.message);
}

function closeWallet() { document.getElementById('wallet-modal').style.display = 'none'; }
function handleLogout() { localStorage.clear(); window.location.href = "signup.html"; }

fetchUser();
