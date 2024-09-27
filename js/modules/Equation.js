import Constants from './Constants.js';

export const buildEquationLabels = function() {
  const $container = $(`<section class="flex flex-center output-labels"></section>`);
  $container.$m1 = $(`<label class="flex flex-middle"> </label>`);
  $container.$m2 = $(`<label class="flex flex-middle"> </label>`);
  $container.$m3 = $(`<label class="flex flex-middle" data-state="val2"> </label>`);

  $container.append($container.$m1)
  $container.append(`<span class="flex flex-middle"> ${Constants.MULTIPLY_CODE} </span>`)
  $container.append($container.$m2)
  $container.append(`<span class="flex flex-middle"> = </span>`)
  $container.append($container.$m3)
  return $container;
}

export const EquationGenerator = function() {
  let _equations = [];
  let _originalEquations = [];

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
    _originalEquations.push([a, b, a*b]);
    return [a, b];
  }

  this.results = function() {
    return _originalEquations;
  }

  this.reset = function() {
    _equations = [];
    _originalEquations = [];
  }
}