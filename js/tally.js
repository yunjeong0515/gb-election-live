import { fetchStats } from "./api.js";

// ===== 설정 =====
const USE_API = window.__USE_API ?? true;
const POLL_INTERVAL = 3000;
const SIM_INTERVAL = 1500;

// ===== 날짜 =====
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const now = new Date();
document.getElementById("current-date").textContent =
  `${now.getMonth() + 1}월 ${now.getDate()}일 (${DAYS[now.getDay()]})`;

// ===== 상태 =====
let percentA = 50;
let percentB = 50;
let currentTextIndex = 0;
let prevIsLeading = false;

// ===== DOM =====
const progressA = document.querySelector(".progress-a");
const progressB = document.querySelector(".progress-b");
const spanA = progressA.querySelector("span");
const spanB = progressB.querySelector("span");

const charA = document.querySelector(".vote-a");
const charB = document.querySelector(".vote-b");

const leadA = charA.querySelector(".lead-icon");
const leadB = charB.querySelector(".lead-icon");

const textWinA = charA.querySelector(".winning-text");
const textWinB = charB.querySelector(".winning-text");

const defaultTextsA = charA.querySelectorAll(".default-text");
const defaultTextsB = charB.querySelectorAll(".default-text");

// ===== 유틸 =====
function showDefaultText(index) {
  defaultTextsA.forEach((el, i) => {
    el.classList.toggle("text-show", i === index);
  });
  defaultTextsB.forEach((el, i) => {
    el.classList.toggle("text-show", i === index);
  });
}

function hideAllDefaultText() {
  defaultTextsA.forEach((el) => el.classList.remove("text-show"));
  defaultTextsB.forEach((el) => el.classList.remove("text-show"));
}

// ===== 말풍선 순환 =====
function rotateDefaultText() {
  if (percentA >= 60 || percentB >= 60) return;

  showDefaultText(currentTextIndex);
  currentTextIndex = (currentTextIndex + 1) % defaultTextsA.length;
}

// ===== 메인 업데이트 =====
function updateVote() {
  // 바
  progressA.style.width = percentA / 2 + "%";
  progressB.style.width = percentB / 2 + "%";

  // 퍼센트
  spanA.style.display = percentA === 0 ? "none" : "inline";
  spanA.textContent = percentA + "%";

  spanB.style.display = percentB === 0 ? "none" : "inline";
  spanB.textContent = percentB + "%";

  // 캐릭터
  const imgADef = charA.querySelector(".character-img-default");
  const imgAWin = charA.querySelector(".character-img-winning");
  const imgALose = charA.querySelector(".character-img-losing");

  const imgBDef = charB.querySelector(".character-img-default");
  const imgBWin = charB.querySelector(".character-img-winning");
  const imgBLose = charB.querySelector(".character-img-losing");

  const isALeading = percentA >= 60 && percentA > percentB;
  const isBLeading = percentB >= 60 && percentB > percentA;
  const isLeading = isALeading || isBLeading;

  // ===== 상태 전환 감지 =====
  if (prevIsLeading && !isLeading) {
    currentTextIndex = 0;
    showDefaultText(0);
  }
  prevIsLeading = isLeading;

  // ===== 캐릭터 상태 =====
  if (isALeading) {
    imgADef.style.display = "none";
    imgAWin.style.display = "block";
    imgALose.style.display = "none";

    imgBDef.style.display = "none";
    imgBWin.style.display = "none";
    imgBLose.style.display = "block";
  } else if (isBLeading) {
    imgBDef.style.display = "none";
    imgBWin.style.display = "block";
    imgBLose.style.display = "none";

    imgADef.style.display = "none";
    imgAWin.style.display = "none";
    imgALose.style.display = "block";
  } else {
    imgADef.style.display = "block";
    imgAWin.style.display = "none";
    imgALose.style.display = "none";

    imgBDef.style.display = "block";
    imgBWin.style.display = "none";
    imgBLose.style.display = "none";
  }

  // ===== 유력 / 승리 텍스트 =====
  if (isALeading) {
    leadA.classList.add("active");
    textWinA.classList.add("text-show");

    leadB.classList.remove("active");
    textWinB.classList.remove("text-show");

    hideAllDefaultText();
  } else if (isBLeading) {
    leadB.classList.add("active");
    textWinB.classList.add("text-show");

    leadA.classList.remove("active");
    textWinA.classList.remove("text-show");

    hideAllDefaultText();
  } else {
    leadA.classList.remove("active");
    leadB.classList.remove("active");
    textWinA.classList.remove("text-show");
    textWinB.classList.remove("text-show");
  }
}

// ===== API 폴링 =====
let isPolling = false;

async function pollStats() {
  if (isPolling) return;
  isPolling = true;
  try {
    const stats = await fetchStats();

    if (stats.totalVotes === 0) {
      percentA = 50;
      percentB = 50;
    } else {
      percentA = Math.round(stats.jjisuni.percentage);
      percentB = 100 - percentA;
    }

    updateVote();
  } catch (err) {
    console.error("[tally] 폴링 에러:", err);
  } finally {
    isPolling = false;
  }
}

// ===== 랜덤 시뮬레이션 (데모/로컬 테스트용) =====
function simulateVoteChange() {
  const changeA = Math.floor(Math.random() * 21) - 10;
  percentA = Math.min(100, Math.max(0, percentA + changeA));
  percentB = 100 - percentA;

  updateVote();
}

// ===== 실행 =====
updateVote();
showDefaultText(0);

setInterval(rotateDefaultText, 2500);

if (USE_API) {
  pollStats();
  setInterval(pollStats, POLL_INTERVAL);
} else {
  setInterval(simulateVoteChange, SIM_INTERVAL);
}
