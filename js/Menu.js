// MIN MAX LABELS
function buildMenulabel(label, value, state) {
  return $(`
    <div class="flex-col flex-fill flex-middle flex-center">
      <label class="flex flex-middle flex-center" data-state="${state}"> ${value} </label>
      <span> ${label.toUpperCase()} </span>
    </div>
  `);
}

export const buildMenuLabels = function(min, max, totalQuestions) {
  const $container = $(`<section class="flex menu-labels"></section>`);
  let $minContainer = buildMenulabel('min', min, 'min');
  let $maxContainer = buildMenulabel('max', max, 'max');
  let $totalQuestionsContainer = buildMenulabel('#qs', totalQuestions, 'totalQuestions');
  $container.$min = $minContainer.find('label');
  $container.$max = $maxContainer.find('label');
  $container.$totalQuestions = $totalQuestionsContainer.find('label');
  $container.append($minContainer);
  $container.append($maxContainer);
  $container.append($totalQuestionsContainer);
  return $container;
}