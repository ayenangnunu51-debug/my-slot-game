const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let profileId = localStorage.getItem('game_user_id');

async function handleAuth(type) {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (!user || !pass) return alert("နာမည်နှင့် Password နှစ်ခုလုံး ဖြည့်ပါ");

    if (type === 'register') {
        // ၁။ နာမည်တူ ရှိ၊ မရှိ အရင်စစ်မယ်
        const { data: existingUser } = await supabaseClient
            .from('profiles')
            .select('username')
            .eq('username', user)
            .maybeSingle();

        if (existingUser) return alert("ဤနာမည်ဖြင့် အကောင့်ရှိပြီးသားပါ။ တခြားနာမည်ပြောင်းပါ");

        // ၂။ အကောင့်အသစ် ဆောက်မယ်
        const { data, error } = await supabaseClient
            .from('profiles')
            .insert([{ username: user, password: pass, coins: 5000 }])
            .select().single();

        if (data) {
            localStorage.setItem('game_user_id', data.id);
            alert("အကောင့်ဖွင့်ခြင်း အောင်မြင်သည်! ၅၀၀၀ K ရပါပြီ။");
            window.location.href = "index.html";
        }
    } else {
        // Login ဝင်တဲ့အပိုင်း
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('username', user)
            .eq('password', pass) // နာမည်ရော Password ရော ကိုက်မှပေးဝင်မယ်
            .maybeSingle();

        if (data) {
            localStorage.setItem('game_user_id', data.id);
            alert("Login အောင်မြင်သည်!");
            window.location.href = "index.html";
        } else {
            alert("နာမည် (သို့မဟုတ်) Password မှားနေပါသည်");
        }
    }
}

// (ကျန်တဲ့ fetchCoins နဲ့ ဂိမ်း Function တွေက အရင်အတိုင်းပဲ ထားလိုက်ပါ)
async function fetchCoins() {
    if (!profileId) return;
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).single();
    if (data) {
        if(document.getElementById('balance')) document.getElementById('balance').innerText = data.coins.toLocaleString();
        if(document.getElementById('user-name')) document.getElementById('user-name').innerText = data.username;
    }
}
fetchCoins();
