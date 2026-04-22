const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let isLoginMode = false;

// Register နဲ့ Login ပြောင်းလဲတဲ့စနစ်
function switchMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('title').innerText = isLoginMode ? "Login to Game" : "Golden Slot";
    document.getElementById('btn-action').innerText = isLoginMode ? "Login ဝင်မည်" : "အကောင့်အသစ်ဖွင့်မည်";
    document.getElementById('toggle-text').innerHTML = isLoginMode ? "အကောင့်မရှိသေးဘူးလား? <span style='color: #ffd700;'>အသစ်ဖွင့်ရန်</span>" : "အကောင့်ရှိပြီးသားလား? <span style='color: #ffd700;'>ဒီမှာ Login ဝင်ပါ</span>";
}

async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (!user || !pass) return alert("နာမည်နှင့် Password ဖြည့်ပါ");

    if (!isLoginMode) {
        // --- အကောင့်အသစ်ဖွင့်ခြင်း (Register) ---
        // ၁။ နာမည်တူရှိ၊ မရှိ စစ်ဆေးခြင်း
        const { data: checkUser } = await supabaseClient.from('profiles').select('username').eq('username', user).maybeSingle();
        if (checkUser) return alert("❌ ဒီနာမည်က ရှိပြီးသားပါ။ တခြားနာမည်ပြောင်းပေးပါ");

        // ၂။ အကောင့်အသစ်ထဲသို့ သိမ်းခြင်း
        const { data, error } = await supabaseClient.from('profiles').insert([{ username: user, password: pass, coins: 5000 }]).select().single();
        if (data) {
            localStorage.setItem('game_user_id', data.id);
            alert("✅ အကောင့်ဖွင့်ခြင်း အောင်မြင်သည်! ၅၀၀၀ K လက်ဆောင်ရပါပြီ။");
            window.location.href = "index.html";
        }
    } else {
        // --- Login ဝင်ခြင်း ---
        const { data, error } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if (data) {
            localStorage.setItem('game_user_id', data.id);
            alert("🎉 Login အောင်မြင်သည်!");
            window.location.href = "index.html";
        } else {
            alert("❌ နာမည် (သို့မဟုတ်) Password မှားနေပါသည်");
        }
    }
}

// ဂိမ်းထဲက အချက်အလက်ယူခြင်းအပိုင်း (fetchCoins စသည်ဖြင့်)
// (အပေါ်က Function တွေကို အရင် Update လုပ်ပြီးမှ ကျန်တာတွေ ဆက်ထည့်ပါ)
