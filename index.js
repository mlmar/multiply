import { buildMenuLabels } from './js/Menu.js';
import Timer, { buildTimerLabels } from './js/Timer.js';
import { buildEquationLabels } from './js/Equation.js';
import { buildKeypad } from './js/Keypad.js';
import { shareText } from './js/ShareUtil.js';

import Constants from './js/Constants.js';

$(document).ready(init);
const state = {
  inProgress: false,
  time: '0.00',
  currentQuestions: 0,
  totalQuestions: 5,

  min: 1,
  max: 9,
  
  val0: null,
  val1: null,
  val2: null,

  keypadReversed: false,
  settingsActive: false,
}

let timer = null;

let $main = null;
let $footer = null;

// Initialzie UI and event handlers
function init() {
  loadSettingsFromLocalStorage();

  $main = $('main');
  $footer = $('footer');

  // Header
  buildMainHeader();

  // Keypad
  buildMainKeypad(state.keypadReversed);

  // Build settings buttons
  buildSettingsPanel();

  refreshDisplay();
}

// BEGIN UI BUILDER
function buildMainHeader() {
  $main.$header = $(`<section class="flex flex-col flex-fill flex-middle header"></section>`);

  $main.$menuLabels = buildMenuLabels(state.min, state.max, state.totalQuestions);
  $main.$header.append($main.$menuLabels);
  $main.$menuLabels.children().on('click', handleMenuLabelClick);

  // Timer
  $main.$timerLabels = buildTimerLabels();
  $main.$header.append($main.$timerLabels);
  timer = new Timer();

  // Output
  $main.$equationLabels = buildEquationLabels();
  $main.$header.append($main.$equationLabels);

  $main.append($main.$header);
}

function buildMainKeypad(reverse) {
  if($main.$keypad) {
    $main.$keypad.remove();
  }

  $main.$keypad = buildKeypad(reverse);
  $main.$keypad.$clear = $(`<button class="bw-btn inverted-btn keypad-btn" data-value="${Constants.CLEAR}"> ${Constants.CLEAR_CODE} </button>`);
  $main.$keypad.$enter = $(`<button class="bw-btn inverted-btn keypad-btn" data-value="${Constants.ENTER}"> ${Constants.ENTER_CODE} </button>`);
  $main.$keypad.children().last().prepend($main.$keypad.$clear);
  $main.$keypad.children().last().append($main.$keypad.$enter);
  $main.$keypad.find('.keypad-btn').on('touchstart mouseup', handleKeypadClick);
  $main.$keypad.find('.keypad-btn').on('touchend', e => e.preventDefault());
  $(document).on('keydown', handleKeypadClick);
  $main.append($main.$keypad);
}


function buildSettingsPanel() {
  $footer.$settingsPanel = $footer.find('section');

  // Settings button
  $footer.$settingsButton = $(`<button class="flex flex-middle flex-center bw-btn inverted-btn small-btn"> ${Constants.SETTINGS_CODE} </button>`)
  $footer.$settingsButton.on('click', handleSettingsClick);
  
  // Reverse keypad button
  $footer.$reverseButton = $(`<button class="flex flex-middle flex-center bw-btn inverted-btn small-btn"> ${Constants.REVERSE_CODE} </button>`)
  $footer.$reverseButton.on('click', handleReverseClick);
  
  // Share button
  $footer.$shareBtn = $(`<button class="flex flex-middle flex-center bw-btn inverted-btn small-btn"> ${Constants.SHARE_CODE} </button>`)
  $footer.$shareBtn.on('click', handleShareClick);

  $footer.$settingsPanel.append($footer.$settingsButton);
  $footer.$settingsPanel.append($footer.$reverseButton);
  $footer.$settingsPanel.append($footer.$shareBtn);
}

// END UI BUILDER

// BEGIN HANDLERS

function handleMenuLabelClick(event) {
  setFocused($(event.currentTarget).find('label'));
  refreshDisplay();
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
  storeSettingsToLocalStorage();
}

