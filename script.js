const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = localStorage.getItem('game_user_id');
let isLogin = false;
let currentWallet = '';

// Cards for Shan Koe Mee
const cards = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

// --- Auth ---
function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? "LOGIN" : "CREATE ACCOUNT";
    document.getElementById('auth-btn').innerText = isLogin ? "Login ဝင်မည်" : "အကောင့်ဖွင့်မည်";
}

async function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(!user || !pass) return alert("ဖြည့်စွက်ပါ");

    if(!isLogin) {
        const { data: exist } = await supabaseClient.from('profiles').select('username').eq('username', user).maybeSingle();
        if(exist) return alert("❌ ဤနာမည် ရှိပြီးသားပါ။");
        const { data, error } = await supabaseClient.from('profiles').insert([{username: user, password: pass, coins: 5000}]).select().single();
        if(error) return alert(error.message);
        saveLogin(data);
    } else {
        const { data } = await supabaseClient.from('profiles').select('*').eq('username', user).eq('password', pass).maybeSingle();
        if(data) saveLogin(data); else alert("❌ မှားယွင်းနေပါသည်။");
    }
}

function saveLogin(user) { localStorage.setItem('game_user_id', user.id); location.reload(); }

// --- App Core ---
async function init() {
    if(!profileId) return;
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('game-page').style.display = 'block';

    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if(data) {
        coins = data.coins;
        document.getElementById('display-user').innerText = data.username;
        updateUI();
        // Daily Bonus Logic
        const today = new Date().toDateString();
        if(data.last_login !== today) {
            coins += 1000;
            alert("🎁 Daily Bonus 1,000K ရရှိပါသည်!");
            await supabaseClient.from('profiles').update({coins: coins, last_login: today}).eq('id', profileId);
            updateUI();
        }
    }
}

function updateUI() { document.getElementById('balance').innerText = coins.toLocaleString(); }
async function syncDB() { await supabaseClient.from('profiles').update({coins: coins}).eq('id', profileId); updateUI(); }

function switchGame(type) {
    ['shan', 'slot', 'dice', 'wheel'].forEach(g => {
        document.getElementById(g+'-area').style.display = (g === type) ? 'block' : 'none';
        document.getElementById('btn-'+g).classList.toggle('active', g === type);
    });
}

function playSound(id) {
    const s = document.getElementById(id);
    if(s) { s.currentTime = 0; s.play().catch(e => console.log("Audio Blocked")); }
}

// --- Shan Koe Mee Logic (New!) ---
async function playShan() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if(coins < bet) return alert("ငွေမလုံလောက်ပါ");
    
    document.getElementById('shan-btn').disabled = true;
    coins -= bet; updateUI();
    playSound('snd-card');

    setTimeout(() => {
        const p1 = Math.floor(Math.random()*13); const p2 = Math.floor(Math.random()*13);
        const d1 = Math.floor(Math.random()*13); const d2 = Math.floor(Math.random()*13);
        
        const pScore = (getVal(p1) + getVal(p2)) % 10;
        const dScore = (getVal(d1) + getVal(d2)) % 10;

        document.getElementById('player-cards').innerText = `${cards[p1]} ${cards[p2]}`;
        document.getElementById('dealer-cards').innerText = `${cards[d1]} ${cards[d2]}`;

        setTimeout(() => {
            if(pScore > dScore) {
                let winAmt = bet * 2;
                if(pScore >= 8) { winAmt = bet * 3; alert(`ရှမ်း${pScore}! ၃ ဆနိုင်ပါသည်။`); }
                else alert(`${pScore} ပေါက်ဖြင့် နိုင်ပါသည်။`);
                coins += winAmt; playSound('snd-win');
            } else if(pScore === dScore) {
                coins += bet; alert("သရေကျပါသည်။");
            } else {
                alert(`ဒိုင်က ${dScore} ပေါက်ဖြင့် စားသွားပါသည်။`);
            }
            syncDB();
            document.getElementById('shan-btn').disabled = false;
        }, 800);
    }, 500);
}
function getVal(idx) { return (idx >= 9) ? 0 : idx + 1; }

// --- Other Games ---
async function playSlot() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if(coins < bet) return alert("ငွေမလုံလောက်ပါ");
    coins -= bet; updateUI(); playSound('snd-spin');
    let c = 0;
    const t = setInterval(() => {
        const icons = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];
        const r = [icons[Math.floor(Math.random()*6)], icons[Math.floor(Math.random()*6)], icons[Math.floor(Math.random()*6)]];
        document.getElementById('r1').innerText = r[0]; document.getElementById('r2').innerText = r[1]; document.getElementById('r3').innerText = r[2];
        if(++c > 15) {
            clearInterval(t);
            if(r[0]===r[1] && r[1]===r[2]) { coins += bet*10; playSound('snd-win'); alert("JACKPOT!"); }
            else if(r[0]===r[1] || r[1]===r[2] || r[0]===r[2]) { coins += bet*2; alert("WIN!"); }
            syncDB();
        }
    }, 800);
}

async function playDice(choice) {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if(coins < bet) return alert("ငွေမလုံလောက်ပါ");
    coins -= bet; updateUI(); playSound('snd-dice');
    const res = Math.floor(Math.random()*6)+1;
    document.getElementById('dice-view').innerText = ['⚀','⚁','⚂','⚃','⚄','⚅'][res-1];
    if((choice==='high' && res>=4) || (choice==='low' && res<=3)) { coins += bet*1.9; playSound('snd-win'); alert("DICE WIN!"); }
    syncDB();
}

async function playWheel() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if(coins < bet) return alert("ငွေမလုံလောက်ပါ");
    coins -= bet; updateUI();
    const w = document.getElementById('wheel-inner');
    const deg = Math.floor(Math.random()*360) + 1440;
    w.style.transition = "transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)";
    w.style.transform = `rotate(${deg}deg)`;
    setTimeout(() => {
        const mult = [0, 2, 0, 5, 0, 1.5][Math.floor(Math.random()*6)];
        if(mult > 0) { coins += bet*mult; playSound('snd-win'); alert("WHEEL WIN!"); }
        w.style.transition = "none"; w.style.transform = "rotate(0deg)";
        syncDB();
    }, 3200);
}

// --- Wallet ---
function openWallet(type) {
    currentWallet = type;
    document.getElementById('w-title').innerText = type==='deposit' ? "ငွေသွင်းမည်" : "ငွေထုတ်မည်";
    document.getElementById('wallet-modal').style.display='flex';
}
function closeWallet() { document.getElementById('wallet-modal').style.display='none'; }
async function submitWallet() {
    const amt = parseInt(document.getElementById('w-amount').value);
    if(!amt || amt < 5000) return alert("အနည်းဆုံး ၅၀၀၀ ကျပ်ပါ။");
    await supabaseClient.from('transactions').insert([{profile_id: profileId, type: currentWallet, amount: amt, details: document.getElementById('w-phone').value, status: 'pending'}]);
    if(currentWallet === 'withdraw') { coins -= amt; syncDB(); }
    alert("တင်ပြပြီးပါပြီ။ ခေတ္တစောင့်ဆိုင်းပေးပါ။"); closeWallet();
}

function handleLogout() { localStorage.clear(); location.reload(); }
init();
