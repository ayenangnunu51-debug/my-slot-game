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
    document.getElementById('toggle-text').innerHTML = isLoginMode ? 'အကောင့်မရှိသေးဘူးလား? <span style="color: gold;">ဒီမှာ အသစ်ဖွင့်ပါ</span>' : 'အကောင့်ရှိပြီးသားလား? <span style="color: gold;">ဒီမှာ Login ဝင်ပါ</span>';
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

// --- Data Fetching ---
async function fetchCoins() {
    if (!profileId) {
        if (window.location.pathname.includes("index.html") || window.location.pathname.endsWith("/")) {
            window.location.href = "signup.html";
        }
        return;
    }
    const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
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

// --- Wallet System (ဒါက Nang Nu မရဖြစ်နေတဲ့အပိုင်း) ---
function showWallet(type) {
    walletType = type;
    document.getElementById('wallet-modal').style.display = 'block';
    document.getElementById('wallet-title').innerText = type === 'deposit' ? "ငွေသွင်းမည်" : "ငွေထုတ်မည်";
    document.getElementById('deposit-info').style.display = type === 'deposit' ? 'block' : 'none';
}

function closeWallet() { document.getElementById('wallet-modal').style.display = 'none'; }

async function submitWalletRequest() {
    const amtInput = document.getElementById('wallet-amount').value;
    const det = document.getElementById('transaction-id').value.trim();
    const amt = parseInt(amtInput);

    if (!amt || amt < 5000) return alert("အနည်းဆုံး ၅၀၀၀ ကျပ် ရိုက်ထည့်ပါ");
    if (!det) return alert("အချက်အလက် (Transaction ID သို့မဟုတ် ဖုန်းနံပါတ်) ထည့်ပါ");

    // Supabase ကို ပို့ခြင်း
    const { error } = await supabaseClient.from('transactions').insert([
        { 
            profile_id: profileId, 
            type: walletType, 
            amount: amt, 
            details: det, 
            status: 'pending' 
        }
    ]);

    if (error) {
        alert("Error: " + error.message + "\n(Supabase Table Settings ကို ပြန်စစ်ပါ)");
    } else {
        alert("✅ တင်ပြမှု အောင်မြင်ပါသည်။ Admin မှ အတည်ပြုပေးပါမည်။");
        closeWallet();
    }
}

// --- Game Logic ---
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

function switchGame(g) {
    ['slot','dice','wheel'].forEach(x => {
        const el = document.getElementById(x+'-game');
        if(el) el.style.display='none';
    });
    document.getElementById(g+'-game').style.display='block';
}

// Start
fetchCoins();
