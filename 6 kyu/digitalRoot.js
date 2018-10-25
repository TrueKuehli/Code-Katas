function digital_root(n) {
  let nStr = n.toString();
  let sum = 0;
  for (let i = 0; i < nStr.length; i++) {
    sum += parseInt(nStr[i]);
  }

  if (sum.toString().length == 1) return sum;
  else return digital_root(sum);
}

console.log( digital_root(16), 7 )
console.log( digital_root(456), 6 )
