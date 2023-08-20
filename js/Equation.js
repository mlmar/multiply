
export const buildEquationLabels = function() {
  const $container = $(`<section class="flex flex-center output-labels"></section>`);
  $container.$m1 = $(`<label class="flex flex-middle"> </label>`);
  $container.$m2 = $(`<label class="flex flex-middle"> </label>`);
  $container.$m3 = $(`<label class="flex flex-middle" data-state="val2"> </label>`);

  $container.append($container.$m1)
  $container.append(`<span class="flex flex-middle"> &#10005; </span>`)
  $container.append($container.$m2)
  $container.append(`<span class="flex flex-middle"> = </span>`)
  $container.append($container.$m3)
  return $container;
}

export const EquationGenerator = function() {
  let _equations = [];

  function random(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }
  
  this.generate = function(min, max) {
    let a = null;
    let b = null;
    let equation = null;
    do {
      a = random(min, max);
      b = random(min, max);
      equation = [a, b].sort().join(',');
    } while(_equations.includes(equation));

    _equations.push(equation);
    return [a, b];
  }

  this.reset = function() {
    _equations = [];
  }
}