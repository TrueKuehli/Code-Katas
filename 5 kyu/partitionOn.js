function partitionOn(pred, items) {
  let partFalse = [];
  let partTrue = [];
  for (let i of items) {
    if (pred(i)) {
      partTrue.push(i);
    } else {
      partFalse.push(i);
    }
  }

  let j = 0;
  for (let i of partFalse.concat(partTrue)) {
    items[j++] = i;
  }

  return partFalse.length;
}

let items = [1, 2, 3, 4, 5, 6];
function isEven(n) {
  return n % 2 == 0;
}

let i = partitionOn(isEven, items);
console.log(i, 3);
console.log(items.slice(0, i), [1, 3, 5]);
console.log(items.slice(i), [2, 4, 6]);
