const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let walletType = '';
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];

// --- Auth & Profile ---
async function fetchCoins() {
    if (!profileId) { window.location.href = "signup.html"; return; }
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).single();
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

function handleLogout() {
    if (confirm("Logout ထွက်မှာ သေချာပါသလား?")) {
        localStorage.removeItem('game_user_id');
        window.location.href = "signup.html";
    }
}

// --- Wallet System (Deposit/Withdraw) ---
function showWallet(type) {
    walletType = type;
    document.getElementById('wallet-modal').style.display = 'block';
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
    
    // Supabase 'transactions' table ထဲသို့ ပို့ခြင်း
    const { error } = await supabaseClient.from('transactions').insert([
        { profile_id: profileId, type: walletType, amount: amount, details: detail, status: 'pending' }
    ]);

    if (!error) {
        alert("✅ တောင်းဆိုမှု ပေးပို့ပြီးပါပြီ။ Admin မှ အတည်ပြုပေးပါမည်။");
        closeWallet();
    } else {
        alert("❌ မှားယွင်းနေပါသည်။ Table ဆောက်ထားခြင်း ရှိမရှိ စစ်ဆေးပါ။");
    }
}

// --- Games Logic ---
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
    w.style.transform = "rotate(1080deg)";
    setTimeout(() => {
        w.style.transform = "rotate(0deg)";
        if (Math.random() > 0.7) { coins += 500; alert("ဘီးပေါက်ပြီ! +500K"); }
        updateDB();
    }, 2000);
}

function switchGame(g) {
    ['slot','dice','wheel'].forEach(x => document.getElementById(x + '-game').style.display = 'none');
    document.getElementById(g + '-game').style.display = 'block';
}

fetchCoins();
