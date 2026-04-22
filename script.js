const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let walletType = '';
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];

// --- ၁။ အချက်အလက်များ ရယူခြင်း ---
async function fetchCoins() {
    if (!profileId) {
        window.location.href = "signup.html";
        return;
    }
    const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (data) {
        coins = data.coins;
        updateUI();
    } else {
        localStorage.removeItem('game_user_id');
        window.location.href = "signup.html";
    }
}

function updateUI() {
    document.getElementById('balance').innerText = coins.toLocaleString();
    document.getElementById('user-name').innerText = localStorage.getItem('game_username') || "User";
}

async function updateDB() {
    updateUI();
    await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
}

// --- ၂။ Wallet စနစ် (Withdraw/Deposit) ---
function showWallet(type) {
    walletType = type;
    document.getElementById('wallet-modal').style.display = 'block';
    document.getElementById('wallet-title').innerText = type === 'deposit' ? "ငွေသွင်းမည်" : "ငွေထုတ်မည်";
    document.getElementById('deposit-info').style.display = type === 'deposit' ? 'block' : 'none';
    document.getElementById('current-bal-display').innerText = coins.toLocaleString();
    
    // Reset Inputs
    document.getElementById('wallet-amount').value = '';
    document.getElementById('transaction-id').value = '';
    document.getElementById('rem-bal').innerText = coins.toLocaleString();
}

function calculateBalance() {
    const amt = parseInt(document.getElementById('wallet-amount').value) || 0;
    let rem = walletType === 'withdraw' ? coins - amt : coins + amt;
    const display = document.getElementById('rem-bal');
    display.innerText = rem.toLocaleString();
    display.style.color = rem < 0 ? "red" : "#00ff00";
}

function closeWallet() { document.getElementById('wallet-modal').style.display = 'none'; }

async function submitWalletRequest() {
    const amt = parseInt(document.getElementById('wallet-amount').value);
    const det = document.getElementById('transaction-id').value.trim();

    if (!amt || amt < 5000) return alert("❌ အနည်းဆုံး ၅၀၀၀ ကျပ် ဖြစ်ရပါမည်");
    if (!det) return alert("❌ အချက်အလက် ပြည့်စုံစွာ ဖြည့်ပါ");
    if (walletType === 'withdraw' && amt > coins) return alert("❌ လက်ကျန်ငွေ မလုံလောက်ပါ");

    // Supabase Insert
    const { error } = await supabaseClient.from('transactions').insert([
        { profile_id: profileId, type: walletType, amount: amt, details: det, status: 'pending' }
    ]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        if (walletType === 'withdraw') {
            coins -= amt;
            updateDB();
        }
        alert("✅ တောင်းဆိုမှု အောင်မြင်ပါသည်။ Admin အတည်ပြုချက်ကို စောင့်ဆိုင်းပါ။");
        closeWallet();
    }
}

// --- ၃။ Game Logic ---
async function playGame() {
    if (coins < 100) return alert("❌ ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100;
    updateDB();
    
    const r1 = document.getElementById('r1'), r2 = document.getElementById('r2'), r3 = document.getElementById('r3');
    let count = 0;
    const timer = setInterval(() => {
        r1.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        r2.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        r3.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        if (++count > 15) {
            clearInterval(timer);
            checkWin(r1.innerText, r2.innerText, r3.innerText);
        }
    }, 100);
}

function checkWin(a, b, c) {
    if (a === b && b === c) {
        coins += 2000;
        alert("🎉 ထီပေါက်ပြီ! +2,000K ရရှိပါသည်။");
    } else if (a === b || b === c || a === c) {
        coins += 200;
        alert("🎊 နှစ်လုံးတူပေါက်ပြီ! +200K ရရှိပါသည်။");
    }
    updateDB();
}

function handleLogout() {
    localStorage.clear();
    window.location.href = "signup.html";
}

fetchCoins();
