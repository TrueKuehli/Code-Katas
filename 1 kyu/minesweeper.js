// Framework
class Game {
  read(map) {
    // Split up into indvidual elements
    this.rows = map.split('\n');
    for (let i = 0; i < this.rows.length; i++) {
      this.rows[i] = this.rows[i].split(' ');
    }
  }
}

function open(y,x) {
  let numMines = game.rows[y][x];
  if (numMines === 'x') throw new Error('Mine hit!');
  return numMines;
}

let game = new Game();


// --------------------------
// Solution code

Array.prototype.flat = function() {
  return this.reduce((acc, val) => Array.isArray(val) ? acc.concat(val.flat()) : acc.concat(val), []);
}

class Sweeper {
  constructor(map, numMines) {
    this.fields = this.fromMapString(map);
    this.totalMines = numMines;
    this.foundMines = 0;
  }

  /**
   * @param {string} mapString
   */
  fromMapString(mapString) {
    let fields = [];
    let fieldsRaw = mapString.split('\n');
    for (let y = 0; y < fieldsRaw.length; y++) {
      fields[y] = [];
      const contentArray = fieldsRaw[y].split(' ');
      for (let x = 0; x < contentArray.length; x++) {
        const l = contentArray.length - 1;
        fields[y][x] = new MineField(x, y, contentArray[x]);

        // Add previous elements to neighbors of current element
        if (x > 0 && y > 0) fields[y][x].addNeighbor(fields[y-1][x-1]);
        if (         y > 0) fields[y][x].addNeighbor(fields[y-1][x  ]);
        if (x < l && y > 0) fields[y][x].addNeighbor(fields[y-1][x+1]);
        if (x > 0         ) fields[y][x].addNeighbor(fields[y  ][x-1]);

        // Add current element to neighbors of previous elements
        if (x > 0 && y > 0) fields[y-1][x-1].addNeighbor(fields[y][x]);
        if (         y > 0) fields[y-1][x  ].addNeighbor(fields[y][x]);
        if (x < l && y > 0) fields[y-1][x+1].addNeighbor(fields[y][x]);
        if (x > 0         ) fields[y  ][x-1].addNeighbor(fields[y][x]);
      }
    }

    return fields;
  }

  toMapString() {
    let mapString = '';
    for (let y = 0; y < this.fields.length; y++) {
      for (let x = 0; x < this.fields[y].length; x++) {
        mapString += this.fields[y][x].markedAs;
        if (x < this.fields[y].length - 1) mapString += ' ';
      }
      if (y < this.fields.length - 1) mapString += '\n';
    }

    return mapString;
  }

  getEdges() {
    let edges = []; // Array of individual edges

    for (let y = 0; y < this.fields.length; y++) {
      for (let x = 0; x < this.fields[y].length; x++) {
        const currentField = this.fields[y][x];
        if (currentField.markedAs == '?') {
          if (currentField.neighbors.every(field => field.markedAs == '?')) {
            continue; // Not an edge; it doesn't influence any known fields
          }
          if (edges.some(edge => edge.edgeUnkowns.includes(currentField))){
            continue; // Is already in an edge
          }
          let edge = new MineEdge(currentField);
          edge.jumpOneGap();
          edges.push(edge);
        }
      }
    }

    return edges;
  }

  solveLoop() {
    let someThingHappened = false;
    do {
      someThingHappened = false;
      // If all mines have been found, just open everything, then we're done
      if (this.uncoverIfAllMinesFound()) return this.toMapString();
      // Uncover all neighbors of fields labeled 0
      someThingHappened = someThingHappened || this.uncoverZeroNeighbors();
      // Mark all mines, if the number of unknown + known mines == their label
      someThingHappened = someThingHappened || this.markKnownMines();
      // Open all unknowns, that are neighbors of fields with a label that is
      //  equal to the number of known mines around them
      someThingHappened = someThingHappened || this.openKnownSafe();
      // If nothing happened this round AND the number
      if (!someThingHappened) {
        someThingHappened = this.tank();
      }
    } while (someThingHappened);

    // All methods of solving have failed. Retreat.
    return '?';
  }


  uncoverIfAllMinesFound() {
    if (this.foundMines == this.totalMines) {
      for (let y = 0; y < this.fields.length; y++) {
        for (let x = 0; x < this.fields[y].length; x++) {
          if (this.fields[y][x].markedAs == '?') {
            this.fields[y][x].open();
          }
        }
      }

      return true; // Done
    }

    return false; // Not done yet
  }

