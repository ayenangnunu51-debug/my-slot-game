const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let isLoginMode = false;
let walletType = '';
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];

// --- Auth System ---
function switchMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('title').innerText = isLoginMode ? "Login ဝင်ရန်" : "Golden Slot";
    document.getElementById('btn-action').innerText = isLoginMode ? "Login ဝင်မည်" : "အကောင့်အသစ်ဖွင့်မည်";
}

async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if (!user || !pass) return alert("ဖြည့်စွက်ရန် လိုအပ်ပါသည်");

    if (!isLoginMode) {
        if (pass.length < 6) return alert("Password ၆ လုံး အနည်းဆုံး ရှိရပါမယ်");
        const { data: exist } = await supabaseClient.from('profiles').select('id').eq('username', user).maybeSingle();
        if (exist) return alert("ဒီနာမည် ရှိပြီးသားပါ");
        const { data, error } = await supabaseClient.from('profiles').insert([{ username: user, password: pass, coins: 5000 }]).select().single();
        if (data) { localStorage.setItem('game_user_id', data.id); window.location.href = "index.html"; }
    } else {
        const { data } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if (data) { localStorage.setItem('game_user_id', data.id); window.location.href = "index.html"; }
        else alert("နာမည် သို့မဟုတ် Password မှားနေပါသည်");
    }
}

function handleLogout() {
    localStorage.removeItem('game_user_id');
    window.location.href = "signup.html";
}

// --- Data & Wallet ---
async function fetchCoins() {
    if (!profileId) {
        if (window.location.pathname.includes("index.html") || window.location.pathname.endsWith("/")) {
            window.location.href = "signup.html";
        }
        return;
    }
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (data) {
        coins = data.coins;
        document.getElementById('balance').innerText = coins.toLocaleString();
        document.getElementById('user-name').innerText = data.username;
    }
}

async function updateDB() {
    document.getElementById('balance').innerText = coins.toLocaleString();
    await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
}

function showWallet(type) {
    walletType = type;
    document.getElementById('wallet-modal').style.display = 'block';
    document.getElementById('wallet-title').innerText = type === 'deposit' ? "ငွေသွင်းမည်" : "ငွေထုတ်မည်";
    document.getElementById('deposit-info').style.display = type === 'deposit' ? 'block' : 'none';
}

function closeWallet() { document.getElementById('wallet-modal').style.display = 'none'; }

async function submitWalletRequest() {
    const amt = parseInt(document.getElementById('wallet-amount').value);
    const det = document.getElementById('transaction-id').value.trim();
    if (!amt || amt < 5000) return alert("အနည်းဆုံး ၅၀၀၀ ကျပ်ပါ");
    
    const { error } = await supabaseClient.from('transactions').insert([
        { profile_id: profileId, type: walletType, amount: amt, details: det, status: 'pending' }
    ]);
    if (!error) { alert("တင်ပြပြီးပါပြီ"); closeWallet(); }
}

// --- Games ---
async function playGame() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB();
    const reels = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3')];
    let count = 0;
    const timer = setInterval(() => {
        reels.forEach(r => r.innerText = symbols[Math.floor(Math.random() * symbols.length)]);
        if (++count > 12) {
            clearInterval(timer);
            if (reels[0].innerText === reels[1].innerText && reels[1].innerText === reels[2].innerText) {
                coins += 2000; alert("ပေါက်ပြီ +2000");
            }
            updateDB();
        }
    }, 100);
}

async function playDice() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB();
    const d = document.getElementById('dice');
    setTimeout(() => {
        const res = Math.floor(Math.random() * 6) + 1;
        d.innerText = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][res];
        if (res >= 4) { coins += 300; alert("နိုင်ပြီ +300"); }
        updateDB();
    }, 500);
}

async function playWheel() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB();
    const w = document.getElementById('wheel');
    w.style.transform = `rotate(${Math.floor(Math.random() * 360) + 720}deg)`;
    setTimeout(() => {
        w.style.transform = "rotate(0deg)";
        if (Math.random() > 0.7) { coins += 500; alert("နိုင်ပြီ +500"); }
        updateDB();
    }, 2000);
}

function switchGame(g) {
    ['slot','dice','wheel'].forEach(x => document.getElementById(x+'-game').style.display='none');
    document.getElementById(g+'-game').style.display='block';
}

fetchCoins();
