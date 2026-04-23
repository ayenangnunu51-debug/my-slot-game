const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let walletType = '';
const slotIcons = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];
const diceIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// --- ၁။ Data ရယူခြင်း ---
async function init() {
    if (!profileId) {
        if (!window.location.href.includes("signup.html")) window.location.href = "signup.html";
        return;
    }
    const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (data) {
        coins = data.coins;
        document.getElementById('user-name').innerText = data.username;
        updateUI();
    } else {
        localStorage.clear();
        window.location.href = "signup.html";
    }
}

function updateUI() {
    document.getElementById('balance').innerText = coins.toLocaleString();
}

async function syncDB() {
    updateUI();
    await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
}

// --- ၂။ Game Switching ---
function switchGame(type) {
    document.getElementById('slot-area').style.display = type === 'slot' ? 'block' : 'none';
    document.getElementById('dice-area').style.display = type === 'dice' ? 'block' : 'none';
    document.getElementById('wheel-area').style.display = type === 'wheel' ? 'block' : 'none';
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`nav-${type}`).classList.add('active');
}

function getBet() { return parseInt(document.getElementById('bet-amount').value); }

// --- ၃။ SLOT GAME ---
async function playSlot() {
    const bet = getBet();
    if (coins < bet) return alert("လက်ကျန်မလုံလောက်ပါ");
    
    coins -= bet;
    updateUI();
    document.getElementById('snd-spin').play();

    let spins = 0;
    const timer = setInterval(() => {
        document.getElementById('r1').innerText = slotIcons[Math.floor(Math.random() * 6)];
        document.getElementById('r2').innerText = slotIcons[Math.floor(Math.random() * 6)];
        document.getElementById('r3').innerText = slotIcons[Math.floor(Math.random() * 6)];
        if (++spins > 15) {
            clearInterval(timer);
            checkSlotWin(bet);
        }
    }, 100);
}

function checkSlotWin(bet) {
    const r = [document.getElementById('r1').innerText, document.getElementById('r2').innerText, document.getElementById('r3').innerText];
    if (r[0] === r[1] && r[1] === r[2]) {
        const win = bet * 10; coins += win;
        document.getElementById('snd-win').play();
        alert(`🎉 JACKPOT! ${win}K ရရှိပါသည်`);
    } else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) {
        const win = bet * 2; coins += win;
        alert(`🎊 ၂ လုံးတူ! ${win}K ရရှိပါသည်`);
    }
    syncDB();
}

// --- ၄။ DICE GAME ---
async function playDice(choice) {
    const bet = getBet();
    if (coins < bet) return alert("လက်ကျန်မလုံလောက်ပါ");

    coins -= bet;
    updateUI();
    document.getElementById('snd-dice').play();

    let rolls = 0;
    const timer = setInterval(() => {
        document.getElementById('dice-box').innerText = diceIcons[Math.floor(Math.random() * 6)];
        if (++rolls > 10) {
            clearInterval(timer);
            const finalNum = Math.floor(Math.random() * 6) + 1;
            document.getElementById('dice-box').innerText = diceIcons[finalNum - 1];
            
            const isHigh = finalNum >= 4;
            if ((choice === 'high' && isHigh) || (choice === 'low' && !isHigh)) {
                const win = bet * 1.9; coins += win;
                document.getElementById('snd-win').play();
                alert(`🎯 နိုင်ပါသည်! ${win}K ရရှိပါသည်`);
            } else {
                alert("❌ ရှုံးပါသည်");
            }
            syncDB();
        }
    }, 100);
}

// --- ၅။ WHEEL GAME ---
async function playWheel() {
    const bet = getBet();
    if (coins < bet) return alert("လက်ကျန်မလုံလောက်ပါ");

    coins -= bet;
    updateUI();
    
    const wheel = document.getElementById('wheel-circle');
    const randomDeg = Math.floor(Math.random() * 360) + 1440; // အနည်းဆုံး ၄ ပတ်လှည့်
    wheel.style.transition = "transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)";
    wheel.style.transform = `rotate(${randomDeg}deg)`;

    setTimeout(() => {
        const multiplier = [0, 2, 0, 5, 0, 1.2][Math.floor(Math.random() * 6)];
        if (multiplier > 0) {
            const win = bet * multiplier; coins += win;
            document.getElementById('snd-win').play();
            alert(`🎡 ကံထူးပါသည်! x${multiplier} = ${win}K ရရှိပါသည်`);
        } else {
            alert("🎡 နောက်တစ်ခါ ပြန်ကြိုးစားပါ");
        }
        wheel.style.transition = "none";
        wheel.style.transform = "rotate(0deg)";
        syncDB();
    }, 3500);
}

// --- ၆။ Wallet & System ---
function showWallet(type) {
    walletType = type;
    document.getElementById('wallet-modal').style.display = 'flex';
    document.getElementById('wallet-title').innerText = type === 'deposit' ? "ငွေသွင်းမည်" : "ငွေထုတ်မည်";
    document.getElementById('rem-bal').innerText = coins.toLocaleString();
}

function updateRemBalance() {
    const amt = parseInt(document.getElementById('wallet-amount').value) || 0;
    const rem = walletType === 'withdraw' ? coins - amt : coins + amt;
    document.getElementById('rem-bal').innerText = rem.toLocaleString();
}

async function submitRequest() {
    const amt = parseInt(document.getElementById('wallet-amount').value);
    const det = document.getElementById('wallet-details').value;
    if (!amt || amt < 1000) return alert("အနည်းဆုံး ၁၀၀၀ ကျပ် ဖြစ်ရပါမည်");

    const { error } = await supabaseClient.from('transactions').insert([
        { profile_id: profileId, type: walletType, amount: amt, details: det, status: 'pending' }
    ]);

    if (!error) {
        if (walletType === 'withdraw') { coins -= amt; syncDB(); }
        alert("တောင်းဆိုမှု အောင်မြင်ပါသည်။");
        closeWallet();
    } else {
        alert("Error: " + error.message);
    }
}

function closeWallet() { document.getElementById('wallet-modal').style.display = 'none'; }
function handleLogout() { localStorage.clear(); window.location.href = "signup.html"; }

init();