  uncoverZeroNeighbors() {
    let didSomething = false;

    for (let y = 0; y < this.fields.length; y++) {
      for (let x = 0; x < this.fields[y].length; x++) {
        if (this.fields[y][x].markedAs != '0') continue;
        for (let neighbor of this.fields[y][x].neighbors) {
          if (neighbor.markedAs == '?') {
            neighbor.open();
            didSomething = true;
          }
        }
      }
    }

    return didSomething;
  }

  markKnownMines() {
    let didSomething = false;
    for (let y = 0; y < this.fields.length; y++) {
      for (let x = 0; x < this.fields[y].length; x++) {
        const field = this.fields[y][x];
        const neighbors = field.neighbors;

        if (field == 'x') continue;
        if (field == '?') continue;
        if (field == '0') continue;

        const numQMark = neighbors.reduce((acc, n) => (n.markedAs == '?') ? acc + 1 : acc, 0);
        const numMines = neighbors.reduce((acc, n) => (n.markedAs == 'x') ? acc + 1 : acc, 0);

        // Are there unknowns left?
        if (numQMark == 0) continue;

        // Can we be sure, where the remaining mines are?
        if (field.markedAs != (numMines + numQMark).toString()) continue;

        for (let neighbor of neighbors) {
          if (neighbor.markedAs == '?') {
            neighbor.markedAs = 'x';
            this.foundMines++;
            didSomething = true;
          }
        }
      }
    }

    return didSomething;
  }

  openKnownSafe() {
    let didSomething = false;

    for (let y = 0; y < this.fields.length; y++) {
      for (let x = 0; x < this.fields[y].length; x++) {
        const field = this.fields[y][x];
        const neighbors = field.neighbors;
        if (field.markedAs == '?') continue;
        if (field.markedAs == 'x') continue;
        if (field.markedAs == '0') continue;

        const numQMark = neighbors.reduce((acc, n) => (n.markedAs == '?') ? acc + 1 : acc, 0);
        const numMines = neighbors.reduce((acc, n) => (n.markedAs == 'x') ? acc + 1 : acc, 0);

        // Are there unknowns left?
        if (numQMark == 0) continue;

        // Are there no undiscovered mines?
        if (field.markedAs != numMines) continue;

        for (let neighbor of neighbors) {
          if (neighbor.markedAs == '?') {
            neighbor.open();
            didSomething = true;
          }
        }
      }
    }

    return didSomething;
  }

  tank() {
    let didSomething = false;
    const edges = this.getEdges();
    const edgeNum = edges.length;
    // Edges MUST contain at least one mine, so the amount of
    //   mines, an edge can at most have is
    //   (totalMines - foundMines) - (edgeAmount - 1)
    let minesPerEdge = this.totalMines - this.foundMines - (edgeNum - 1);

    // var checkContained Check, wether all ?-blocks are contained in edges
    const numQTotal = this.fields.flat().reduce((acc, elt) => (elt.markedAs == '?') ? acc + 1 : acc, 0);
    const numQEdges = edges.reduce((acc, elt) => acc + elt.edgeUnkowns.length, 0);
    const edgesContainAll = numQTotal == numQEdges;

    let validTanks = [];

    for (let edge of edges) {
      let validated = [];
      // Loop through all getKMinusSubsets(arr=edge.unknowns, k=mineNum)
      for (let subset of getKMinusSubsets(edge.edgeUnkowns, minesPerEdge)) {
        // Set all unknowns to the subsets predictions
        for (let unknown of subset) {
          unknown.markedAs = 'x';
        }

        // Check, wether they lead to contradictions
        const valid = edge.validate();
        if (valid) validated.push(subset);

        // Unset all unknowns
        for (let unknown of subset) {
          unknown.markedAs = '?';
        }
      }

      // Is there more than one valid option?
      switch (validated.length) {
        case 0:
          throw new Error('No valid mine configurations found.');
        case 1:
          for (let unknown of validated[0]) {
            // Set them to their predicted output
            unknown.markedAs = 'x';
            // Add the amount of mines used
            this.foundMines++;
          }
          edge.openRemaining();
          // Recalculate mineNum
          // Disregarding the amount per edge here, since we don't know
          //   at what index we currently are
          minesPerEdge = this.totalMines - this.foundMines;
          // And set somethingHappened to true
          didSomething = true;
          break;
        default:
          // If multiple, save as Tank Object
          let edgeTanks = [];
          for (let tank of validated) edgeTanks.push(new Tank(tank));
          validTanks.push(edgeTanks);
      }

    }

    // If all mines were found we're done here
    if (this.foundMines == this.totalMines) return true;

    // If there are fields, that aren't mines in any of the potential solutions
    //   they can be safely opened up
    for (let i = 0; i < edges.length; i = 1) {
      validTanks || edges
      let edge = edges[i];
      let tanks = validTanks[i];

      let knownSafe = edge.edgeUnkowns.slice();


      for (let tank of tanks) {
        for (let mine of tank.markedMines) {
          let index = knownSafe.indexOf(mine);
          knownSafe[index] = null;
        }
      }

      for (let field of knownSafe) {
        if (field == null) continue;
        field.open();
        didSomething = true;
      }
    }

    // If something happened, try continuing normally
    if (didSomething) return true;

    // Can the next step potentially solve it?
    if (!edgesContainAll) return didSomething;

    // It looks like all other soultions have failed us. Try finding combinations,
    //   where the sum of all used mines equals the amount that is still left
    //   on the board
    let sumSolution = validateTankMineNumber(validTanks);
    if (sumSolution == -1) return didSomething; // There are multiple solutions

    // Only one solution was returned. Apply the solution
    for (tank of sumSolution) {
      for (let unknown of tank) {
        // Set them to their predicted output
        unknown.markedAs = 'x';
        // Add the amount of mines used
        this.foundMines++;
      }
    }

    return true;
  }
}

