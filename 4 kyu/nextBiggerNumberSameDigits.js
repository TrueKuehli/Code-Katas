function nextBigger(n){
  n = n.toString().split('');
  for (let i = n.length - 2; i >= 0; i--) {
    let currentDigit = n[i];

    let smallestNumberBiggerThanDigit = 'A';
    let smallestNumberBiggerThanDigitIndex = -1;

    for (let j = i + 1; j < n.length; j++) {
      if (n[j] > currentDigit && n[j] < smallestNumberBiggerThanDigit) {
        smallestNumberBiggerThanDigit = n[j];
        smallestNumberBiggerThanDigitIndex = j;
      }
    }

    if (smallestNumberBiggerThanDigit < 'A') {
      // Found swap that increases size, perform that one
      let tmp = n[i];
      n[i] = n[smallestNumberBiggerThanDigitIndex];
      n[smallestNumberBiggerThanDigitIndex] = tmp;

      // Sort following numbers by size to ensure smallest possible result
      let endDigits = n.splice(i+1)
      endDigits.sort();

      // Convert back to integer
      n = parseInt(n.join('').concat(endDigits.join('')));

      return n;
    }
  }

  return -1;
}

console.log(nextBigger(12),21)
console.log(nextBigger(513),531)
console.log(nextBigger(2017),2071)
console.log(nextBigger(414),441)
console.log(nextBigger(144),414)
console.log(nextBigger(111),-1)
