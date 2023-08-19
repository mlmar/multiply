'use strict';

$(document).ready(init);

const CLEAR_CODE = '&#10005;';
const ENTER_CODE = '&#10132;';

let state = {
  inProgress: false,
  min: 0,
  max: 9,
  
  val1: 0,
  val2: 0,
  val3: 0
}

let $main = null;

function init() {
  $main = $('#main');

  $main.$menuLabels = buildMenulabels();
  $main.append($main.$menuLabels);
  $main.$menuLabels.find('label').on('click', handleMenuLabelClick);

  $main.$outputLabels = buildOutputLabels();
  $main.append($main.$outputLabels);
  $main.$outputLabels.hide();

  $main.$keypad = buildKeypad();
  $main.$keypad.find('.keypad-btn').on('click', handleKeypadClick);
  $main.append($main.$keypad);
  
  $main.$start = $(`<button class="flex flex-middle bw-btn start-btn"> START </button>`);
  $main.$start.on('click', start);
  $main.append($main.$start);
}

/*** BEGIN UI ***/

// MIN MAX LABELS
function buildMenulabel(label, value) {
  return $(`
    <div class="flex flex-fill flex-middle flex-center float-span-text">
      <span> ${label.toUpperCase()} </span>
      <label class="flex flex-middle flex-center" data-state="${label}"> ${value} </label>
    </div>
  `);
}

function buildMenulabels() {
  const $container = $(`<section class="flex-col menu-labels"></section>`);
  let $minContainer = buildMenulabel('min', state.min);
  let $maxContainer = buildMenulabel('max', state.max);
  $container.$min = $minContainer.find('label');
  $container.$max = $maxContainer.find('label');
  $container.append($minContainer);
  $container.append($maxContainer);
  return $container;
}

function buildOutputLabels() {
  const $container = $(`<section class="flex flex-center output-labels"></section>`);
  $container.$m1 = $(`<label class="flex flex-middle"> </label>`);
  $container.$m2 = $(`<label class="flex flex-middle"> </label>`);
  $container.$m3 = $(`<label class="flex flex-middle" data-state="val3"> </label>`);

  $container.append($container.$m1)
  $container.append(`<span class="flex flex-middle"> ${CLEAR_CODE} </span>`)
  $container.append($container.$m2)
  $container.append(`<span class="flex flex-middle"> = </span>`)
  $container.append($container.$m3)
  return $container;
}

// KEYPAD BUTTONS
function buildKeypadRow(...numbers) {
  return $(`
    <section class="flex">
      ${numbers.map((n, i) => `<button class="bw-btn keypad-btn" data-value="${n}" data-index="${i}"> ${n} </button>`).join('\n')}
    </section>
  `);
}

function buildKeypad() {
  const $container = $(`<article class="flex-col flex-center flex-middle keypad"></article>`);
  $container.append(buildKeypadRow(7, 8, 9));
  $container.append(buildKeypadRow(4, 5, 6));
  $container.append(buildKeypadRow(1, 2, 3));
  $container.append(buildKeypadRow(CLEAR_CODE, 0, ENTER_CODE));
  return $container;
}

/*** END UI ***/


/*** BEGIN HANDLERS ***/

function handleMenuLabelClick(event) {
  $main.$focused = $(event.currentTarget);
  refreshDisplay();
}

function start() {
  state.inProgress = true;
  $main.$focused = $main.$outputLabels.$m3;
  refreshDisplay();
}

function end() {
  state.inProgress = false;
  $main.$focused = null;
  refreshDisplay();
}

function handleKeypadClick(event) {
  let $el = $main.$focused;
  if(!$el) {
    return;
  }

  let $target = $(event.target);
  let value = $target.data('value');
  let colIndex = $target.data('index');
  let num = parseInt(value);
  let prop = $el.data('state');

  if(isNaN(num)) {
    if(colIndex === 0) {
      state[prop] = 0;
    } else {
      
    }
  } else {
    let val = parseInt($el.text() + num);
    state[prop] = val;
  }

  refreshDisplay();
}

/*** END HANDLERS ***/

function refreshDisplay() {
  if(state.inProgress) {
    $main.$start.hide();
    $main.$menuLabels.hide();
    $main.$outputLabels.show();
  } else {
    $main.$start.show();
    $main.$menuLabels.show();
    $main.$outputLabels.hide();
  }

  if($main.$focused) {
    $main.find('.focused').removeClass('focused');
    $main.$focused.addClass('focused');
  }

  $main.$menuLabels.$min.text(state.min);
  $main.$menuLabels.$max.text(state.max);
  $main.$outputLabels.$m1.text(state.val1);
  $main.$outputLabels.$m2.text(state.val2);
  $main.$outputLabels.$m3.text(state.val3);
}