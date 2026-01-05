// Figure out how to make the generated deck save into local storage 

let deckId = ''
let player1Score = 0
let player2Score = 0
let deckReady = false
let player1Deck = []
let player2Deck = []
const warRevealDelay = 700

const dealButton = document.querySelector('#dealButton')
const resetButton = document.querySelector('#resetButton')
const player1Img = document.querySelector('#player1')
const player2Img = document.querySelector('#player2')
const tableArea = document.querySelector('.tableArea')
const player1ScoreEl = document.querySelector('#player1Score')
const player2ScoreEl = document.querySelector('#player2Score')
const resultEl = document.querySelector('#resultText')
const warContainer = document.querySelector('.warContainer')
const warBackSrc = 'https://deckofcardsapi.com/static/img/back.png'
const player1WarCards = [
  document.querySelector('#p1War1'),
  document.querySelector('#p1War2'),
  document.querySelector('#p1War3'),
  document.querySelector('#p1War4')
]
const player2WarCards = [
  document.querySelector('#p2War1'),
  document.querySelector('#p2War2'),
  document.querySelector('#p2War3'),
  document.querySelector('#p2War4')
]

setupGame()

dealButton.addEventListener('click', drawTwo)
resetButton.addEventListener('click', resetGame)

function setupGame(){
  deckReady = false
  fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
        .then(res => res.json()) // parse response as JSON
              .then(data => {
                console.log(data)
                deckId = data.deck_id
                return fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=52`)
              })
              .then(res => res.json())
              .then(data => {
                const halfDeck = data.cards.length / 2
                player1Deck = data.cards.slice(0, halfDeck)
                player2Deck = data.cards.slice(halfDeck)
                deckReady = true
              })
              .catch(err => {
                  console.log(`error ${err}`)
              });
}

async function drawTwo(){
  if (!deckReady){
    resultEl.innerText = 'Shuffling... try again in a second.'
    return
  }

  clearWarDisplay()

  if (player1Deck.length === 0 || player2Deck.length === 0){
    const winner = player1Deck.length === 0 ? 'Player 2' : 'Player 1'
    resultEl.innerText = `${winner} wins the game!`
    return
  }

  const player1Card = player1Deck.shift()
  const player2Card = player2Deck.shift()

  player1Img.src = player1Card.image
  player2Img.src = player2Card.image

  const player1Val = convertToNum(player1Card.value)
  const player2Val = convertToNum(player2Card.value)

  if (player1Val > player2Val){
    resultEl.innerText = 'Player 1 Wins That Hand!'
    player1Score++
  }
  else if (player1Val < player2Val){
    resultEl.innerText = 'Player 2 Wins That Hand!'
    player2Score++
  }
  else {
    resultEl.innerText = 'Time for War...'
    await handleWar()
  }

  updateScore()
}

function convertToNum(val){
  if(val === 'ACE'){
    return 14
  }
  else if(val === 'KING'){
    return 13
  }
  else if(val === 'QUEEN'){
    return 12
  }
  else if(val === 'JACK'){
    return 11
  }
  else{
    return Number(val)
  }
}

function updateScore(){
  player1ScoreEl.innerText = player1Score
  player2ScoreEl.innerText = player2Score
}

async function handleWar(){
  if (player1Deck.length < 4 && player2Deck.length < 4){
    resultEl.innerText = 'Both players are out of cards. Game over.'
    return
  }

  if (player1Deck.length < 4){
    resultEl.innerText = 'Player 1 cannot continue the war. Player 2 wins!'
    player2Score++
    updateScore()
    return
  }

  if (player2Deck.length < 4){
    resultEl.innerText = 'Player 2 cannot continue the war. Player 1 wins!'
    player1Score++
    updateScore()
    return
  }

  player1Deck.splice(0, 3)
  player2Deck.splice(0, 3)
  const player1WarUp = player1Deck.shift()
  const player2WarUp = player2Deck.shift()

  await showWarDisplay(player1WarUp, player2WarUp)

  const player1Val = convertToNum(player1WarUp.value)
  const player2Val = convertToNum(player2WarUp.value)

  if (player1Val > player2Val){
    resultEl.innerText = 'Player 1 wins the war!'
    player1Score++
  }
  else if (player1Val < player2Val){
    resultEl.innerText = 'Player 2 wins the war!'
    player2Score++
  }
  else{
    resultEl.innerText = 'War again!'
    return handleWar()
  }

  updateScore()
}

function showWarDisplay(p1Up, p2Up){
  warContainer.classList.add('show')

  player1WarCards[0].src = warBackSrc
  player1WarCards[1].src = warBackSrc
  player1WarCards[2].src = warBackSrc
  player1WarCards[3].src = warBackSrc

  player2WarCards[0].src = warBackSrc
  player2WarCards[1].src = warBackSrc
  player2WarCards[2].src = warBackSrc
  player2WarCards[3].src = warBackSrc

  player1WarCards[3].classList.add('flipping')
  player2WarCards[3].classList.add('flipping')

  return new Promise(resolve => {
    setTimeout(() => {
      player1WarCards[3].src = p1Up.image
      player2WarCards[3].src = p2Up.image
      player1WarCards[3].classList.remove('flipping')
      player2WarCards[3].classList.remove('flipping')
      resolve()
    }, warRevealDelay)
  })
}

function clearWarDisplay(){
  warContainer.classList.remove('show')
  player1WarCards.forEach(card => {
    card.src = ''
    card.classList.remove('flipping')
  })
  player2WarCards.forEach(card => {
    card.src = ''
    card.classList.remove('flipping')
  })
}

function resetGame(){
  tableArea.classList.add('resetting')

  player1Score = 0
  player2Score = 0
  player1Deck = []
  player2Deck = []
  deckReady = false

  resultEl.innerText = 'Result'
  player1Img.src = warBackSrc
  player2Img.src = warBackSrc
  clearWarDisplay()
  updateScore()
  setupGame()

  setTimeout(() => {
    tableArea.classList.remove('resetting')
  }, 350)
}
