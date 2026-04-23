// ၁။ Nang Nu ရဲ့ သော့ (Keys) များကို ဒီနေရာမှာ အရင်အစားထိုးပါ
const SB_URL = "https://mgxhoraoblmrqvyjaiw.supabase.co"; 
const SB_KEY = "sb_publishable_WlgcdXqvZTr9MJeV6vAEYw_bMSsvD3J"; 

// Supabase ချိတ်ဆက်မှု တည်ဆောက်ခြင်း
const supabase = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let username = localStorage.getItem('game_username') || "ဧည့်သည်";

// ပင်မစာမျက်နှာကို စစချင်းမှာ Update လုပ်ပေးခြင်း
async function initGame() {
    updateUI();
    if(username !== "ဧည့်သည်") {
        await fetchUserData(); // Database ထဲက ပိုက်ဆံလှမ်းယူမယ်
    }
}

// User ရဲ့ Data (ဥပမာ- ပိုက်ဆံ) ကို Supabase ကနေ ယူခြင်း
async function fetchUserData() {
    const { data, error } = await supabase
        .from('profiles')
        .select('coins')
        .eq('username', username)
        .single();
    
    if (data) {
        coins = data.coins;
        updateUI();
    }
}

// Design အသစ်ရဲ့ Header မှာ နံမည်နဲ့ ပိုက်ဆံပြဖို့
function updateUI() {
    // Header ထဲမှာ User နံမည်ပြရန်
    const authBox = document.querySelector('.auth-box');
    if(localStorage.getItem('game_username')) {
        authBox.innerHTML = `<span style="color:gold; font-weight:bold;">${username}</span> <br> <span style="color:white;">💰 ${coins.toLocaleString()} K</span>`;
    }
}

// အကောင့်ဝင်ခြင်း (Login Button အတွက်)
async function login() {
    const userField = document.getElementById('login-user').value;
    const passField = document.getElementById('login-pass').value;

    if(!userField || !passField) return alert("အမည်နှင့် လျှို့ဝှက်နံပါတ် ဖြည့်ပါ");

    // Supabase မှာ စစ်ဆေးခြင်း
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', userField)
        .eq('password', passField)
        .single();

    if (data) {
        localStorage.setItem('game_username', userField);
        username = userField;
        coins = data.coins;
        alert("အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ");
        updateUI();
    } else {
        alert("အကောင့်မရှိပါ သို့မဟုတ် အချက်အလက်မှားနေပါသည်");
    }
}

// စလော့လှည့်ခြင်း (Slot Function)
async function spinSlot() {
    if (coins < 100) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ");
    
    coins -= 100;
    updateUI();

    // Database ထဲမှာ ပိုက်ဆံသွားလျှော့မယ်
    await supabase.from('profiles').update({ coins: coins }).eq('username', username);
    
    alert("စလော့လှည့်နေသည်...");
    // ဒီမှာ အရင်က Slot RNG Logic တွေ ဆက်ထည့်လို့ရပါတယ်
}

// Web စတက်တာနဲ့ အလုပ်လုပ်ခိုင်းခြင်း
initGame();
