const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const livesEl = document.getElementById("lives");
const bestEl = document.getElementById("best");
const roundEl = document.getElementById("round");
const timerEl = document.getElementById("timer");
const totalEl = document.getElementById("total");
const guessEl = document.getElementById("guess");
const statusEl = document.getElementById("status");
const messageEl = document.getElementById("message");
const rollBtn = document.getElementById("rollBtn");
const numberGrid = document.getElementById("numberGrid");
const historyList = document.getElementById("historyList");

let score = 0;
let streak = 0;
let lives = 3;
let best = Number(localStorage.getItem("diceArenaBest") || 0);
let round = 1;
let guess = null;
let timeLeft = 30;
let locked = false;
let history = [];

bestEl.textContent = best;

const facePips = {
  1:["p1"], 2:["p2","p3"], 3:["p2","p1","p3"],
  4:["p2","p4","p5","p3"], 5:["p2","p4","p1","p5","p3"],
  6:["p2","p4","p6","p7","p5","p3"]
};

function showDie(el, value){
  el.innerHTML = "";
  (facePips[value] || []).forEach(cls=>{
    const pip=document.createElement("span");
    pip.className=`pip ${cls}`;
    el.appendChild(pip);
  });
}

function buildNumbers(){
  for(let n=3;n<=18;n++){
    const btn=document.createElement("button");
    btn.className="num";
    btn.textContent=n;
    btn.addEventListener("click",()=>selectGuess(n));
    numberGrid.appendChild(btn);
  }
}
buildNumbers();

function selectGuess(n){
  if(locked) return;
  guess=n;
  guessEl.textContent=n;
  document.querySelectorAll(".num").forEach(b=>b.classList.toggle("selected",Number(b.textContent)===n));
  statusEl.textContent="Guess locked in — roll!";
}

function updateStats(){
  scoreEl.textContent=score;
  streakEl.textContent=streak;
  livesEl.textContent=lives;
  bestEl.textContent=best;
}

function addHistory(g,total,points,correct){
  history.unshift({round,guess:g,total,points,correct});
  history=history.slice(0,12);
  historyList.innerHTML=history.map(h=>`
    <div class="row">
      <span>#${h.round}</span>
      <span>${h.guess}</span>
      <span class="${h.correct?"win":"miss"}">${h.total} ${h.correct?"✓":"✕"}</span>
      <span>${h.points>0?"+":""}${h.points}</span>
    </div>`).join("");
}

function roll(){
  if(locked || guess===null) return;
  locked=true;
  rollBtn.disabled=true;
  statusEl.textContent="Rolling…";
  [1,2,3].forEach(i=>showDie(document.getElementById(`die${i}`),1));
  let ticks=0;
  const anim=setInterval(()=>{
    [1,2,3].forEach(i=>showDie(document.getElementById(`die${i}`),Math.floor(Math.random()*6)+1));
    if(++ticks>=8){
      clearInterval(anim);
      finishRoll();
    }
  },90);
}

function finishRoll(){
  const values=[1,2,3].map(i=>Math.floor(Math.random()*6)+1);
  values.forEach((v,i)=>{
    showDie(document.getElementById(`die${i+1}`),v);
    document.getElementById(`value${i+1}`).textContent=v;
  });
  const total=values.reduce((a,b)=>a+b,0);
  totalEl.textContent=total;

  const correct=total===guess;
  let points=0;
  if(correct){
    streak++;
    points=100;
    if(streak%2===0) points+=50; // fixed streak bonus, not a multiplier
    score+=points;
    if(score>best){
      best=score;
      localStorage.setItem("diceArenaBest",best);
    }
    statusEl.textContent="🎉 Correct guess!";
    messageEl.innerHTML=`<strong>Nice! +${points} points</strong><span>Streak: ${streak}. Keep guessing to beat your best score.</span>`;
  }else{
    streak=0;
    lives--;
    statusEl.textContent="❌ Not this time";
    messageEl.innerHTML=`<strong>The total was ${total}</strong><span>Your guess was ${guess}. One life used. No points were removed.</span>`;
  }

  addHistory(guess,total,points,correct);
  updateStats();

  setTimeout(()=>{
    if(lives<=0){
      endGame();
    }else{
      round++;
      roundEl.textContent=round;
      guess=null;
      guessEl.textContent="—";
      document.querySelectorAll(".num").forEach(b=>b.classList.remove("selected"));
      timeLeft=30;
      timerEl.textContent=timeLeft;
      locked=false;
      rollBtn.disabled=false;
      statusEl.textContent="Make your guess!";
    }
  },1100);
}

function endGame(){
  locked=true;
  rollBtn.disabled=true;
  statusEl.textContent="🏁 Game Over";
  messageEl.innerHTML=`<strong>Game over!</strong><span>Final score: ${score}. Press Reset Game to play again.</span>`;
}

function resetGame(){
  score=0; streak=0; lives=3; round=1; guess=null; timeLeft=30; locked=false;
  history=[];
  totalEl.textContent="—";
  guessEl.textContent="—";
  roundEl.textContent="1";
  timerEl.textContent="30";
  statusEl.textContent="Make your guess!";
  messageEl.innerHTML=`<strong>How scoring works</strong><span>Correct guess: +100 points. Every 2 consecutive correct guesses adds a fixed +50 streak bonus.</span>`;
  historyList.innerHTML="";
  document.querySelectorAll(".num").forEach(b=>b.classList.remove("selected"));
  [1,2,3].forEach(i=>{
    showDie(document.getElementById(`die${i}`),1);
    document.getElementById(`value${i}`).textContent="?";
  });
  rollBtn.disabled=false;
  updateStats();
}
document.getElementById("resetBtn").addEventListener("click",resetGame);
document.getElementById("clearHistory").addEventListener("click",()=>{history=[];historyList.innerHTML=""});
rollBtn.addEventListener("click",roll);

setInterval(()=>{
  if(locked) return;
  if(timeLeft>0){
    timeLeft--;
    timerEl.textContent=timeLeft;
  }
  if(timeLeft===0 && guess!==null){
    roll();
  }
},1000);

resetGame();
