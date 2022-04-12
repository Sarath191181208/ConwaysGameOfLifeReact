const { useState, useCallback, useRef } = React;
const { createRoot } = ReactDOM;

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

const boxSize = 20;
const { width, height } = getWindowDimensions();
const numRows = parseInt(height / (boxSize + 7));
const numCols = parseInt(width / (boxSize + 7));

const root = createRoot(document.getElementById("root"));
root.render(<Conway />);

function Conway() {
  const [grid, setGrid] = useState(getEmptyBoard(numRows, numCols));
  const currGrid = useRef(grid);
  currGrid.current = grid;

  const setGridState = (val) => {
    setGrid(val);
    currGrid.current = grid;
  };

  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  runningRef.current = running;

  const setRunningState = (val) => {
    setRunning(val);
    runningRef.current = val;
  };

  const updateTime = 500;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;

    // getting the next generation arr
    let tempArr = currGrid.current.map((row, i) =>
      row.map((ele, j) => getNextGen(currGrid.current, i, j))
    );

    setGridState(tempArr);

    setTimeout(() => {
      runSimulation();
    }, updateTime);
  }, []);

  function toggleClick(row, col) {
    if (running) setRunningState(false);

    let newGrid = getCopy(grid);
    // toggling the state of the  element
    newGrid[row][col] = !newGrid[row][col];
    setGridState(newGrid);
  }

  function toggleStart() {
    setRunningState(!running);
    runSimulation();
  }

  function clearBoard() {
    setRunningState(false);
    setGridState(getEmptyBoard(numRows, numCols));
  }

  function loadBoard() {
    const key = "board" + getKey(numRows, numCols);
    if (!(key in localStorage)) {
      alert("No board stored with current dimensions ");
      return;
    }
    const board = localStorage.getItem(key);
    setGridState(parseBoard(board));
    // parseBoard(board);
  }

  function generateRandomBoard() {
    let tempArr = [];
    for (let i = 0; i < numRows; i++) {
      tempArr.push(Array.from(Array(numCols), () => randInt(0, 1)));
    }
    setGridState(tempArr);
  }

  function saveBoard() {
    try {
      let key = getKey(numRows, numCols);
      localStorage.setItem("board" + key, getStorageObject(grid));
      alert("Sucessfully saved!");
    } catch {
      alert("Failed to save the board");
    }
  }

  return (
    <>
      <div id="settings">
        <button onClick={clearBoard}>Clear</button>
        <button onClick={generateRandomBoard}>Random</button>
        <button
          style={{
            color: running ? "grey" : "green",
          }}
          onClick={toggleStart}
        >
          {running ? <Pause /> : <Play />}
        </button>
        <button onClick={saveBoard}>Save</button>
        <button onClick={loadBoard}>Load</button>
      </div>
      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${numCols}, ${boxSize}px)`,
        }}
      >
        {grid.map((row, i) =>
          row.map((alive, j) => (
            <div
              onClick={() => toggleClick(i, j)}
              className="board-ele"
              key={`${i}-${j}`}
              style={{
                width: boxSize,
                height: boxSize,
                backgroundColor: alive ? "#ff2f90" : "#1F1F1F",
              }}
            ></div>
          ))
        )}
      </div>
    </>
  );
}

function Pause() {
  return <i className="fa-solid fa-pause"></i>;
}
function Play() {
  return <i className="fa-solid fa-play"></i>;
}

function getNextGen(grid, row, col) {
  let nxtIsAlive = false;
  const neighbours = getNumNeighbours(grid, row, col);

  switch (neighbours) {
    case 1:
      nxtIsAlive = false;
      break;
    case 2:
      nxtIsAlive = true && grid[row][col];
      break;
    case 3:
      nxtIsAlive = true;
      break;
    default:
      break;
  }
  return nxtIsAlive;
}

function inBounds(i, j) {
  return i >= 0 && i < numRows && j >= 0 && j < numCols;
}

function getNumNeighbours(grid, row, col) {
  let numNeighbours = 0;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i == 0 && j == 0) continue;
      let newI = row + i;
      let newJ = col + j;

      if (inBounds(newI, newJ)) {
        numNeighbours += grid[newI][newJ];
      }
    }
  }
  return numNeighbours;
}

function getCopy(arr) {
  // returns a copy of the  arr
  return arr.map((row) => {
    return row.slice();
  });
}

function getStorageObject(grid) {
  /*  converts arr obj to string
  | 0 0 0 |
  | 1 1 0 | => '0, 0, 0 - 1, 1, 0 - 0, 0, 1'
  | 0 0 1 |
  */
  return grid.map((col) => col.join(",")).join("-");
}

function parseBoard(str) {
  /*  converts string to arr.
  | 0 0 0 |
  | 1 1 0 | <= '0, 0, 0 - 1, 1, 0 - 0, 0, 1'
  | 0 0 1 |
  */
  let cols = str.split("-");
  // string to Grid
  let arr = cols.map((col) => col.split(",").map((ele) => toBool(ele)));
  return arr;
}

function toBool(a) {
  if (a == false || a == "false") {
    return false;
  }
  return true;
}

function getKey(rows, cols) {
  return `${rows}-${cols}`;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getEmptyBoard(rows, cols) {
  // Creates  a 2D board filled  with 0's
  let returnArr = [];
  for (let i = 0; i < rows; i++) {
    returnArr.push(Array.from(Array(cols), () => 0));
  }
  return returnArr;
}
