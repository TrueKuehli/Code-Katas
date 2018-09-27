function even_or_odd(number) {
  return number & 1 ? 'Odd' : 'Even';
}

console.log(even_or_odd(2), "Even")
console.log(even_or_odd(0), "Even")
console.log(even_or_odd(7), "Odd")
console.log(even_or_odd(1), "Odd")
