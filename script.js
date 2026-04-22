const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let isLoginMode = false;
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];

// Register နဲ့ Login ပြောင်းတဲ့ခလုတ်
function switchMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('title').innerText = isLoginMode ? "Login to Game" : "Golden Slot";
    document.getElementById('btn-action').innerText = isLoginMode ? "Login ဝင်မည်" : "အကောင့်အသစ်ဖွင့်မည်";
}

async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (!user || !pass) return alert("နာမည်နှင့် Password ဖြည့်ပါ");

    if (!isLoginMode) {
        // --- Register (Password ၆ လုံး စစ်ဆေးချက်ပါသည်) ---
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
        // --- Login ---
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
