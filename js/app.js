const board = document.querySelector('.board');
const newCardButton = document.querySelectorAll('.new-card-button');
const containers = document.querySelectorAll('.container');
let currentCard;
let currentList;

function updateLocalStorage() {
  const cardsUpdate = document.querySelectorAll('.card');
  const savedCardsUpdate = [];
  Array.from(cardsUpdate)
    .filter((card) => !card.classList.contains('preset'))
    .forEach((card) => {
      const saveCard = {
        container: card.parentElement.parentElement.className,
        cardText: card.textContent.replace('✖', ''),
      };
      savedCardsUpdate.push(saveCard);
    });
  localStorage.setItem('Cards', JSON.stringify(savedCardsUpdate));
}

// Появление крестика при наведении мыши и удаление карточки
function actionMouse(cardOnFocus) {
  cardOnFocus.addEventListener('mouseenter', (event) => {
    event.preventDefault();
    if (document.querySelector('.delete-card')) {
      document.querySelector('.delete-card').remove();
    }
    const cross = document.createElement('div');
    cross.className = 'delete-card';
    cross.innerHTML = '&#10006;';
    cardOnFocus.appendChild(cross);

    cross.addEventListener('click', (e) => {
      e.preventDefault();
      cardOnFocus.remove();
      updateLocalStorage();
    });
  });
  cardOnFocus.addEventListener('mouseleave', (ev) => {
    ev.preventDefault();
    if (ev.relatedTarget == null || !ev.relatedTarget.classList.contains('delete-card')) {
      document.querySelector('.delete-card').remove();
    }
  });
}

const savedCardsLoad = localStorage.getItem('Cards') ? JSON.parse(localStorage.getItem('Cards')) : [];
if (savedCardsLoad.length > 0) {
  Array.from(containers).forEach((container) => {
    const cards = savedCardsLoad.filter((card) => card.container === container.className);
    cards.forEach((card) => {
      const newCard = document.createElement('li');
      newCard.className = 'list-item card';
      newCard.textContent = card.cardText;
      container.querySelector('.list').appendChild(newCard);
    });
  });
}

const cards = document.querySelectorAll('.card');
Array.from(cards).forEach(actionMouse);

// Появление формы для создания новой карточки и скрытие этой формы
Array.from(newCardButton).forEach((clickedButton) => {
  clickedButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (document.querySelector('.new-card-form')) {
      document.querySelector('.new-card-form').remove();
    }

    const newCardForm = document.createElement('div');
    newCardForm.className = 'new-card-form';
    const textForm = document.createElement('textarea');
    textForm.className = 'text-form list-item';
    textForm.placeholder = 'Put text of your new card here';
    const addNewCardBtn = document.createElement('button');
    addNewCardBtn.className = 'add-new-card';
    addNewCardBtn.textContent = 'Add Card';
    const closeFormBtn = document.createElement('div');
    closeFormBtn.className = 'close-form';
    closeFormBtn.innerHTML = '&#10006;';
    clickedButton.parentElement.appendChild(newCardForm);
    newCardForm.appendChild(textForm);
    newCardForm.appendChild(addNewCardBtn);
    newCardForm.appendChild(closeFormBtn);

    closeFormBtn.addEventListener('click', (event) => {
      event.preventDefault();
      newCardForm.remove();
    });

    // Добавление новой карточки
    addNewCardBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const newCard = document.createElement('li');
      newCard.className = 'list-item card';
      newCard.textContent = textForm.value;
      newCardForm.parentElement.querySelector('.list').appendChild(newCard);
      const saveCard = {
        container: newCardForm.parentElement.className,
        cardText: textForm.value,
      };
      const savedCardsNew = localStorage.getItem('Cards') ? JSON.parse(localStorage.getItem('Cards')) : [];
      savedCardsNew.push(saveCard);
      localStorage.setItem('Cards', JSON.stringify(savedCardsNew));
      newCardForm.remove();
      actionMouse(newCard);
      drag(newCard);
    });
  });
});

function boardDrag(e, shiftX, shiftY) {
  if (!currentCard) return;
  currentCard.style.left = `${e.pageX - shiftX}px`;
  currentCard.style.top = `${e.pageY - shiftY}px`;
  const thisCard = e.target;
  const list = thisCard.parentElement;
  const cloneCard = currentCard.cloneNode(true);
  const invis = document.querySelector('.invisible');

  if (invis
    && (!Array.from(thisCard.parentElement.classList).some((el) => el.includes(currentList))
      || thisCard.parentElement === invis.parentElement)) {
    invis.remove();
  }
  cloneCard.classList.add('invisible');
  if (thisCard.classList.contains('card')) {
    cloneCard.classList.remove('dragged');
    list.insertBefore(cloneCard, thisCard);
    currentList = Array.from(cloneCard.parentElement.classList)
      .find((el) => el.includes('-list'))
      .replace('-list', '');
  } else if (thisCard.classList.contains('container')) {
    cloneCard.classList.remove('dragged');
    thisCard.querySelector('.list').appendChild(cloneCard);
    currentList = Array.from(cloneCard.parentElement.classList)
      .find((el) => el.includes('-list'))
      .replace('-list', '');
  }
}

function removeListeners() {
  // eslint-disable-next-line no-use-before-define
  board.removeEventListener('mousemove', boardDrag);
  Array.from(cards).forEach((card) => {
    // eslint-disable-next-line no-use-before-define
    card.removeEventListener('mouseup', cardDragEnd);
  });
}

function boardDragEnd() {
  if (!currentCard) return;
  currentCard.classList.remove('dragged');
  currentCard.style.left = null;
  currentCard.style.top = null;
  removeListeners();
  currentCard = undefined;
}

function cardDragEnd() {
  if (!currentCard) return;
  const invis = document.querySelector('.invisible');
  if (invis) {
    invis.parentElement.insertBefore(currentCard, invis);
    invis.remove();

    updateLocalStorage();
  }
  boardDragEnd();
}

function getCoords(elem) {
  const box = elem.getBoundingClientRect();
  return {
    top: box.top + window.pageYOffset,
    left: box.left + window.pageXOffset,
  };
}

function drag(cardGrabbed) {
  cardGrabbed.addEventListener('mousedown', (e) => {
    if (!e.target.classList.contains('delete-card')) {
      e.preventDefault();
      currentCard = e.target;
      const shiftX = e.pageX - getCoords(currentCard).left;
      const shiftY = e.pageY - getCoords(currentCard).top;
      currentCard.classList.add('dragged');
      board.addEventListener('mouseup', cardDragEnd);
      board.addEventListener('mousemove', (evnt) => {
        boardDrag(evnt, shiftX, shiftY);
      });
      boardDrag(e, shiftX, shiftY);
    }
  });
}

Array.from(cards).forEach(drag);
