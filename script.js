// ၁။ အရင်ဆုံး Nang Nu ရဲ့ Keys တွေကို ဒီမှာ အစားထိုးပါ
const SB_URL = "https://mgxhoraoblmrqvyjaiw.supabase.co"; 
const SB_KEY = "sb_publishable_WlgcdXqvZTr9MJeV6vAEYw_bMSsvD3J"; 

function login() {
    const user = document.getElementById('login-user').value;
    if(!user) return alert("အမည်ရိုက်ထည့်ပါ");
    localStorage.setItem('game_username', user);
    alert(user + " အကောင့်ဝင်ပြီးပါပြီ");
    // ဒီမှာ Supabase နဲ့ ချိတ်ပြီး User ရှိမရှိ စစ်တဲ့ Logic ဆက်ရေးလို့ရပါတယ်
}

// Design အတွက် လောလောဆယ် ဒီလောက်ပဲ ထည့်ထားပါဦး
console.log("Lion Burma Design Loaded!");
