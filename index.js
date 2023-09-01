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
  $main.$keypad.$clear = $(`<button class="keypad-btn" data-value="${Constants.CLEAR}"> <span class="bw-btn inverted-btn"> ${Constants.CLEAR_CODE} </span> </button>`);
  $main.$keypad.$enter = $(`<button class="keypad-btn" data-value="${Constants.ENTER}"> <span class="bw-btn inverted-btn"> ${Constants.ENTER_CODE} </span> </button>`);
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

  // Share button
  $footer.$shareBtn = $(`<button class="flex flex-middle flex-center bw-btn inverted-btn small-btn"> ${Constants.SHARE_CODE} </button>`)
  $footer.$shareBtn.on('click', handleShareClick);

  // Insert button
  $footer.$insertBtn = $(`<button class="flex flex-middle flex-center bw-btn inverted-btn small-btn"> ${Constants.INSERT_CODE} </button>`)
  $footer.$insertBtn.on('click', handleInsertClick);

  $footer.$tabPanel.append($footer.$leaderboardBtn);
  $footer.$tabPanel.append($footer.$revertBtn);
  $footer.$tabPanel.append($footer.$shareBtn);
  $footer.$tabPanel.append($footer.$insertBtn);
}

// END UI BUILDER

// BEGIN HANDLERS

function handleKeypadClick(event) {
  let $target = $(event.currentTarget);

  if(event.touches?.length) { // handle multiple touch events
    let touch = [];
    for(let t of event.touches) {
      if(t) touch.push(t);
    }
    touch = touch[touch.length - 1];
    $target = touch.target.tagName === 'SPAN' ? $(touch.target).parent() : $(touch.target);
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
      state.name = value.toUpperCase().substr(0,10);
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
    equations: state.equations,
    mobile: isMobile()
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

  console.log(isMobile());
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

function isMobile() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

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
    $main.$keypad.$enter.find('span').html(Constants.BACK_CODE);
    const isSuccess = state.currentQuestions >= Constants.TOTAL_QUESTIONS;
    $labels.forEach(l => l.toggleClass(Constants.STATUS_SUCCESS, isSuccess));
    $labels.forEach(l => l.toggleClass(Constants.STATUS_FAIL, !isSuccess));

    $footer.$shareBtn.prop('disabled', !isSuccess);
    $footer.$insertBtn.prop('disabled', !isSuccess);
  } else {
    $main.$keypad.$enter.find('span').html(Constants.ENTER_CODE);
    $labels.forEach(l => l.removeClass(Constants.STATUS_SUCCESS));
    $labels.forEach(l => l.removeClass(Constants.STATUS_FAIL));
  }

  // Refresh text
  $main.$timerLabels.text(state.time + 's');

  $main.$equationLabels.$m1.text(state.val0);
  $main.$equationLabels.$m2.text(state.val1);
  $main.$equationLabels.$m3.text(state.val2);
}