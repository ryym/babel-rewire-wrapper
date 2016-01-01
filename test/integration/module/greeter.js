function greet() {
  return 'Hello';
}

export default {
  greet() { return greet() }
};
