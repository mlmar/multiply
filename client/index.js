import Timer, { buildTimerLabels } from './js/modules/Timer.js';
import { buildEquationLabels, EquationGenerator } from './js/modules/Equation.js';
import { buildKeypad } from './js/modules/Keypad.js';
import { buildLeaderboard, buildLeaderboardInput } from './js/modules/Leaderboard.js';
import { shareText } from './js/modules/ShareUtil.js';
import { getScores, insertScore } from './js/service/ScoresService.js';

import Constants from './js/modules/Constants.js';

$(document).ready(init);
const state = {
  name: null,
  equations: [],
  time: Constants.ZERO_TIME,

  inProgress: false,
  currentQuestions: 0,
  
  val0: null,
  val1: null,
  val2: null,

  keypadReversed: false,
}

let timer = null;
let equationGenerator = null;

let $activePanel = null;
let $main = null;
let $panel0 = null;
let $panel1 = null;
let $footer = null;

// Initialzie UI and event handlers
function init() {
  loadSettingsFromLocalStorage();

  $main = $('main');
  $panel0 = $('#panel0');
  $panel1 = $('#panel1');
  $footer = $('footer');

  $activePanel = $main;

  timer = new Timer();
  equationGenerator = new EquationGenerator();

  // Header
  buildMainHeader();

  // Keypad
  buildMainKeypad(state.keypadReversed);

  // Build settings buttons
  buildTabPanel();

  refreshDisplay();
}

// BEGIN UI BUILDER
function buildMainHeader() {
  $main.$header = $(`<section class="flex flex-col flex-fill flex-middle header"></section>`);

  // Timer
  $main.$timerLabels = buildTimerLabels();
  $main.$header.append($main.$timerLabels);

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
  $main.$keypad.on('keydown', handleKeypadClick);
  $main.append($main.$keypad);
}


function buildTabPanel() {
  $footer.$tabPanel = $footer.find('section');

  // Settings button
  $footer.$leaderboardBtn = $(`<button class="flex flex-middle flex-center bw-btn inverted-btn small-btn"> ${Constants.TAB_CODE} </button>`)
  $footer.$leaderboardBtn.on('click', handleTabClick);
  
  // Reverse keypad button
  $footer.$revertBtn = $(`<button class="flex flex-middle flex-center bw-btn inverted-btn small-btn"> ${Constants.REVERSE_CODE} </button>`)
  $footer.$revertBtn.on('click', handleReverseClick);

  // Home button
  $footer.$homeBtn = $(`<button class="flex flex-middle flex-center bw-btn inverted-btn small-btn"> ${Constants.HOME_CODE} </button>`)
  $footer.$homeBtn.on('click', handleHomeClick);
  
  // Share button
  $footer.$shareBtn = $(`<button class="flex flex-middle flex-center bw-btn inverted-btn small-btn"> ${Constants.SHARE_CODE} </button>`)
  $footer.$shareBtn.on('click', handleShareClick);

  // Insert button
  $footer.$insertBtn = $(`<button class="flex flex-middle flex-center bw-btn inverted-btn small-btn"> ${Constants.INSERT_CODE} </button>`)
  $footer.$insertBtn.on('click', handleInsertClick);

  $footer.$tabPanel.append($footer.$leaderboardBtn);
  $footer.$tabPanel.append($footer.$revertBtn);
  $footer.$tabPanel.append($footer.$homeBtn);
  $footer.$tabPanel.append($footer.$shareBtn);
  $footer.$tabPanel.append($footer.$insertBtn);
}

// END UI BUILDER

// BEGIN HANDLERS

function handleKeypadClick(event) {
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
  let key = event.key?.toUpperCase();

  if(key) {
    value = key;
    num = parseInt(key);
  }

  pressValue(value, num);
  storeSettingsToLocalStorage();
}

function pressValue(value, num) {
  if(isNaN(num)) {
    if(state.inProgress) {
      if(value === Constants.CLEAR) {
        state.val2 = 0;
      } else if(value === Constants.BACKSPACE) {
        state.val2 = Math.floor(state.val2 / 10);
      } else if(value === Constants.ENTER) {
        verifyEquation();
      }
    } else if(value === Constants.ENTER) {
      start();
    }
  } else if(state.inProgress) {
    value = num;
    if($main.$focused === $main.$prevFocused) {
      value = (state.val2 || 0) + '' + value;
    }
    state.val2 = parseInt(value);
  }
  refreshDisplay();
}

async function handleTabClick() {
  if($activePanel === $panel0) {
    $activePanel = $main;
  } else {
    $activePanel = $panel0;
    $panel0.empty();
    $panel0.$leaderboard = buildLeaderboard();
    $panel0.$leaderboard.children().not(':first-child').remove();
    $panel0.$leaderboard.append('<h1 class="loading"></h1>');
    $panel0.append($panel0.$leaderboard);
    refreshDisplay();
    
    const result = await getScores();
    $panel0.empty();
    $panel0.$leaderboard = buildLeaderboard(result.data);
    $panel0.append($panel0.$leaderboard);
  }
  refreshDisplay();
}

function handleReverseClick() {
  state.keypadReversed = !state.keypadReversed;
  buildMainKeypad(state.keypadReversed);
}

function handleHomeClick() {
  $activePanel = $main;
  refreshDisplay();
}

function handleShareClick() {
  shareText(`Can you beat ${state.time} seconds?`);
}

