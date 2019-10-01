/**
 * Weekly Challenges, 2019 Week 39
 * https://www.codewars.com/kata/london-cityhacker
 */

function londonCityHacker(journey) {
  let lastWasBus = false;
  let totalcost = 0;
  for (let j of journey) {
    if (typeof j == 'number') {
      if (lastWasBus) {
        lastWasBus = false;
      } else {
        totalcost += 1.50;
        lastWasBus = true;
      }
    } else if (typeof j == 'string') {
      totalcost += 2.40;
      lastWasBus = false;
    }
  }

  return (new Intl.NumberFormat('en-GB', {style: 'currency',
      currency: 'GBP', minimumFractionDigits: 2})).format(totalcost);
}

console.log(londonCityHacker([12, 'Central', 'Circle', 21])); // "£7.80";
console.log(londonCityHacker(['Piccidilly', 56])); // "£3.90";
console.log(londonCityHacker(['Northern', 'Central', 'Circle'])); // "£7.20";
console.log(londonCityHacker(['Piccidilly', 56, 93, 243])); // "£5.40";
console.log(londonCityHacker([386, 56, 1, 876])); // "£3.00";
console.log(londonCityHacker([])); // "£0.00";
