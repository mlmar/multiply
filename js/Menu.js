// MIN MAX LABELS
function buildMenulabel(label, value) {
  return $(`
    <div class="flex flex-fill flex-middle flex-center float-span-text">
      <span> ${label.toUpperCase()} </span>
      <label class="flex flex-middle flex-center" data-state="${label}"> ${value} </label>
    </div>
  `);
}

export const buildMenuLabels = function(min, max) {
  const $container = $(`<section class="flex-col menu-labels"></section>`);
  let $minContainer = buildMenulabel('min', min);
  let $maxContainer = buildMenulabel('max', max);
  $container.$min = $minContainer.find('label');
  $container.$max = $maxContainer.find('label');
  $container.append($minContainer);
  $container.append($maxContainer);
  return $container;
}