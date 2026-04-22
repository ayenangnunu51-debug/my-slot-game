const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let walletType = '';
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];

// --- ၁။ Data Fetching ---
async function fetchCoins() {
    if (!profileId) {
        if (!window.location.href.includes("signup.html")) window.location.href = "signup.html";
        return;
    }
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (data) {
        coins = data.coins;
        document.getElementById('balance').innerText = coins.toLocaleString();
        document.getElementById('user-name').innerText = data.username;
    } else {
        localStorage.removeItem('game_user_id');
        window.location.href = "signup.html";
    }
}

async function updateDB() {
    document.getElementById('balance').innerText = coins.toLocaleString();
    await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
}

// --- ၂။ Wallet System (Withdraw Logic ပါဝင်သည်) ---
function showWallet(type) {
    walletType = type;
    document.getElementById('wallet-modal').style.display = 'block';
    document.getElementById('wallet-title').innerText = type === 'deposit' ? "ငွေသွင်းမည်" : "ငွေထုတ်မည်";
    document.getElementById('deposit-info').style.display = type === 'deposit' ? 'block' : 'none';
    document.getElementById('transaction-id').placeholder = type === 'deposit' ? "လုပ်ငန်းစဉ်အမှတ် ၆ လုံး" : "ငွေလက်ခံမည့် ဖုန်းနံပါတ်";
    
    // Clear inputs
    document.getElementById('wallet-amount').value = '';
    document.getElementById('transaction-id').value = '';
    document.getElementById('rem-bal').innerText = coins.toLocaleString();
}

// လက်ကျန်ငွေကို အလိုအလျောက်တွက်ပေးရန်
function calculateBalance() {
    const amt = parseInt(document.getElementById('wallet-amount').value) || 0;
    let remaining = coins;
    if (walletType === 'withdraw') {
        remaining = coins - amt;
    } else if (walletType === 'deposit') {
        remaining = coins + amt;
    }
    document.getElementById('rem-bal').innerText = remaining.toLocaleString();
    
    if (remaining < 0) {
        document.getElementById('rem-bal').style.color = "red";
    } else {
        document.getElementById('rem-bal').style.color = "#00ff00";
    }
}

function closeWallet() { document.getElementById('wallet-modal').style.display = 'none'; }

async function submitWalletRequest() {
    const amt = parseInt(document.getElementById('wallet-amount').value);
    const det = document.getElementById('transaction-id').value.trim();

    if (!amt || amt < 5000) return alert("❌ အနည်းဆုံး ၅၀၀၀ ကျပ် ဖြစ်ရပါမည်");
    if (!det) return alert("❌ အချက်အလက် ပြည့်စုံစွာ ဖြည့်စွက်ပါ");
    
    // ငွေထုတ်လျှင် လက်ကျန်ရှိမရှိစစ်
    if (walletType === 'withdraw' && amt > coins) {
        return alert("❌ လက်ကျန်ငွေ မလုံလောက်ပါ");
    }

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
        alert("Error: " + error.message);
    } else {
        // ငွေထုတ်လျှင် ဂိမ်းထဲက coins ကို ချက်ချင်းနှုတ်ရန် (Admin အတည်ပြုစရာမလိုဘဲ နှုတ်ချင်လျှင်)
        if (walletType === 'withdraw') {
            coins -= amt;
            updateDB();
        }
        alert("✅ တောင်းဆိုမှု အောင်မြင်ပါသည်။ Admin မှ စစ်ဆေးပေးပါမည်။");
        closeWallet();
    }
}

function handleLogout() {
    localStorage.removeItem('game_user_id');
    window.location.href = "signup.html";
}

async function playGame() {
    if (coins < 100) return alert("❌ ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB();
    const reels = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3')];
    let count = 0;
    const timer = setInterval(() => {
        reels.forEach(r => r.innerText = symbols[Math.floor(Math.random() * symbols.length)]);
        if (++count > 12) {
            clearInterval(timer);
            if (reels[0].innerText === reels[1].innerText && reels[1].innerText === reels[2].innerText) {
                coins += 2000; alert("🎉 ပေါက်ပြီ! +2,000K");
            }
            updateDB();
        }
    }, 100);
}

fetchCoins();
