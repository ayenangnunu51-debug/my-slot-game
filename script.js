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
        if (!window.location.href.includes("signup.html")) window.location.href = "signup.html";
        return;
    }
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (data) {
        coins = data.coins;
        updateUI();
    } else {
        localStorage.clear();
        window.location.href = "signup.html";
    }
}

function updateUI() {
    document.getElementById('balance').innerText = coins.toLocaleString();
    document.getElementById('user-name').innerText = localStorage.getItem('game_username') || "Player";
}

// --- ၂။ ငွေသွင်း/ငွေထုတ် စနစ် ---
function showWallet(type) {
    walletType = type;
    document.getElementById('wallet-modal').style.display = 'block';
    document.getElementById('wallet-title').innerText = type === 'deposit' ? "ငွေသွင်းမည်" : "ငွေထုတ်မည်";
    document.getElementById('deposit-info').style.display = type === 'deposit' ? 'block' : 'none';
    document.getElementById('current-bal-display').innerText = coins.toLocaleString();
    document.getElementById('rem-bal').innerText = coins.toLocaleString();
}

function calculateBalance() {
    const amt = parseInt(document.getElementById('wallet-amount').value) || 0;
    let rem = walletType === 'withdraw' ? coins - amt : coins + amt;
    const display = document.getElementById('rem-bal');
    display.innerText = rem.toLocaleString();
    display.style.color = rem < 0 ? "red" : "#00ff00";
}

async function submitWalletRequest() {
    const amt = parseInt(document.getElementById('wallet-amount').value);
    const det = document.getElementById('transaction-id').value.trim();

    if (!amt || amt < 5000) return alert("❌ အနည်းဆုံး ၅၀၀၀ ကျပ် ဖြစ်ရပါမည်");
    if (!det) return alert("❌ အချက်အလက် ဖြည့်စွက်ပါ");
    if (walletType === 'withdraw' && amt > coins) return alert("❌ လက်ကျန်ငွေ မလုံလောက်ပါ");

    const { error } = await supabaseClient.from('transactions').insert([
        { profile_id: profileId, type: walletType, amount: amt, details: det, status: 'pending' }
    ]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        if (walletType === 'withdraw') {
            coins -= amt;
            await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
        }
        alert("✅ တင်ပြမှု အောင်မြင်ပါသည်။");
        location.reload();
    }
}

// --- ၃။ Slot Game Logic ---
async function playGame() {
    if (coins < 100) return alert("❌ ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100;
    updateUI();
    
    const r = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3')];
    let count = 0;
    const timer = setInterval(() => {
        r.forEach(el => el.innerText = symbols[Math.floor(Math.random() * symbols.length)]);
        if (++count > 15) {
            clearInterval(timer);
            checkWin(r[0].innerText, r[1].innerText, r[2].innerText);
        }
    }, 100);
}

async function checkWin(a, b, c) {
    if (a === b && b === c) {
        coins += 2000;
        alert("🎉 ထီပေါက်ပြီ! +2,000K");
    } else if (a === b || b === c || a === c) {
        coins += 200;
        alert("🎊 နှစ်လုံးတူ! +200K");
    }
    await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
    updateUI();
}

function handleLogout() { localStorage.clear(); window.location.href = "signup.html"; }
function closeWallet() { document.getElementById('wallet-modal').style.display = 'none'; }
fetchCoins();
