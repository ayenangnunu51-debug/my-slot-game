const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let walletType = ''; 
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];

// --- Logout စနစ် ---
function handleLogout() {
    if (confirm("အကောင့်မှ ထွက်မှာ သေချာပါသလား?")) {
        localStorage.removeItem('game_user_id');
        window.location.href = "signup.html";
    }
}

// --- Wallet စနစ် ---
function showWallet(type) {
    walletType = type;
    document.getElementById('wallet-modal').style.display = 'block';
    document.getElementById('wallet-title').innerText = type === 'deposit' ? "ငွေသွင်းရန် တောင်းဆိုမည်" : "ငွေထုတ်ရန် တောင်းဆိုမည်";
}

function closeWallet() {
    document.getElementById('wallet-modal').style.display = 'none';
}

async function submitWalletRequest() {
    const amount = document.getElementById('wallet-amount').value;
    if (!amount || amount < 1000) return alert("အနည်းဆုံး ၁၀၀၀ ကျပ် ဖြစ်ရပါမည်");

    alert("တောင်းဆိုမှု တင်ပြပြီးပါပြီ။ Admin က စစ်ဆေးပြီးမှ အတည်ပြုပေးပါလိမ့်မည်။");
    // ဤနေရာတွင် Database ထဲသို့ Transaction စာရင်း ပို့နိုင်ပါသည် (Nang Nu အတွက် နောက်မှ တိုးချဲ့ပေးမည်)
    closeWallet();
}

// --- ကျန်ရှိသော ဂိမ်း Function များ ---
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

// --- ဂိမ်းများ (Slot, Dice, Wheel) ---
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
    d.innerText = "🎲"; d.style.opacity = 0.5;
    setTimeout(() => {
        d.style.opacity = 1;
        const res = Math.floor(Math.random() * 6) + 1;
        d.innerText = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][res];
        if (res >= 4) { coins += 300; alert("နိုင်ပြီ! +300K"); }
        updateDB();
    }, 800);
}

async function playWheel() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB();
    const w = document.getElementById('wheel'); w.style.transition = "1s"; w.style.transform = "rotate(360deg)";
    setTimeout(() => {
        w.style.transform = "rotate(0deg)";
        if (Math.random() > 0.7) { coins += 500; alert("ဘီးပေါက်ပြီ! +500K"); }
        updateDB();
    }, 1000);
}

function switchGame(g) {
    ['slot','dice','wheel'].forEach(x => document.getElementById(x+'-game').style.display = 'none');
    document.getElementById(g+'-game').style.display = 'block';
}

fetchCoins();
