const SB_URL = "https://mgxhoraoablmrqvyjaiw.supabase.co";
const SB_KEY = "sb_publishable_wIgcdXqvZTr9MJeV6vAEYw_bMSsvD3J";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

let coins = 0, profileId = localStorage.getItem('game_user_id');
let timeRemaining = 30, hasPlacedBet = false;

// ၁။ Timer Loop စနစ် (Live Table အတွက်)
function startLiveTimer() {
    setInterval(() => {
        timeRemaining--;
        if (timeRemaining <= 0) {
            timeRemaining = 30;
            resetShanTable();
        }
        
        updateUIElements();

        // ၁၀ စက္ကန့်အလိုမှာ ဖဲဝေမည်
        if (timeRemaining === 10) {
            dealLiveCards();
        }
    }, 1000);
}

function updateUIElements() {
    document.getElementById('timer-txt').innerText = timeRemaining;
    document.getElementById('bar-fill').style.width = (timeRemaining / 30) * 100 + "%";
    
    const status = document.getElementById('status');
    if (timeRemaining > 10) {
        status.innerText = "လောင်းကြေးတင်နိုင်သည်";
        status.style.color = "#28a745";
    } else {
        status.innerText = "ဖဲဝေနေသည်... ခေတ္တစောင့်ပါ";
        status.style.color = "#dc3545";
    }
}

// ၂။ ရှမ်းကိုးမီး ဖဲဝေခြင်း (လူပုံစံ Avatars တွေဆီ ဝေမည်)
function dealLiveCards() {
    const seats = ['d-cards', 'p1-cards', 'p2-cards', 'p3-cards', 'p4-cards', 'my-cards'];
    
    seats.forEach((id, index) => {
        setTimeout(() => {
            const card1 = generateRandomCard();
            const card2 = generateRandomCard();
            document.getElementById(id).innerHTML = renderCardHTML(card1) + renderCardHTML(card2);
        }, index * 300);
    });
}

function generateRandomCard() {
    const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const suits = ['♠','♥','♦','♣'];
    const r = ranks[Math.floor(Math.random()*ranks.length)];
    const s = suits[Math.floor(Math.random()*suits.length)];
    return { r, s, isRed: (s==='♥'||s==='♦') };
}

function renderCardHTML(card) {
    return `<div class="card ${card.isRed ? 'red' : ''}"><div>${card.r}${card.s}</div></div>`;
}

// ၃။ ငွေသွင်းငွေထုတ် စနစ် (အသေးစိတ်)
async function submitIn() {
    const amt = document.getElementById('in-amt').value;
    const txId = document.getElementById('in-id').value;
    if(!amt || !txId) return alert("ပမာဏနှင့် လုပ်ငန်းစဉ်နံပါတ် ဖြည့်ပါ");
    
    // အရင်က Nang Nu ပေးထားတဲ့ နံပါတ်နဲ့ လုပ်ငန်းစဉ်ကို Admin ဆီ ပို့ခြင်း
    alert(`${amt} K သွင်းရန် တောင်းဆိုမှု (ID: ${txId}) အောင်မြင်ပါသည်။ အက်မင်မှ စစ်ဆေးနေပါသည်`);
}

async function submitOut() {
    const amt = document.getElementById('out-amt').value;
    const phone = document.getElementById('out-phone').value;
    if(!amt || !phone) return alert("ပမာဏနှင့် လက်ခံမည့်ဖုန်းနံပါတ် ဖြည့်ပါ");
    
    if(coins < amt) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ");
    alert(`${amt} K ကို ဖုန်းနံပါတ် ${phone} သို့ ထုတ်ယူရန် တောင်းဆိုမှု တင်ပြပြီးပါပြီ`);
}

// ၄။ အက်ပ် စတင်ခြင်း (Startup)
async function initApp() {
    if (!profileId) return;
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (data) {
        coins = data.coins;
        document.getElementById('user-display').innerText = data.username;
        document.getElementById('coin-display').innerText = coins.toLocaleString();
        startLiveTimer();
    }
}

function resetShanTable() {
    betted = false;
    ['d-cards', 'p1-cards', 'p2-cards', 'p3-cards', 'p4-cards', 'my-cards'].forEach(id => {
        document.getElementById(id).innerHTML = "";
    });
}

initApp();
