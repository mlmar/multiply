function buildKeypadRow(...numbers) {
  return $(`
    <section class="flex">
      ${numbers.map((n, i) => `<button class="bw-btn keypad-btn" data-value="${n}" data-index="${i}"> ${n} </button>`).join('\n')}
    </section>
  `);
}

export const buildKeypad = function(reverse) {
  const $container = $(`<article class="flex-col keypad" tabindex="0" autofocus></article>`);
  const rows = [
    buildKeypadRow(7, 8, 9),
    buildKeypadRow(4, 5, 6),
    buildKeypadRow(1, 2, 3)
  ];

  if(reverse) {
    rows.reverse();
  }

  rows.forEach(r => $container.append(r));
  $container.append(buildKeypadRow(0));
  return $container;
}