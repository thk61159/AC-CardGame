// 放在文件最上方
// let restart; 
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
};
const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];
const view = {
  //生成卡片內容，翻面時才需要顯示故在flipCard觸發時呼叫
  getCardContaint(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `<p>${number}</p>
        <img
          src=${symbol}
          >
        <p>${number}</p>`;
  },
  //生成單張卡片
  getCardElement(index) {
    return `<div data-index = ${index} class="card back">
      </div>`;
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },
  //生成52張卡片
  displayCards() {
    const rootElement = document.querySelector("#cards");
    //呼叫生成亂數array，並填入卡片
    rootElement.innerHTML = utility
      .getRandomNumberArray(52)
      .map((index) => this.getCardElement(index))
      .join("");
  },
  //點擊翻牌效果
  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContaint(Number(card.dataset.index));
        return;
      }
      card.classList.add("back");
      card.innerHTML = null;
    });
  },
  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },
  rendersScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener(
        "animationend",
        (event) => event.target.classList.remove("wrong"),
        { once: true }
        //once: true減輕運行負擔
      );
    });
  },
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `;
    // <button class="restart">restart</button>;
    // restart = document.querySelector(".restart");
    const header = document.querySelector("#header");
    header.before(div);
    // console.log(restart);
  },

  /*未優化版
  flipCard(card) {
    //如果點擊時為背面
    if (card.classList.contains("back")) {
      card.classList.remove("back");
      card.innerHTML = this.getCardContaint(Number(card.dataset.index));
      return;
    }
    //如果點擊時為正面
    card.classList.add("back");
    card.innerHTML = null;
  },
  pairCard(card) {
    card.classList.add("paired");
  },*/
};
//生成亂數array
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};
const controller = {
  //宣告原始狀態，等待第一張牌翻開
  currentState: GAME_STATE.FirstCardAwaits,
  //由controller控制畫面狀態，因此將卡片生成與否寫在此
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },
  dispatchCardAction(card) {
    if (!card.classList.contains("back")) return;
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;
      case GAME_STATE.SecondCardAwaits:
        //
        view.flipCards(card);
        model.revealedCards.push(card);
        view.renderTriedTimes(++model.triedTimes);

        if (model.isRevealedCardsMatched()) {
          view.rendersScore((model.score += 10));
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealedCards);
          model.revealedCards = [];
          if (model.score === 260) {
            console.log("showGameFinished");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished(); // 加在這裡
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          //setTimeout(傳入fuction而非呼叫, 時間)
          setTimeout(this.restCards, 1000);
        }
        break;
    }
    console.log(this.currentState);
    console.log(model.revealedCards);
  },
  restCards() {
    view.flipCards(...model.revealedCards);
    //注意setTimeout呼叫會使作用域改變故要用controller.currentState
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
  restart() {
    this.currentState = GAME_STATE.FirstCardAwaits;
    model.revealedCards = [];
    model.score = 0
    model.triedTimes = 0;
    this.generateCards();
    
  },
};
const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },
  score: 0,
  triedTimes: 0,
};
//由controller控制畫面狀態
controller.generateCards();

//document.querySelectorAll(".card")資料結構為nodelist並非標準arr
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    console.log(card);
    controller.dispatchCardAction(card);
  });
});

// restart.addEventListener("click", (event) => {
//   controller.restart();
//   console.log(controller.currentState);
// });
