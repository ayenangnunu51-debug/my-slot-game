const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];

// အသံဖိုင်များ
const spinSound = new Audio('https://freesound.org/data/previews/121/121511_2105573-lq.mp3');
const winSound = new Audio('https://freesound.org/data/previews/270/270402_5123851-lq.mp3');

async function fetchCoins() {
    if (!profileId) return;
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).single();
    if (data) {
        coins = data.coins;
        updateUI(data.username);
    }
}

function updateUI(name) {
    if(document.getElementById('balance')) document.getElementById('balance').innerText = coins.toLocaleString();
    if(document.getElementById('user-name') && name) document.getElementById('user-name').innerText = name;
}

async function updateDB() {
    updateUI();
    await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
}

// --- 🎰 SLOT GAME ---
async function playGame() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB(); spinSound.play();
    const reels = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3')];
    let count = 0;
    const timer = setInterval(() => {
        reels.forEach(r => r.innerText = symbols[Math.floor(Math.random() * symbols.length)]);
        count++;
        if (count > 15) {
            clearInterval(timer);
            if (reels[0].innerText === reels[1].innerText && reels[1].innerText === reels[2].innerText) {
                coins += 2000; winSound.play(); alert("JACKPOT! +2000K");
            }
            updateDB();
        }
    }, 100);
}

// --- 🎲 DICE GAME ---
async function playDice() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB(); spinSound.play();
    const diceEl = document.getElementById('dice');
    diceEl.classList.add('spinning');
    setTimeout(() => {
        diceEl.classList.remove('spinning');
        const res = Math.floor(Math.random() * 6) + 1;
        const diceFaces = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        diceEl.innerText = diceFaces[res];
        if (res >= 4) { coins += 200; winSound.play(); alert("နိုင်ပြီ! +200K"); }
        updateDB();
    }, 1000);
}

// --- 🎡 WHEEL GAME ---
async function playWheel() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB(); spinSound.play();
    const wheelEl = document.getElementById('wheel');
    wheelEl.classList.add('spinning');
    setTimeout(() => {
        wheelEl.classList.remove('spinning');
        const win = Math.random() > 0.7; // ၃၀ ရာခိုင်နှုန်း နိုင်ခြေ
        if (win) { coins += 500; winSound.play(); alert("ဘီးပေါက်ပြီ! +500K"); }
        else { alert("ကံမကောင်းပါ၊ နောက်တစ်ကြိမ်ပြန်ကြိုးစားပါ"); }
        updateDB();
    }, 1500);
}

function switchGame(g) {
    ['slot','dice','wheel'].forEach(x => document.getElementById(x+'-game').style.display = 'none');
    document.getElementById(g+'-game').style.display = 'block';
}

fetchCoins();
