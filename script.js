const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let profileId = localStorage.getItem('game_user_id'); 

async function handleAuth() {
    const user = document.getElementById('username').value;
    if (!user) return alert("နာမည်ရိုက်ထည့်ပါ");

    const { data, error } = await supabaseClient
        .from('profiles')
        .insert([{ username: user, coins: 5000 }])
        .select().single();

    if (error) {
        alert("ဒီနာမည်က ရှိပြီးသားပါ။ တခြားနာမည်ပြောင်းပေးပါ");
    } else {
        localStorage.setItem('game_user_id', data.id); // ID ကို ဖုန်းမှာ မှတ်လိုက်ပြီ
        alert("အောင်မြင်ပါသည်! ၅၀၀၀ K ရပါပြီ။");
        window.location.href = "index.html"; // ဂိမ်းထဲကို တန်းပို့ပေးမယ်
    }
}

async function fetchCoins() {
    if (!profileId) return;
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).single();
    if (data) {
        if(document.getElementById('balance')) document.getElementById('balance').innerText = data.coins.toLocaleString();
        if(document.getElementById('user-name')) document.getElementById('user-name').innerText = data.username;
    }
}
fetchCoins();