function handleInsertClick() {
  if($activePanel === $panel1) {
    $activePanel = $main;
  } else {
    $panel1.empty();
    $panel1.$leaderboardInput = buildLeaderboardInput(state.name, state.time, state.equations);
    $panel1.append($panel1.$leaderboardInput);

    $panel1.$leaderboardInput.$name.on('input', function(event) {
      let value = event.target.value;
      state.name = value.toUpperCase().substr(0,5);
      $panel1.$leaderboardInput.$name.val(state.name);
      $panel1.$leaderboardInput.$okBtn.prop('disabled', !state.name);
      storeSettingsToLocalStorage();
    });

    $panel1.$leaderboardInput.$okBtn.on('click', handleLeaderboardInsertClick);
    $panel1.$leaderboardInput.$cancelBtn.on('click', handleInsertClick);

    $panel1.$leaderboardInput.$name.get(0).focus();
    $panel1.$leaderboardInput.$okBtn.prop('disabled', !state.name);

    $activePanel = $panel1;
  }
  refreshDisplay();
}

async function handleLeaderboardInsertClick() {
  $panel1.$leaderboardInput.$okBtn.text('');
  $panel1.$leaderboardInput.$okBtn.addClass('loading');
  $panel1.$leaderboardInput.$okBtn.off('click', handleLeaderboardInsertClick);
  $panel1.$leaderboardInput.$cancelBtn.hide();

  $footer.$insertBtn.hide();
  const result = await insertScore({
    name: state.name, 
    time: state.time,
    equations: state.equations
  });

  $panel1.$leaderboardInput.$name.val(result.data.record.name);
  $panel1.$leaderboardInput.$name.prop('disabled', true);
  $panel1.$leaderboardInput.$label.text(`Your time has been added to the leaderboard as ${result.data.record.name}.`);
  $panel1.$leaderboardInput.$okBtn.hide();
  $panel1.$leaderboardInput.$cancelBtn.text('Ok');
  $panel1.$leaderboardInput.$cancelBtn.addClass('inverted');
  $panel1.$leaderboardInput.$cancelBtn.show();
}

// BEGIN LOGIC

function start() {
  state.tabActive = false;

  if(state.inProgress) {
    state.time = Constants.ZERO_TIME;
    refreshDisplay();
  } else {
    state.inProgress = true;
    state.time = Constants.ZERO_TIME;
    state.currentQuestions = 0;
    equationGenerator.reset();
    generateRandomEquation();
    timer.start(update);
  }
}

function end() {
  state.inProgress = false;
  state.equations = equationGenerator.results();
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
    if(++state.currentQuestions < Constants.TOTAL_QUESTIONS) {
      generateRandomEquation();
    } else {
      state.inProgress = false;
    }
  } else {
    state.inProgress = false;
  }
}

function generateRandomEquation() {
  let [a,b] = equationGenerator.generate(Constants.MIN, Constants.MAX);
  state.val0 = a;
  state.val1 = b;
  state.val2 = null;
}

// END LOGIC

// BEGIN LOCAL STORAGE

function storeSettingsToLocalStorage() {
  let settings = {
    keypadReversed: state.keypadReversed,
    name: state.name
  };
  settings = JSON.stringify(settings);
  localStorage.setItem(Constants.MGH_MULTIPLY, settings);
}

function loadSettingsFromLocalStorage() {
  try {
    let settings = localStorage.getItem(Constants.MGH_MULTIPLY);
    if(settings) {
      settings = JSON.parse(settings);
      state.keypadReversed = settings.keypadReversed;
      state.name = settings.name;
    }
  } catch {
    localStorage.setItem(Constants.MGH_MULTIPLY, null);
  }

}

// END LOCAL STORAGE

// END HANDLERS

function refreshDisplay() {
  $activePanel.show();
  $activePanel.siblings(':not(footer)').hide();

  const isTimerStopped = !state.inProgress && state.time !== Constants.ZERO_TIME

  // enable sharing elements if timer stopped
  $footer.$shareBtn.prop('disabled', !isTimerStopped);
  $footer.$insertBtn.prop('disabled', !isTimerStopped);

  $footer.toggleClass(Constants.INVISIBLE, state.inProgress);

  let $labels = [
    $main.$timerLabels,
    $main.$equationLabels
  ];

  if(isTimerStopped) { // Change text and UI colors if user fails or succeeds
    $main.$keypad.$enter.html(Constants.BACK_CODE);
    const isSuccess = state.currentQuestions >= Constants.TOTAL_QUESTIONS;
    $labels.forEach(l => l.toggleClass(Constants.STATUS_SUCCESS, isSuccess));
    $labels.forEach(l => l.toggleClass(Constants.STATUS_FAIL, !isSuccess));

    $footer.$shareBtn.prop('disabled', !isSuccess);
    $footer.$insertBtn.prop('disabled', !isSuccess);
  } else {
    $main.$keypad.$enter.html(Constants.ENTER_CODE);
    $labels.forEach(l => l.removeClass(Constants.STATUS_SUCCESS));
    $labels.forEach(l => l.removeClass(Constants.STATUS_FAIL));
  }

  // Refresh text
  $main.$timerLabels.text(state.time + 's');

  $main.$equationLabels.$m1.text(state.val0);
  $main.$equationLabels.$m2.text(state.val1);
  $main.$equationLabels.$m3.text(state.val2);
}