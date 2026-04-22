const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let isLoginMode = false;
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];
const spinSound = new Audio('https://freesound.org/data/previews/121/121511_2105573-lq.mp3');
const winSound = new Audio('https://freesound.org/data/previews/270/270402_5123851-lq.mp3');

// --- Auth System ---
function switchMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('title').innerText = isLoginMode ? "Login" : "Golden Slot";
    document.getElementById('btn-action').innerText = isLoginMode ? "Login ဝင်မည်" : "အကောင့်အသစ်ဖွင့်မည်";
}

async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if (!user || !pass) return alert("ဖြည့်စွက်ရန် လိုအပ်နေပါသည်");

    if (!isLoginMode) {
        if (pass.length < 6) return alert("❌ Password ၆ လုံး အနည်းဆုံး ရှိရပါမယ်");
        const { data: exist } = await supabaseClient.from('profiles').select('username').eq('username', user).maybeSingle();
        if (exist) return alert("❌ ဒီနာမည် ရှိပြီးသားပါ");
        const { data } = await supabaseClient.from('profiles').insert([{ username: user, password: pass, coins: 5000 }]).select().single();
        if (data) { localStorage.setItem('game_user_id', data.id); window.location.href = "index.html"; }
    } else {
        const { data } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if (data) { localStorage.setItem('game_user_id', data.id); window.location.href = "index.html"; }
        else alert("❌ နာမည် သို့မဟုတ် Password မှားနေသည်");
    }
}

// --- Core Game Functions ---
async function fetchCoins() {
    if (!profileId) return;
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

// --- Slot ---
async function playGame() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB(); spinSound.play();
    const reels = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3')];
    let count = 0;
    const timer = setInterval(() => {
        reels.forEach(r => r.innerText = symbols[Math.floor(Math.random() * symbols.length)]);
        if (++count > 15) {
            clearInterval(timer);
            if (reels[0].innerText === reels[1].innerText && reels[1].innerText === reels[2].innerText) {
                coins += 2000; winSound.play(); alert("JACKPOT! +2000K");
            }
            updateDB();
        }
    }, 100);
}

// --- Dice ---
async function playDice() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB(); spinSound.play();
    const d = document.getElementById('dice'); d.classList.add('spinning');
    setTimeout(() => {
        d.classList.remove('spinning');
        const res = Math.floor(Math.random() * 6) + 1;
        d.innerText = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][res];
        if (res >= 4) { coins += 300; winSound.play(); alert("နိုင်ပြီ! +300K"); }
        updateDB();
    }, 1000);
}

// --- Wheel ---
async function playWheel() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB(); spinSound.play();
    const w = document.getElementById('wheel'); w.classList.add('spinning');
    setTimeout(() => {
        w.classList.remove('spinning');
        if (Math.random() > 0.7) { coins += 500; winSound.play(); alert("ဘီးပေါက်ပြီ! +500K"); }
        updateDB();
    }, 1500);
}

function switchGame(g) {
    ['slot','dice','wheel'].forEach(x => document.getElementById(x+'-game').style.display = 'none');
    document.getElementById(g+'-game').style.display = 'block';
}

fetchCoins();
