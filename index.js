import { buildMenuLabels } from './js/Menu.js';
import Timer, { buildTimerLabels } from './js/Timer.js';
import { buildOutputLabels } from './js/Output.js';
import { buildKeypad } from './js/Keypad.js';
import { shareText } from './js/ShareUtil.js';

import Constants from './js/Constants.js';

$(document).ready(init);
let state = {
  inProgress: false,
  time: 0,
  currentQuestions: 0,
  totalQuestions: 5,

  min: 1,
  max: 9,
  
  val0: 0,
  val1: 0,
  val2: 0,
}

let timer = null;
let $main = null;
let $footer = null;

// Initialzie UI and event handlers
function init() {
  $main = $('main');
  $footer = $('footer');

  // Menu
  $main.$menuLabels = buildMenuLabels(state.min, state.max);
  $main.append($main.$menuLabels);
  $main.$menuLabels.find('label').on('click', handleMenuLabelClick);

  // Timer
  $main.$timerLabels = buildTimerLabels();
  $main.append($main.$timerLabels);
  $main.$timerLabels.hide();
  timer = new Timer();

  // Output
  $main.$outputLabels = buildOutputLabels();
  $main.append($main.$outputLabels);
  $main.$outputLabels.hide();

  // Keypad
  $main.$keypad = buildKeypad();
  $main.$keypad.$clear = $(`<button class="bw-btn inverted keypad-btn" data-value="${Constants.CLEAR}"> ${Constants.CLEAR_CODE} </button>`);
  $main.$keypad.$enter = $(`<button class="bw-btn inverted keypad-btn" data-value="${Constants.ENTER}"> ${Constants.ENTER_CODE} </button>`);
  $main.$keypad.children().last().prepend($main.$keypad.$clear);
  $main.$keypad.children().last().append($main.$keypad.$enter);
  $main.$keypad.find('.keypad-btn').on('touchstart mouseup', handleKeypadClick);
  $main.$keypad.find('.keypad-btn').on('touchend', e => e.preventDefault());
  $(document).on('keydown', handleKeypadClick);
  $main.append($main.$keypad);

  // Share button
  $main.$shareBtn = $(`<button class="flex flex-middle flex-center bw-btn inverted share-btn"> ${Constants.SHARE_CODE} </button>`)
  $main.append($main.$shareBtn);
  $main.$shareBtn.on('click', handleShareClick);
  $main.$shareBtn.addClass(Constants.INVISIBLE);
}

/*** BEGIN HANDLERS ***/

function handleMenuLabelClick(event) {
  $main.$focused = $(event.currentTarget);
  refreshDisplay();
  state[$main.$focused.data('state')] = 0;
}

function handleKeypadClick(event) {
  let $el = $main.$focused;

  let $target = $(event.target);

  if(event.touches?.length) { // handle multiple touch events
    let touch = [];
    for(let t of event.touches) {
      if(t) touch.push(t);
    }
    touch = touch[touch.length - 1];
    $target = $(touch.target)
  }

  let value = $target?.data('value');
  let num = parseInt(value);
  let prop = $el?.data('state');
  let key = event.key?.toUpperCase();

  if(key) {
    value = key;
    num = parseInt(key);
  }

  pressValue(value, num, prop);
}

function pressValue(value, num, prop) {
  if(isNaN(num)) {
    if(value === Constants.CLEAR) {
      state[prop] = 0;
    } else if(value === Constants.BACKSPACE) {
      state[prop] = Math.floor(state[prop] / 10);
    } else if(state.inProgress && value === Constants.ENTER) {
      verifyEquation();
    } else if(value === Constants.ENTER) {
      start();
    }
  } else {
    value = (state[prop] || 0) + '' + num;
    state[prop] = parseInt(value);
  }
  refreshDisplay();
}

function handleShareClick() {
  shareText(`Can you beat ${state.time} seconds?`);
}

/** BEGIN LOGIC ***/

function start() {
  if(state.time) {
    state.time = 0;
    refreshDisplay();
  } else {
    state.inProgress = true;
    state.time = 0;
    state.currentQuestions = 0;
    state.min = parseInt($main.$menuLabels.$min.text());
    state.max = parseInt($main.$menuLabels.$max.text());
    $main.$focused = $main.$outputLabels.$m3;
    generateRandomEquation();
    timer.start(update);
  }
}

function end() {
  state.inProgress = false;
  $main.$focused = null;
  timer.stop();
}

function update(time) {
  if(state.inProgress) {
    state.time = time;
    refreshDisplay();
  } else {
    end();
  }
}

function verifyEquation() {
  if(state.val0 * state.val1 === state.val2) {
    if(++state.currentQuestions < state.totalQuestions) {
      generateRandomEquation();
    } else {
      state.inProgress = false;
    }
  } else {
    state.inProgress = false;
  }
}

function generateRandomEquation() {
  state.val0 = random(state.min, state.max);
  state.val1 = random(state.min, state.max);
  state.val2 = null;
}

function random(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

/*** END LOGIC ***/

/*** END HANDLERS ***/

function refreshDisplay() {
  if(state.time) { // Hide menu if timer exists
    $main.$menuLabels.hide();
    $main.$timerLabels.show();
    $main.$outputLabels.show();
    $main.$shareBtn.addClass(Constants.INVISIBLE);
  } else {
    $main.$menuLabels.show();
    $main.$timerLabels.hide();
    $main.$outputLabels.hide();
  }
  
  $footer.toggleClass(Constants.INVISIBLE, state.inProgress);

  let $labels = [
    $main.$timerLabels,
    $main.$outputLabels
  ];

  if(!state.inProgress && state.time) { // Change text and UI colors if user fails or succeeds
    $main.$keypad.$enter.html(Constants.BACK_CODE);
    let isSuccess = state.currentQuestions >= state.totalQuestions;
    $labels.forEach(l => l.toggleClass(Constants.STATUS_SUCCESS, isSuccess));
    $labels.forEach(l => l.toggleClass(Constants.STATUS_FAIL, !isSuccess));
    $main.$shareBtn.toggleClass(Constants.INVISIBLE, !isSuccess);
  } else {
    $main.$keypad.$enter.html(Constants.ENTER_CODE);
    $labels.forEach(l => l.removeClass(Constants.STATUS_SUCCESS));
    $labels.forEach(l => l.removeClass(Constants.STATUS_FAIL));
  }

  if($main.$focused) {
    $main.find('.' + Constants.FOCUSED).removeClass(Constants.FOCUSED);
    $main.$focused.addClass(Constants.FOCUSED);
  }

  // Refresh text
  $main.$timerLabels.text(state.time + 's');
  $main.$menuLabels.$min.text(state.min);
  $main.$menuLabels.$max.text(state.max);
  $main.$outputLabels.$m1.text(state.val0);
  $main.$outputLabels.$m2.text(state.val1);
  $main.$outputLabels.$m3.text(state.val2);
}