class MineField {
  /**
   * @param {number} x
   * @param {number} y
   * @param {string} markedAs
   */
  constructor(x, y, markedAs) {
    this.x = x;
    this.y = y;
    this.markedAs = markedAs;
    this.neighbors = [];
  }

  /**
   * @param {MineField} field
   */
  addNeighbor(field) {
    this.neighbors.push(field);
  }

  open() {
    this.markedAs = open(this.y, this.x);
  }
}

class MineEdge {
  /**
   * @param {MineField} startingPoint
   */
  constructor(startingPoint) {
    this.edgeUnkowns = [startingPoint];
    this.affectedFields = [];
    this.findConnectedUnknowns(startingPoint);
  }

  /**
   * @param {MineField} field
   */
  findConnectedUnknowns(field) {
    // Loop through all neighbors
    for (let neighbor of field.neighbors) {
      if (neighbor.markedAs == 'x') continue;
      // If unknown field
      if (neighbor.markedAs == '?') {
        // If not in this.edgeUnknowns
        if (this.edgeUnkowns.includes(neighbor)) continue;
        // Is it still an edge-field, or is it surrounded by ?/x
        if (neighbor.neighbors.every(
            n => n.markedAs == '?' || n.markedAs == 'x')) continue;
        // Add to this.edgeUnknowns
        this.edgeUnkowns.push(neighbor);
        // Call findConnectedUnknowns again
        this.findConnectedUnknowns(neighbor);
        continue;
      }

      // It's a known field
      if (this.affectedFields.includes(neighbor)) continue;
      this.affectedFields.push(neighbor);
    }
  }

  jumpOneGap() {
    // Loop throgh all this.affectedFields
    for (let affected of this.affectedFields) {
      // Loop through all the neighbors
      for (let neighbor of affected.neighbors) {
        // If Unknown
        if (neighbor.markedAs != '?') continue;
        // If not in edgeUnknowns
        if (this.edgeUnkowns.includes(neighbor)) continue;
        // Add to edgeUnknowns
        this.edgeUnkowns.push(neighbor);
        // Call findConnectedUnknowns
        this.findConnectedUnknowns(neighbor);
        // AffectedFields was altered, so restart via return and call again
        return this.jumpOneGap();
      }
    }
  }

  validate() {
    return this.affectedFields.every((field) => {
      return parseInt(field.markedAs) == field.neighbors.reduce((acc, n) => {
        return (n.markedAs == 'x') ? acc + 1 : acc;
      }, 0);
    });
  }

  openRemaining() {
    for (let field of this.edgeUnkowns) {
      if (field.markedAs == '?') field.open();
    }
  }
}

class Tank {
  constructor(subset) {
    this.markedMines = subset;
    this.minesAmount = subset.length;
  }
}

/**
 * Gets all k-Subsets as well as all k-n (n <= k) subsets
 * @param {Array} arr Array to create subsets from
 * @param {number} k Maximum lenght of subset
 * @param {number} startingIndex From what number to start in arr
 * @param {Array} currentSubset Current working subset (used for recursion)
 */
