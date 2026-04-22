const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0;
let profileId = null;
const symbols = ['💎', '🍒', '🔔', '⭐', '🍎', '🍋'];

async function fetchCoins() {
    const { data } = await supabaseClient.from('profiles').select('*').limit(1).single();
    if (data) {
        coins = data.coins;
        profileId = data.id;
        document.getElementById('balance').innerText = coins.toLocaleString();
        document.getElementById('user-name').innerText = data.username;
    }
}

function switchGame(game) {
    const games = ['slot-game', 'dice-game', 'wheel-game'];
    games.forEach(g => document.getElementById(g).style.display = 'none');
    document.getElementById(game + '-game').style.display = 'block';
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase().includes(game)) btn.classList.add('active');
    });
    document.getElementById('msg').innerText = "Ready to Play!";
}

// Slot Game Logic
async function playGame() {
    if (coins < 100) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ");
    coins -= 100;
    updateDB();
    
    const btn = document.getElementById('spin-btn');
    btn.disabled = true;
    const reels = [document.getElementById('r1'), document.getElementById('r2'), document.getElementById('r3')];
    
    let count = 0;
    const timer = setInterval(async () => {
        reels.forEach(r => r.innerText = symbols[Math.floor(Math.random() * symbols.length)]);
        count++;
        if (count > 15) {
            clearInterval(timer);
            if (reels[0].innerText === reels[1].innerText && reels[1].innerText === reels[2].innerText) {
                coins += 1000;
                document.getElementById('msg').innerText = "🎉 WINNER +1000 K 🎉";
            } else {
                document.getElementById('msg').innerText = "ထပ်မံကြိုးစားပါဦး";
            }
            await updateDB();
            btn.disabled = false;
        }
    }, 100);
}

// Dice Game Logic
async function playDice() {
    if (coins < 100) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ");
    coins -= 100;
    updateDB();
    
    const dice = document.getElementById('dice');
    const btn = document.getElementById('dice-btn');
    btn.disabled = true;
    dice.style.transform = "rotate(720deg)";
    
    setTimeout(async () => {
        const result = Math.floor(Math.random() * 6) + 1;
        const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        dice.innerText = diceFaces[result - 1];
        dice.style.transform = "rotate(0deg)";
        
        if (result >= 4) {
            coins += 200;
            document.getElementById('msg').innerText = "🎉 အနိုင်ရရှိသည်! +200 K";
        } else {
            document.getElementById('msg').innerText = "ရှုံးသွားပါပြီ!";
        }
        await updateDB();
        btn.disabled = false;
    }, 600);
}

// Wheel Game Logic
async function playWheel() {
    if (coins < 100) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ");
    coins -= 100;
    updateDB();
    
    const wheel = document.getElementById('wheel');
    const btn = document.getElementById('wheel-btn');
    btn.disabled = true;
    
    const rotation = Math.floor(Math.random() * 360) + 1440;
    wheel.style.transform = `rotate(${rotation}deg)`;
    
    setTimeout(async () => {
        const win = Math.random() > 0.7; 
        if (win) {
            coins += 500;
            document.getElementById('msg').innerText = "🎊 ကံထူးပါသည်! +500 K";
        } else {
            document.getElementById('msg').innerText = "နောင်တစ်ကြိမ် ပြန်ကြိုးစားပါ";
        }
        wheel.style.transform = `rotate(0deg)`;
        await updateDB();
        btn.disabled = false;
    }, 3000);
}

async function updateDB() {
    document.getElementById('balance').innerText = coins.toLocaleString();
    await supabaseClient.from('profiles').update({ coins: coins }).eq('id', profileId);
}

function openModal() { document.getElementById('modal').style.display = "block"; }
function closeModal() { document.getElementById('modal').style.display = "none"; }

fetchCoins();
