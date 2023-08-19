'use strict';

$(document).ready(init);

function init() {
  const $main = $('#main');
  $main.$inputs = buildInputs();
  $main.append($main.$inputs);
  $main.$keypad = buildKeypad();
  $main.append($main.$keypad);
}

/** MIN MAX INPUTS **/
function buildInput(label, value) {
  return $(`
    <div class="flex flex-space-between">
      <label> ${label} </label>
      <input class="text-center" type="number" value="${value}"/>
    </div>
  `);
}

function buildInputs() {
  const $container = $(`<section class="flex-col"></section>`);
  $container.$min = buildInput('MIN', 0);
  $container.$max = buildInput('MAX', 9)
  $container.$start = $(`<button> START </button>`)
  $container.append($container.$min);
  $container.append($container.$max);
  $container.append($container.$start);
  return $container;
}

/** KEYPAD BUTTONS**/
function buildKeyPadRow(numbers) {
  return $(`
    <div class="flex">
      ${numbers.map(n => `<button data-value="${n}"> ${n} </button>`).join('\n')}
    </div>
  `);
}

function buildKeypad() {
  const $container = $(`<section class="flex-col flex-center flex-middle"></section>`);
  $container.append(buildKeyPadRow([7,8,9]));
  $container.append(buildKeyPadRow([4,5,6]));
  $container.append(buildKeyPadRow([1,2,3]));
  $container.append(buildKeyPadRow([0]));
  return $container;
}