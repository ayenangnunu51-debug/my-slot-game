// ၁။ Supabase Keys များ
const SB_URL = "https://mgxhoraoblmrqvyjaiw.supabase.co"; 
const SB_KEY = "sb_publishable_WlgcdXqvZTr9MJeV6vAEYw_bMSsvD3J"; 

// Supabase Client ကို မှန်ကန်အောင် ပြင်ဆင်ခြင်း
const _supabase = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let username = localStorage.getItem('game_username') || null;

async function init() {
    if (username) {
        await fetchUserData();
    }
    updateUI();
}

// User ရဲ့ လက်ရှိ ပိုက်ဆံကို Database ကယူခြင်း
async function fetchUserData() {
    const { data, error } = await _supabase.from('profiles').select('coins').eq('username', username).single();
    if (data) { coins = data.coins; updateUI(); }
}

function updateUI() {
    const authUI = document.getElementById('auth-ui');
    if (username && authUI) {
        authUI.innerHTML = `<div style="text-align:right;"><span style="color:gold; font-weight:bold;">${username}</span><br>💰 ${coins.toLocaleString()} K</div>`;
    }
}

// Login လုပ်ဆောင်ချက်
async function login() {
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value;
    if(!u || !p) return alert("အချက်အလက် အကုန်ဖြည့်ပါ");

    const { data, error } = await _supabase.from('profiles').select('*').eq('username', u).eq('password', p).single();
    
    if (data) {
        localStorage.setItem('game_username', u);
        username = u; coins = data.coins; updateUI(); alert("ဝင်ရောက်ပြီးပါပြီ");
    } else { alert("အမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားနေပါသည်"); }
}

// အကောင့်ဖွင့်ရန် Form ပြသခြင်း
function showSignup() {
    const panel = document.getElementById('wallet-panel');
    const body = document.getElementById('wallet-body');
    panel.style.display = 'flex';
    body.innerHTML = `
        <h3 style="color:gold;">အကောင့်သစ်ဖွင့်ရန်</h3>
        <input type="text" id="reg-user" placeholder="အမည်သစ် (Username)">
        <input type="password" id="reg-pass" placeholder="လျှို့ဝှက်နံပါတ် (အနည်းဆုံး ၆ လုံး)">
        <button class="login-btn" style="margin-top:10px;" onclick="handleSignup()">အကောင့်ဖွင့်မည်</button>
    `;
}

// အကောင့်သစ်ဖွင့်ခြင်း Logic
async function handleSignup() {
    const newUser = document.getElementById('reg-user').value.trim();
    const newPass = document.getElementById('reg-pass').value;

    // Password ၆ လုံး ရှိမရှိ စစ်ခြင်း
    if (newPass.length < 6) {
        return alert("Password က အနည်းဆုံး ၆ လုံး ရှိရပါမယ်။");
    }
    if (!newUser) return alert("အမည် ထည့်သွင်းပါ။");

    // Username တူနေသလား အရင်စစ်ဆေးခြင်း
    const { data: existingUser } = await _supabase
        .from('profiles')
        .select('username')
        .eq('username', newUser)
        .maybeSingle();

    if (existingUser) {
        return alert("ဒီအမည်က ရှိပြီးသားဖြစ်နေလို့ တခြားအမည်တစ်ခု သုံးပေးပါ။");
    }

    // အကောင့်အသစ် ထည့်သွင်းခြင်း (စစချင်း coins ၅၀၀၀ ပေးမည်)
    const { error } = await _supabase
        .from('profiles')
        .insert([{ username: newUser, password: newPass, coins: 5000 }]);

    if (!error) {
        alert("အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ အခု ဝင်ရောက်နိုင်ပါပြီ။");
        closeWallet();
    } else {
        alert("အမှားအယွင်း တစ်ခုရှိနေပါသည်။");
    }
}

// Wallet နှင့် ပတ်သက်သော Function များ
function showWallet(type) {
    if (!username) return alert("အရင်ဆုံး အကောင့်ဝင်ပါ");
    const panel = document.getElementById('wallet-panel');
    const body = document.getElementById('wallet-body');
    panel.style.display = 'flex';
    if (type === 'deposit') {
        body.innerHTML = `<h3 style="color:gold;">ငွေသွင်းရန်</h3><p>Kpay/Wave: 09-XXXXXXXX</p><input type="number" id="amt" placeholder="ပမာဏ"><button class="login-btn" onclick="handleWallet('in')">တင်ပြမည်</button>`;
    } else {
        body.innerHTML = `<h3 style="color:gold;">ငွေထုတ်ရန်</h3><p>လက်ကျန်: ${coins} K</p><input type="number" id="amt" placeholder="ပမာဏ"><button class="login-btn" onclick="handleWallet('out')">ထုတ်မည်</button>`;
    }
}

async function handleWallet(action) {
    const amt = parseInt(document.getElementById('amt').value);
    if (!amt || amt <= 0) return alert("ပမာဏမှန်ကန်စွာဖြည့်ပါ");
    if (action === 'out' && amt > coins) return alert("လက်ကျန်ငွေမလုံလောက်ပါ");
    
    let newBalance = (action === 'in') ? coins + amt : coins - amt;
    const { error } = await _supabase.from('profiles').update({ coins: newBalance }).eq('username', username);
    if (!error) { coins = newBalance; updateUI(); closeWallet(); alert("အောင်မြင်ပါသည်"); }
}

function closeWallet() { document.getElementById('wallet-panel').style.display = 'none'; }

async function spinSlot() {
    if (!username) return alert("အရင်ဆုံး အကောင့်ဝင်ပါ");
    if (coins < 100) return alert("ငွေမလုံလောက်ပါ");
    coins -= 100; updateUI();
    await _supabase.from('profiles').update({ coins: coins }).eq('username', username);
    alert("စလော့လှည့်နေပါသည်...");
}

init();
