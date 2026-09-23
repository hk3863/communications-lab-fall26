const foods = document.querySelectorAll('.game-food');
const eatZone = document.getElementById('eat-zone');
const trashZone = document.getElementById('trash-zone');
const message = document.getElementById('game-message');
const resetButton = document.getElementById('reset-button');
let selectedFood = null;
let eaten = 0;
let trashed = 0;

function selectFood(food) {
    foods.forEach(function (item) {
        item.setAttribute('aria-pressed', 'false');
    });
    selectedFood = food;
    food.setAttribute('aria-pressed', 'true');
    message.textContent = food.dataset.name + ': where am I going?';
}

function moveFood(destination) {
    if (selectedFood === null || selectedFood.hidden) {
        message.textContent = eaten + trashed === foods.length ? 'The plate is empty. Start again?' : 'Pick a food first!';
        return;
    }

    const name = selectedFood.dataset.name;
    selectedFood.hidden = true;
    selectedFood.classList.remove('dragging');
    selectedFood.setAttribute('aria-pressed', 'false');
    selectedFood = null;

    if (destination === 'eat') {
        eaten = eaten + 1;
        message.textContent = name + ': yum! Thanks for eating me.';
    } else {
        trashed = trashed + 1;
        message.textContent = name + ': oh no, the bin!';
    }

    document.getElementById('eaten-count').textContent = eaten;
    document.getElementById('trashed-count').textContent = trashed;

    if (eaten + trashed === foods.length) {
        document.getElementById('empty-plate').hidden = false;
        if (trashed === 0) {
            message.textContent = 'All eaten! None of us went to waste.';
        } else if (eaten === 0) {
            message.textContent = 'We all ended up in the bin. Next time, take a little less.';
        } else {
            message.textContent = eaten + ' eaten, ' + trashed + ' wasted. Next time, take only what you can finish.';
        }
        resetButton.focus();
    } else {
        // I move focus to the next food so keyboard users can keep playing.
        for (const food of foods) {
            if (!food.hidden) {
                food.focus();
                break;
            }
        }
    }
}

foods.forEach(function (food) {
    food.addEventListener('click', function () {
        selectFood(food);
    });

    food.addEventListener('dragstart', function (event) {
        selectFood(food);
        food.classList.add('dragging');
        // I pass the food's ID to the drop area so it knows what I am dragging.
        event.dataTransfer.setData('text/plain', food.id);
        event.dataTransfer.effectAllowed = 'move';
    });

    food.addEventListener('dragend', function () {
        food.classList.remove('dragging');
        eatZone.classList.remove('drag-over');
        trashZone.classList.remove('drag-over');
    });
});

function setupDropZone(zone, destination) {
    zone.addEventListener('click', function () {
        moveFood(destination);
    });

    zone.addEventListener('dragover', function (event) {
        if (selectedFood === null || !selectedFood.classList.contains('dragging')) return;
        // I prevent the browser's default action to allow a drop here.
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', function () {
        zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', function (event) {
        event.preventDefault();
        zone.classList.remove('drag-over');
        if (selectedFood !== null && selectedFood.classList.contains('dragging') && event.dataTransfer.getData('text/plain') === selectedFood.id) {
            moveFood(destination);
        }
    });
}

setupDropZone(eatZone, 'eat');
setupDropZone(trashZone, 'trash');

resetButton.addEventListener('click', function () {
    eaten = 0;
    trashed = 0;
    selectedFood = null;
    foods.forEach(function (food) {
        food.hidden = false;
        food.classList.remove('dragging');
        food.setAttribute('aria-pressed', 'false');
    });
    eatZone.classList.remove('drag-over');
    trashZone.classList.remove('drag-over');
    document.getElementById('eaten-count').textContent = 0;
    document.getElementById('trashed-count').textContent = 0;
    document.getElementById('empty-plate').hidden = true;
    message.textContent = 'Hey! Pick me up.';
    foods[0].focus();
});
