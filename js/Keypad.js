function buildKeypadRow(...numbers) {
  return $(`
    <section class="flex">
      ${numbers.map((n, i) => `<button class="bw-btn keypad-btn" data-value="${n}" data-index="${i}"> ${n} </button>`).join('\n')}
    </section>
  `);
}

export const buildKeypad = function() {
  const $container = $(`<article class="flex-col flex-center flex-middle keypad"></article>`);
  $container.append(buildKeypadRow(7, 8, 9));
  $container.append(buildKeypadRow(4, 5, 6));
  $container.append(buildKeypadRow(1, 2, 3));
  $container.append(buildKeypadRow(0));
  return $container;
}