function pressValue(value, num, prop) {
  if(isNaN(num)) {
    if(value === Constants.CLEAR) {
      state[prop] = 0;
      setFocused($main.$focused);
    } else if(value === Constants.BACKSPACE) {
      state[prop] = Math.floor(state[prop] / 10);
      setFocused($main.$focused);
    } else if(state.inProgress && value === Constants.ENTER) {
      verifyEquation();
    } else if(value === Constants.ENTER) {
      start();
    }
  } else {
    value = num;
    if($main.$focused === $main.$prevFocused) {
      value = (state[prop] || 0) + '' + value;
    }
    state[prop] = parseInt(value);
    setFocused($main.$focused);
  }
  refreshDisplay();
}

function handleSettingsClick() {
  state.settingsActive = !state.settingsActive;
  setFocused(null);
  refreshDisplay();
}

function handleReverseClick() {
  state.keypadReversed = !state.keypadReversed;
  buildMainKeypad(state.keypadReversed);
}

function handleShareClick() {
  shareText(`Can you beat ${state.time} seconds?`);
}

function setFocused($el) {
  $main.$prevFocused = $main.$focused;
  $main.$focused = $el;
}

// BEGIN LOGIC

function start() {
  state.settingsActive = false;

  if(state.inProgress) {
    state.time = '0.00';
    refreshDisplay();
  } else {
    state.inProgress = true;
    state.time = 0;
    state.currentQuestions = 0;
    setFocused($main.$equationLabels.$m3);
    generateRandomEquation();
    timer.start(update);
  }
}

function end() {
  state.inProgress = false;
  setFocused(null);
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

// END LOGIC

// BEGIN LOCAL STORAGE

function storeSettingsToLocalStorage() {
  let settings = {
    min: state.min,
    max: state.max,
    keypadReversed: state.keypadReversed
  };
  settings = JSON.stringify(settings);
  localStorage.setItem(Constants.MGH_MULTIPLY, settings);
}

function loadSettingsFromLocalStorage() {
  try {
    let settings = localStorage.getItem(Constants.MGH_MULTIPLY);
    if(settings) {
      settings = JSON.parse(settings);
      state.min = settings.min;
      state.max = settings.max;
      state.keypadReversed = settings.keypadReversed;
    }
  } catch {
    localStorage.setItem(Constants.MGH_MULTIPLY, null);
  }

}

// END LOCAL STORAGE

// END HANDLERS

function refreshDisplay() {
  if(state.settingsActive) {
    $main.$menuLabels.show();
    $main.$timerLabels.hide();
    $main.$equationLabels.hide();
  } else {
    $main.$menuLabels.hide();
    $main.$timerLabels.show();
    $main.$equationLabels.show();
  }

  if(state.inProgress) { // Hide extra elements if timer exists
    $main.$menuLabels.hide();
    $footer.$shareBtn.hide();
  }

  $footer.toggleClass(Constants.INVISIBLE, state.inProgress);

  let $labels = [
    $main.$timerLabels,
    $main.$equationLabels
  ];

  if(!state.inProgress && state.time !== '0.00') { // Change text and UI colors if user fails or succeeds
    $main.$keypad.$enter.html(Constants.BACK_CODE);
    let isSuccess = state.currentQuestions >= state.totalQuestions;
    $labels.forEach(l => l.toggleClass(Constants.STATUS_SUCCESS, isSuccess));
    $labels.forEach(l => l.toggleClass(Constants.STATUS_FAIL, !isSuccess));

    if(isSuccess) {
      $footer.$shareBtn.show();
    } else {
      $footer.$shareBtn.hide();
    }
  } else {
    $main.$keypad.$enter.html(Constants.ENTER_CODE);
    $labels.forEach(l => l.removeClass(Constants.STATUS_SUCCESS));
    $labels.forEach(l => l.removeClass(Constants.STATUS_FAIL));
  }

  $main.find('.' + Constants.FOCUSED).removeClass(Constants.FOCUSED);
  if($main.$focused) {
    $main.$focused.addClass(Constants.FOCUSED);
  }

  // Refresh text
  $main.$timerLabels.text(state.time + 's');
  $main.$menuLabels.$min.text(state.min);
  $main.$menuLabels.$max.text(state.max);
  $main.$menuLabels.$totalQuestions.text(state.totalQuestions);

  $main.$equationLabels.$m1.text(state.val0);
  $main.$equationLabels.$m2.text(state.val1);
  $main.$equationLabels.$m3.text(state.val2);
}