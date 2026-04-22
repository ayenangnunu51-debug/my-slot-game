const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let isLoginMode = false;
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];

// --- ၁။ Register/Login ပြောင်းလဲခြင်း ---
function switchMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('title').innerText = isLoginMode ? "Login to Game" : "Golden Slot";
    document.getElementById('btn-action').innerText = isLoginMode ? "Login ဝင်မည်" : "အကောင့်အသစ်ဖွင့်မည်";
}

// --- ၂။ အကောင့်စစ်ဆေးခြင်း (Password 6 လုံး နှင့် နာမည်တူ စစ်ဆေးချက်ပါသည်) ---
async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (!user || !pass) return alert("နာမည်နှင့် Password ဖြည့်ပါ");

    if (!isLoginMode) {
        // Register အပိုင်း
        if (pass.length < 6) return alert("❌ Password က အနည်းဆုံး ၆ လုံး ရှိရပါမယ်!");

        const { data: checkUser } = await supabaseClient.from('profiles').select('username').eq('username', user).maybeSingle();
        if (checkUser) return alert("❌ ဒီနာမည်က ရှိပြီးသားပါ။ တခြားနာမည်ပြောင်းပါ");

        const { data, error } = await supabaseClient.from('profiles').insert([{ username: user, password: pass, coins: 5000 }]).select().single();
        if (data) {
            localStorage.setItem('game_user_id', data.id);
            alert("✅ အောင်မြင်သည်! ၅၀၀၀ K ရပါပြီ။");
            window.location.href = "index.html";
        }
    } else {
        // Login အပိုင်း
        const { data } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if (data) {
            localStorage.setItem('game_user_id', data.id);
            alert("🎉 Login အောင်မြင်သည်!");
            window.location.href = "index.html";
        } else {
            alert("❌ နာမည် (သို့မဟုတ်) Password မှားနေပါသည်");
        }
    }
}

// --- ၃။ ဂိမ်းထဲက အချက်အလက်ယူခြင်း ---
async function fetchCoins() {
    if (!profileId) return;
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).single();
    if (data) {
        coins = data.coins;
        if(document.getElementById('balance')) document.getElementById('balance').innerText = coins.toLocaleString();
        if(document.getElementById('user-name')) document.getElementById('user-name').innerText = data.username;
    }
}

async function updateDB() {
    if(document.getElementById('balance')) document.getElementById('balance').innerText = coins.toLocaleString();
    await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
}

// --- ၄။ Slot Game ဆော့ခြင်း ---
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
    ['slot','dice','wheel'].forEach(x => {
        const el = document.getElementById(x+'-game');
        if(el) el.style.display = 'none';
    });
    const target = document.getElementById(g+'-game');
    if(target) target.style.display = 'block';
}

fetchCoins();