function* getKMinusSubsets(arr, k, startingIndex = 0, currentSubset = []) {
  if (k >= 1) {
    for (let i = startingIndex; i < arr.length; i++) {
      let newSubSet = currentSubset.concat([arr[i]]);

      yield* getKMinusSubsets(arr, k-1, i + 1, newSubSet);
    }
  }
  yield currentSubset;
}

/**
 * @param {Array} arr Array of tanks to add together
 */
function* addTanks(arr, _index=0, _sum=0, tanksUsed = []) {
  // Return if no more elements left
  if (_index >= arr.length) yield {'sum': _sum, 'tanks': tanksUsed};
  else {
    // Loop through all elements in current index
    for (let tank of arr[_index]) {
      // yield* addTanks index+1, sum+element
      yield* addTanks(arr, _index+1, _sum + tank.minesAmount,
          tanksUsed.concat([tank]));
    }
  }
}

/**
 *
 * @param {Array} arr Array of valid tanks
 * @param {number} mineNum Number of mines left on field
 */
function validateTankMineNumber(arr, mineNum) {
  let validMineConfigs = [];
  for (let tankCombination of addTanks(arr)) {
    if (tankCombination.sum == mineNum) validMineConfigs.push(tankCombination);
  }

  if (validMineConfigs.length == 1) return validMineConfigs[0];

  return -1; // There is more than one solution
}

function solveMine(map, n) {
  let mineSolve = new Sweeper(map, n);
  return mineSolve.solveLoop();
}

// let map =
// `? ? ? ? ? ?
// ? ? ? ? ? ?
// ? ? ? 0 ? ?
// ? ? ? ? ? ?
// ? ? ? ? ? ?
// 0 0 0 ? ? ?`;

// let result =
// `1 x 1 1 x 1
// 2 2 2 1 2 2
// 2 x 2 0 1 x
// 2 x 2 1 2 2
// 1 1 1 1 x 1
// 0 0 0 1 1 1`;

// game.read(result);
// console.log(solveMine(map,6), result);

// map=
// `0 ? ?
// 0 ? ?`;
// result=
// `0 1 x
// 0 1 1`;
// game.read(result);
// console.log(solveMine(map,1),"?");


// map=
// `0 ? ?
// 0 ? ?`;
// result=
// `0 2 x
// 0 2 x`;
// game.read(result);
// console.log(solveMine(map,2),result);


// map=
// `? ? ? ? 0 0 0
// ? ? ? ? 0 ? ?
// ? ? ? 0 0 ? ?
// ? ? ? 0 0 ? ?
// 0 ? ? ? 0 0 0
// 0 ? ? ? 0 0 0
// 0 ? ? ? 0 ? ?
// 0 0 0 0 0 ? ?
// 0 0 0 0 0 ? ?`;
// result=
// `1 x x 1 0 0 0
// 2 3 3 1 0 1 1
// 1 x 1 0 0 1 x
// 1 1 1 0 0 1 1
// 0 1 1 1 0 0 0
// 0 1 x 1 0 0 0
// 0 1 1 1 0 1 1
// 0 0 0 0 0 1 x
// 0 0 0 0 0 1 1`;
// game.read(result);
// console.log(solveMine(map,6), result);

// map = `? ? ? 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// ? ? ? 0 0 0 0 0 0 0 0 ? ? ? ? 0 0
// ? ? 0 0 0 ? ? ? 0 ? ? ? ? ? ? ? ?
// ? ? 0 0 ? ? ? ? 0 ? ? ? ? ? ? ? ?
// ? ? 0 0 ? ? ? ? 0 ? ? ? ? ? ? ? ?`;
// result = `1 x 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 1 1 1 0 0 0 0 0 0 0 0 1 2 2 1 0 0
// 1 1 0 0 0 1 1 1 0 1 1 2 x x 2 1 1
// x 1 0 0 1 2 x 1 0 1 x 2 3 3 3 x 1
// 1 1 0 0 1 x 2 1 0 1 1 1 1 x 2 1 1`;
// game.read(result);
// console.log(solveMine(map, 9), result);

map = `? ? 0 0 0 0 0 0 0
? ? ? ? ? 0 ? ? ?
? ? ? ? ? ? ? ? ?
? ? ? ? ? ? ? ? ?
? ? ? 0 0 ? ? ? 0`;
result = `x 1 0 0 0 0 0 0 0
1 1 1 1 1 0 1 1 1
1 1 2 x 1 1 2 x 1
1 x 2 1 1 1 x 2 1
1 1 1 0 0 1 1 1 0`;
game.read(result);
console.log(solveMine(map, 5), result);
