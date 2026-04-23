const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let walletType = '';
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];
const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

async function fetchCoins() {
    if (!profileId) return window.location.href = "signup.html";
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (data) { coins = data.coins; updateUI(); }
}

function updateUI() {
    document.getElementById('balance').innerText = coins.toLocaleString();
    document.getElementById('user-name').innerText = localStorage.getItem('game_username') || "Player";
}

function switchGame(game) {
    document.getElementById('slot-area').style.display = game === 'slot' ? 'block' : 'none';
    document.getElementById('dice-area').style.display = game === 'dice' ? 'block' : 'none';
    document.getElementById('wheel-area').style.display = game === 'wheel' ? 'block' : 'none';
}

function getBet() { return parseInt(document.getElementById('bet-amount').value); }

// --- Game Functions ---
async function playSlot() {
    const bet = getBet();
    if (coins < bet) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= bet; updateUI();
    document.getElementById('sound-spin').play();

    let count = 0;
    const timer = setInterval(() => {
        document.getElementById('r1').innerText = symbols[Math.floor(Math.random() * symbols.length)];
        document.getElementById('r2').innerText = symbols[Math.floor(Math.random() * symbols.length)];
        document.getElementById('r3').innerText = symbols[Math.floor(Math.random() * symbols.length)];
        if (++count > 12) {
            clearInterval(timer);
            const r = [document.getElementById('r1').innerText, document.getElementById('r2').innerText, document.getElementById('r3').innerText];
            if (r[0] === r[1] && r[1] === r[2]) {
                coins += bet * 10; document.getElementById('sound-win').play(); alert("JACKPOT! x10");
            }
            saveBalance();
        }
    }, 100);
}

async function playDice() {
    const bet = getBet();
    if (coins < bet) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= bet; updateUI();
    document.getElementById('sound-dice').play();

    let count = 0;
    const timer = setInterval(() => {
        document.getElementById('dice-result').innerText = diceFaces[Math.floor(Math.random() * 6)];
        if (++count > 10) {
            clearInterval(timer);
            const res = Math.floor(Math.random() * 6) + 1;
            document.getElementById('dice-result').innerText = diceFaces[res-1];
            if (res >= 4) { coins += bet * 2; alert("နိုင်ပြီ! x2"); }
            saveBalance();
        }
    }, 100);
}

async function playWheel() {
    const bet = getBet();
    if (coins < bet) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= bet; updateUI();
    
    const prizes = [0, 2, 0, 5, 0, 1.5];
    const win = prizes[Math.floor(Math.random() * prizes.length)];
    alert("Wheel လှည့်နေသည်...");
    setTimeout(() => {
        coins += bet * win;
        alert(win > 0 ? `နိုင်ပြီ! x${win}` : "ကံမကောင်းပါ");
        saveBalance();
    }, 1000);
}

async function saveBalance() {
    updateUI();
    await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
}

// --- Wallet Logic ---
function showWallet(type) {
    walletType = type;
    document.getElementById('wallet-modal').style.display = 'block';
    document.getElementById('cur-bal').innerText = coins.toLocaleString();
}

function calculateBalance() {
    const amt = parseInt(document.getElementById('wallet-amount').value) || 0;
    document.getElementById('rem-bal').innerText = (walletType === 'withdraw' ? coins - amt : coins + amt).toLocaleString();
}

async function submitWalletRequest() {
    const amt = parseInt(document.getElementById('wallet-amount').value);
    const phone = document.getElementById('target-phone').value;
    if (walletType === 'withdraw' && amt > coins) return alert("လက်ကျန်မလုံလောက်");
    
    await supabaseClient.from('transactions').insert([{ profile_id: profileId, type: walletType, amount: amt, details: phone, status: 'pending' }]);
    if (walletType === 'withdraw') { coins -= amt; saveBalance(); }
    alert("တောင်းဆိုမှု အောင်မြင်သည်");
    document.getElementById('wallet-modal').style.display = 'none';
}

function handleLogout() { localStorage.clear(); window.location.href = "signup.html"; }
fetchCoins();
