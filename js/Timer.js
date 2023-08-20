function Timer() {
  let _time = null;
  let _animationFrame = null;
  let _callbackFunc = null

  this.start = function(callbackFunc) {
    _time = performance.now();
    _callbackFunc = callbackFunc;
    _animationFrame = requestAnimationFrame(timerLoop);
  }

  function timerLoop() {
    let elapsed = ((performance.now() - _time) / 1000).toString();
    elapsed = elapsed.substring(0, elapsed.indexOf('.') + 3);
    _callbackFunc(elapsed);
    requestAnimationFrame(timerLoop);
  }

  this.stop = function() {
    _time = null;
    cancelAnimationFrame(_animationFrame);
  }
}

export const buildTimerLabels = function() {
  const $container = $(`<label class="flex flex-center flex-middle timer-labels"> 00:00:00 </label>`);
  return $container;
}

export default Timer;