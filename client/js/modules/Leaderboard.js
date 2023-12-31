import Constants from './Constants.js';

function buildScoreRow(data) {
  let { name, time, equations, rank, mobile } = data;
  const $container = $(`
    <article class="flex-col leaderboard-row">
      <span class="flex flex-space-between">
        <h1> ${rank}. ${name} ${mobile ? Constants.PHONE_CODE : ''} </h1>
        <h1> ${time}s </h1>
      </span>
    </article>
  `);
  $container.$equations = buildEquationsTable(equations);
  $container.append($container.$equations);
  return $container;
}

function buildEquationsTable(equations) {
  return $(`
    <div class="flex flex-space-between leaderboard-equations">
      ${equations.map(([a,b]) => (`
        <label class="flex flex-center"> ${a} ${Constants.MULTIPLY_CODE} ${b}</label>
      `)).join('\n')}
    </div>
  `)
}

export function buildLeaderboard(data) {
  const $container = $(`
    <section class="flex flex-col leaderboard">
      <h1> Leaderboard </h1>
    </section>
  `);
  if(data) {
    data.forEach(function(row, i) {
      const $row = buildScoreRow(row);
      $container['$row' + i] = $row;
      $container.append($row);
    });
  }

  return $container;
}

export function buildLeaderboardInput(name, time, equations, label) {
  const $container = $(`<section class="flex flex-col leaderboard-input"></section>`);
  $container.$name = $(`<input type="text" placeholder="Name" value="${name || ''}" tabindex="0"/>`);
  $container.$time = $(`<h1> ${time}s </h1>`);
  $container.$equations = buildEquationsTable(equations);
  $container.$label = $(`<h2> ${label || ''} </h2>`);
  $container.$okBtn = $(`<button class="flex flex-center flex-middle bw-btn inverted-btn" disabled> Post ${Constants.INSERT_CODE} </button>`);
  $container.$cancelBtn = $(`<button class="flex flex-center flex-middle bw-btn"> Cancel </button>`);
  $container.append($container.$name);
  $container.append($container.$time);
  $container.append($container.$equations);
  $container.append($container.$label);
  $container.append($container.$okBtn);
  $container.append($container.$cancelBtn);
  return $container;
}