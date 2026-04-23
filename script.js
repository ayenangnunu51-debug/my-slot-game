const SB_URL = "https://mgxhoraoblmrqvyjaiw.supabase.co"; 
const SB_KEY = "sb_publishable_WlgcdXqvZTr9MJeV6vAEYw_bMSsvD3J"; 
const supabase = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let username = localStorage.getItem('game_username') || null;

async function init() {
    if (username) {
        await fetchUserData();
    }
    updateUI();
}

async function fetchUserData() {
    const { data, error } = await supabase.from('profiles').select('coins').eq('username', username).single();
    if (data) { coins = data.coins; updateUI(); }
}

function updateUI() {
    const authUI = document.getElementById('auth-ui');
    if (username) {
        authUI.innerHTML = `<div style="text-align:right;"><span style="color:gold;">${username}</span><br>💰 ${coins.toLocaleString()} K</div>`;
    }
}

async function login() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const { data } = await supabase.from('profiles').select('*').eq('username', u).eq('password', p).single();
    if (data) {
        localStorage.setItem('game_username', u);
        username = u; coins = data.coins; updateUI(); alert("ဝင်ရောက်ပြီးပါပြီ");
    } else { alert("အချက်အလက်မှားနေပါသည်"); }
}

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
    
    // Database Update
    let newBalance = (action === 'in') ? coins + amt : coins - amt;
    const { error } = await supabase.from('profiles').update({ coins: newBalance }).eq('username', username);
    if (!error) { coins = newBalance; updateUI(); closeWallet(); alert("အောင်မြင်ပါသည်"); }
}

function closeWallet() { document.getElementById('wallet-panel').style.display = 'none'; }

async function spinSlot() {
    if (coins < 100) return alert("ငွေမလုံလောက်ပါ");
    coins -= 100; updateUI();
    await supabase.from('profiles').update({ coins: coins }).eq('username', username);
    alert("စလော့လှည့်နေပါသည်...");
}

init();
