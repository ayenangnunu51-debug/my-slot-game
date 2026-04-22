const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id'); // ဖုန်းထဲမှာ မှတ်ထားတဲ့ ID ကိုယူတယ်
let isLoginMode = false;
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];

// --- အကောင့်စနစ် (Auth) ---
function toggleMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('form-title').innerText = isLoginMode ? "Login to Game" : "Register Account";
    document.getElementById('main-btn').innerText = isLoginMode ? "Login ဝင်မည်" : "Register & Get 5000K";
    document.getElementById('switch-link').innerText = isLoginMode ? "အကောင့်သစ်ဖွင့်ရန်" : "Login ဝင်ရန်";
}

async function handleAuth() {
    const user = document.getElementById('username').value;
    if (!user) return alert("နာမည်ရိုက်ထည့်ပါ");

    if (isLoginMode) {
        // Login ဝင်ခြင်း
        const { data, error } = await supabaseClient.from('profiles').select('*').eq('username', user).single();
        if (data) {
            localStorage.setItem('game_user_id', data.id); // ID ကို ဖုန်းထဲမှာ မှတ်လိုက်ပြီ
            alert("Login အောင်မြင်သည်!");
            window.location.href = "index.html";
        } else {
            alert("အကောင့်မရှိပါ။ အရင်ဖွင့်ပေးပါ");
        }
    } else {
        // Register လုပ်ခြင်း
        const { data, error } = await supabaseClient.from('profiles').insert([{ username: user, coins: 5000 }]).select().single();
        if (data) {
            localStorage.setItem('game_user_id', data.id); // ID မှတ်လိုက်ပြီ
            alert("အကောင့်ဖွင့်ခြင်းအောင်မြင်သည်! ၅၀၀၀ K ရပါပြီ။");
            window.location.href = "index.html";
        } else {
            alert("ဒီနာမည်က ရှိပြီးသားပါ။ တခြားနာမည်ပြောင်းပေးပါ");
        }
    }
}

// --- ဂိမ်းထဲက အချက်အလက်ယူခြင်း ---
async function fetchCoins() {
    if (!profileId) {
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/my-slot-game/') {
            window.location.href = "signup.html"; // အကောင့်မရှိရင် Signup ကို ပြန်လွှတ်မယ်
        }
        return;
    }

    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).single();
    if (data) {
        coins = data.coins;
        document.getElementById('balance').innerText = coins.toLocaleString();
        document.getElementById('user-name').innerText = data.username;
    }
}

// --- ဂိမ်း Logic များ (Slot/Dice/Wheel) ---
async function updateDB() {
    document.getElementById('balance').innerText = coins.toLocaleString();
    await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
}

// (playGame, playDice, playWheel Function တွေက အဟောင်းအတိုင်း ဆက်ရှိနေပါမယ်)
async function playGame() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100; updateDB();
    const reels = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3')];
    let count = 0;
    const timer = setInterval(async () => {
        reels.forEach(r => r.innerText = symbols[Math.floor(Math.random() * symbols.length)]);
        count++;
        if (count > 10) {
            clearInterval(timer);
            if (reels[0].innerText === reels[1].innerText && reels[1].innerText === reels[2].innerText) {
                coins += 1000; alert("ပေါက်ပြီ! +1000");
            }
            updateDB();
        }
    }, 100);
}

function switchGame(g) {
    ['slot','dice','wheel'].forEach(x => document.getElementById(x+'-game').style.display = 'none');
    document.getElementById(g+'-game').style.display = 'block';
}

function openModal() { document.getElementById('modal').style.display = "block"; }
function closeModal() { document.getElementById('modal').style.display = "none"; }

fetchCoins();
