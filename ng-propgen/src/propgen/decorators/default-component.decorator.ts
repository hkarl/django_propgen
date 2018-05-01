export function DefaultComponent(component) {
  return function(constructor) {
    constructor.component = component;
  }
}
