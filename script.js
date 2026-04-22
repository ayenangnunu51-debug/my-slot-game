const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let isLoginMode = false;
let walletType = '';
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];

// --- ၁။ အကောင့်စနစ် (Register/Login/Logout) ---
function switchMode() {
    isLoginMode = !isLoginMode;
    const t = document.getElementById('title');
    const b = document.getElementById('btn-action');
    if(t) t.innerText = isLoginMode ? "Login ဝင်ရန်" : "Golden Slot";
    if(b) b.innerText = isLoginMode ? "Login ဝင်မည်" : "အကောင့်အသစ်ဖွင့်မည်";
}

async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if (!user || !pass) return alert("နာမည်နှင့် Password ဖြည့်ပါ");

    if (!isLoginMode) {
        if (pass.length < 6) return alert("❌ Password အနည်းဆုံး ၆ လုံးရှိရပါမည်");
        const { data: exist } = await supabaseClient.from('profiles').select('username').eq('username', user).maybeSingle();
        if (exist) return alert("❌ ဒီနာမည် ရှိပြီးသားပါ");
        const { data } = await supabaseClient.from('profiles').insert([{ username: user, password: pass, coins: 5000 }]).select().single();
        if (data) { localStorage.setItem('game_user_id', data.id); window.location.href = "index.html"; }
    } else {
        const { data } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if (data) { localStorage.setItem('game_user_id', data.id); window.location.href = "index.html"; }
        else alert("❌ နာမည် သို့မဟုတ် Password မှားနေပါသည်");
    }
}

function handleLogout() {
    if (confirm("Logout ထွက်မှာ သေချာပါသလား?")) {
        localStorage.removeItem('game_user_id');
        window.location.href = "signup.html";
    }
}

// --- ၂။ ငွေသွင်း/ငွေထုတ် စနစ် ---
function showWallet(type) {
    walletType = type;
    const modal = document.getElementById('wallet-modal');
    if(!modal) return;
    modal.style.display = 'block';
    document.getElementById('wallet-title').innerText = type === 'deposit' ? "ငွေသွင်းမည်" : "ငွေထုတ်မည်";
    document.getElementById('deposit-info').style.display = type === 'deposit' ? 'block' : 'none';
    document.getElementById('transaction-id').placeholder = type === 'deposit' ? "လုပ်ငန်းစဉ်အမှတ် (နောက်ဆုံး ၆ လုံး)" : "ငွေထုတ်မည့် ဖုန်းနံပါတ်";
}

function closeWallet() { document.getElementById('wallet-modal').style.display = 'none'; }

async function submitWalletRequest() {
    const amount = parseInt(document.getElementById('wallet-amount').value);
    const detail = document.getElementById('transaction-id').value.trim();

    if (!amount || amount < 5000 || amount > 1000000) return alert("❌ ပမာဏ ၅၀၀၀ မှ ၁၀ သိန်းကြား ဖြစ်ရပါမည်");
    if (walletType === 'deposit' && detail.length < 6) return alert("❌ လုပ်ငန်းစဉ်အမှတ် ၆ လုံး မှန်အောင်ထည့်ပါ");
    if (walletType === 'withdraw' && !detail) return alert("❌ ဖုန်းနံပါတ် ထည့်ပါ");

    alert("✅ တောင်းဆိုမှု ပေးပို့ပြီးပါပြီ။ Admin မှ အတည်ပြုပေးပါမည်။");
    closeWallet();
}

// --- ၃။ ဂိမ်းလုပ်ဆောင်ချက်များ ---
async function fetchCoins() {
    if (!profileId) return;
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).single();
    if (data) {
        coins = data.coins;
        if(document.getElementById('balance')) document.getElementById('balance').innerText = coins.toLocaleString();
        if(document.getElementById('user-name')) document.getElementById('user-name').innerText = data.username;
    }
}

async function updateDB() {
    if(document.getElementById('balance')) document.getElementById('balance').innerText = coins.toLocaleString();
    await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
}

async function playGame() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB();
    const reels = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3')];
    let count = 0;
    const timer = setInterval(() => {
        reels.forEach(r => r.innerText = symbols[Math.floor(Math.random() * symbols.length)]);
        if (++count > 15) {
            clearInterval(timer);
            if (reels[0].innerText === reels[1].innerText && reels[1].innerText === reels[2].innerText) {
                coins += 2000; alert("ပေါက်ပြီ! +2000K");
            }
            updateDB();
        }
    }, 100);
}

async function playDice() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB();
    const d = document.getElementById('dice');
    let count = 0;
    const timer = setInterval(() => {
        d.innerText = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][Math.floor(Math.random() * 6)];
        if (++count > 10) {
            clearInterval(timer);
            const res = Math.floor(Math.random() * 6) + 1;
            d.innerText = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][res];
            if (res >= 4) { coins += 300; alert("နိုင်ပြီ! +300K"); }
            updateDB();
        }
    }, 100);
}

async function playWheel() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB();
    const w = document.getElementById('wheel');
    w.style.transform = "rotate(720deg)";
    setTimeout(() => {
        w.style.transform = "rotate(0deg)";
        if (Math.random() > 0.7) { coins += 500; alert("ဘီးပေါက်ပြီ! +500K"); }
        updateDB();
    }, 1000);
}

function switchGame(g) {
    ['slot','dice','wheel'].forEach(x => {
        const el = document.getElementById(x + '-game');
        if(el) el.style.display = 'none';
    });
    const target = document.getElementById(g + '-game');
    if(target) target.style.display = 'block';
}

fetchCoins();
