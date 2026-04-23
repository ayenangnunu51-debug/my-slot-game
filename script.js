const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let walletType = '';
let isLoginMode = false;
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];

// --- Auth System ---
function switchMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('title').innerText = isLoginMode ? "Login" : "Golden Slot";
    document.getElementById('btn-action').innerText = isLoginMode ? "Login ဝင်မည်" : "အကောင့်ဖွင့်မည်";
    document.getElementById('toggle-text').innerHTML = isLoginMode ? 'အကောင့်မရှိဘူးလား? <span style="color: gold;">ဒီမှာဖွင့်ပါ</span>' : 'အကောင့်ရှိလား? <span style="color: gold;">Login ဝင်ပါ</span>';
}

async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if (!user || !pass) return alert("ဖြည့်စွက်ပါ");

    if (!isLoginMode) {
        const { data, error } = await supabaseClient.from('profiles').insert([{ username: user, password: pass, coins: 5000 }]).select().single();
        if (error) return alert("Error: " + error.message);
        localStorage.setItem('game_user_id', data.id);
        window.location.href = "index.html";
    } else {
        const { data } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if (data) {
            localStorage.setItem('game_user_id', data.id);
            window.location.href = "index.html";
        } else alert("မှားယွင်းနေပါသည်");
    }
}

// --- Game Logic ---
async function fetchCoins() {
    if (!profileId) {
        if (window.location.pathname.includes("index.html")) window.location.href = "signup.html";
        return;
    }
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (data) {
        coins = data.coins;
        document.getElementById('balance').innerText = coins.toLocaleString();
        document.getElementById('user-name').innerText = data.username;
    }
}

function showWallet(type) {
    walletType = type;
    document.getElementById('wallet-modal').style.display = 'block';
    document.getElementById('wallet-title').innerText = type === 'deposit' ? "ငွေသွင်းမည်" : "ငွေထုတ်မည်";
    document.getElementById('cur-bal').innerText = coins.toLocaleString();
    document.getElementById('rem-bal').innerText = coins.toLocaleString();
}

function calculateBalance() {
    const amt = parseInt(document.getElementById('wallet-amount').value) || 0;
    let rem = walletType === 'withdraw' ? coins - amt : coins + amt;
    document.getElementById('rem-bal').innerText = rem.toLocaleString();
    document.getElementById('rem-bal').style.color = rem < 0 ? "red" : "#00ff00";
}

async function submitWalletRequest() {
    const amt = parseInt(document.getElementById('wallet-amount').value);
    const det = document.getElementById('transaction-id').value.trim();
    if (!amt || amt < 5000 || !det) return alert("အချက်အလက် ပြည့်စုံစွာ ဖြည့်ပါ");

    const { error } = await supabaseClient.from('transactions').insert([
        { profile_id: profileId, type: walletType, amount: amt, details: det, status: 'pending' }
    ]);

    if (error) alert("Error: " + error.message);
    else {
        if (walletType === 'withdraw') {
            coins -= amt;
            await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
        }
        alert("တင်ပြမှု အောင်မြင်ပါသည်။");
        location.reload();
    }
}

async function playGame() {
    if (coins < 100) return alert("ပိုက်ဆံမလုံလောက်ပါ");
    coins -= 100;
    document.getElementById('balance').innerText = coins.toLocaleString();
    const r = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3')];
    let c = 0;
    const t = setInterval(() => {
        r.forEach(el => el.innerText = symbols[Math.floor(Math.random() * symbols.length)]);
        if (++c > 12) {
            clearInterval(t);
            if (r[0].innerText === r[1].innerText && r[1].innerText === r[2].innerText) {
                coins += 2000; alert("🎉 ပေါက်ပြီ! +2,000K");
            }
            supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
            document.getElementById('balance').innerText = coins.toLocaleString();
        }
    }, 100);
}

function handleLogout() { localStorage.clear(); window.location.href = "signup.html"; }
function closeWallet() { document.getElementById('wallet-modal').style.display = 'none'; }
fetchCoins();
