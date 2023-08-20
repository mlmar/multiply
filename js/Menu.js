// MIN MAX LABELS
function buildMenulabel(label, value) {
  return $(`
    <div class="flex-col flex-fill flex-middle flex-center">
      <label class="flex flex-middle flex-center" data-state="${label}"> ${value} </label>
      <span> ${label.toUpperCase()} </span>
    </div>
  `);
}

export const buildMenuLabels = function(min, max) {
  const $container = $(`<section class="flex menu-labels"></section>`);
  let $minContainer = buildMenulabel('min', min);
  let $maxContainer = buildMenulabel('max', max);
  $container.$min = $minContainer.find('label');
  $container.$max = $maxContainer.find('label');
  $container.append($minContainer);
  $container.append($maxContainer);
  return $container;
}