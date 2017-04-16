import React, { Component } from 'react';
import classNames from 'classnames';
import './Game.css';


const getRandomInt = (min, max) => {
  return ~~(Math.random() * (max - min) + min);
};

const getPosFromRandomRange = (min, max) => {
  return getRandomInt(min, max) + '_' + getRandomInt(min, max);
};

const generateRandomMineArray = (mineCount, max) => {
  let mineArr = [];
  const min = 0;

  for (let i = 0; i <= mineCount; i++) {
    const randomPos = getPosFromRandomRange(min, max);

    if (mineArr.indexOf(randomPos) === -1 ) {
      mineArr.push(getPosFromRandomRange(min, max));
    }
  }

  return mineArr;
};

const checkSquareIsMine = (posX, posY, array) => {
  if (array[posX] && array[posX][posY] && array[posX][posY].isMine) {
    return true;
  }
};

// const checkSquareIsBlank = (posX, posY, array) => {
//   if (array[posX] && array[posX][posY] && array[posX][posY].isBlank) {
//     return true;
//   }
// };

const generatingField = (height, width, mineArr) => {
  let square = [];

  for (let i = 0; i <= height - 1; i++) {
    square[i] = [];

    for (let j = 0; j <= width - 1; j++) {
      square[i][j] = {
        pos: {
          i: i,
          j: j
        },
        isOpen: false,
        isMine: false,
        isBlow: false,
        isBlank: true,
        isMarked: false
      };

      // ['2_5', '7_1', '8_4', '9_9'];

      if (mineArr.indexOf(i + '_' + j) !== -1) {
        square[i][j].isMine = true;
      }
    }
  }

  // console.log('square', square);
  return square;
};

const setValuesOnField = (squaresArr) => {
  squaresArr.map((row, rowIndex, squares) => {
    return row.map((square, squareIndex) => {
      let val = null;

      if (checkSquareIsMine(rowIndex - 1, squareIndex - 1, squares)) { val++; }
      if (checkSquareIsMine(rowIndex - 1, squareIndex, squares)) { val++; }
      if (checkSquareIsMine(rowIndex - 1, squareIndex + 1, squares)) { val++; }

      if (checkSquareIsMine(rowIndex, squareIndex - 1, squares)) { val++; }
      if (checkSquareIsMine(rowIndex, squareIndex, squares)) { val++; }
      if (checkSquareIsMine(rowIndex, squareIndex + 1, squares)) { val++; }

      if (checkSquareIsMine(rowIndex + 1, squareIndex - 1, squares)) { val++; }
      if (checkSquareIsMine(rowIndex + 1, squareIndex, squares)) { val++; }
      if (checkSquareIsMine(rowIndex + 1, squareIndex + 1, squares)) { val++; }

      square.value = val;
      if (square.value) { square.isBlank = false; }
      return square;
    });
  });
};


class Game extends Component {
  constructor(props) {
    super(props);

    this.clickOnNewGame = this.clickOnNewGame.bind(this);
    this.downOnSquare = this.downOnSquare.bind(this);
    this.upOnSquare = this.upOnSquare.bind(this);

    this.state = {
      gameStatus: {
        isInit: false,
        isFail: false,
        isScarry: false
      },
      field: {
        width: 20,
        height: 20
      },
      mineCount: 51,
      squares: null
    };

  }

  componentWillMount() {
    this._init();
  }

  _init() {
    const {field, mineCount} = this.state;
    const mineArr = generateRandomMineArray(mineCount, field.width);

    let newField = generatingField(field.height, field.width, mineArr);

    setValuesOnField(newField);

    this.setState({
      squares: newField
    });
  }

  _setOpenCell(posX, posY) {
    let { squares } = this.state;

    squares[posX][posY].isOpen = true;

    this.setState({
      squares: squares
    });

  }

  _openAllBlanks(posX, posY) {
    let { squares } = this.state;

    // console.log('test');

    if (!squares[posX] || !squares[posX][posY]) { return; }

    if (!squares[posX][posY].isBlank) {
      this._setOpenCell(posX, posY);
      return;
    }

    if (squares[posX][posY].isOpen) { return; }

    this._setOpenCell(posX, posY);

      this._openAllBlanks(posX + 1, posY - 1);
      this._openAllBlanks(posX + 1, posY);
      this._openAllBlanks(posX + 1, posY + 1);

      this._openAllBlanks(posX, posY - 1);
      this._openAllBlanks(posX, posY);
      this._openAllBlanks(posX, posY + 1);

      this._openAllBlanks(posX - 1, posY - 1);
      this._openAllBlanks(posX - 1, posY);
      this._openAllBlanks(posX - 1, posY + 1);
  }

  clickOnNewGame() {
    this._init();

    this.setState({
      gameStatus: {
        isFail: false
      }
    });
  }

  clickOnMine(opt) {
    const { squares } = this.state;

    this.setState({
      squares: squares.map((square, index) => {
        if (square.isMine === true) {
          square.isBlow = true;
        }
        return square;
      }),
      gameStatus: {
        isFail: true
      }
    });
  }

  clickOnSquare(opt) {
    let { squares } = this.state;
    const { posX, posY } = opt;

    // if (!gameStatus.isInit) {
    //   if (squares[posX][posY].isBlank) {
    //     this.setState({
    //       gameStatus: {
    //         isInit: true
    //       }
    //     });
    //   } else {
    //     this._init();
    //   }
    // }

    if (squares[posX][posY].isBlank) {
      this._openAllBlanks(posX, posY);
      return false;
    }

    if (squares[posX][posY].isMarked) { return false; }

    if (squares[posX][posY].isMine) {
      this.setState({
        squares: squares.map(row => {
          return row.map(square => {
            if (square.isMine === true) {
              square.isBlow = true;
            }
            return square;
          });
        }),
        gameStatus: {
          isFail: true
        }
      });
      return false;
    }

    if (squares[posX][posY].isOpen) { return false; }

    squares[posX][posY].isOpen = true;
    this.setState({
      squares: squares
    });
  }

  rightClickOnSquare(opt, e) {
    e.preventDefault();
    const { squares } = this.state;
    const { posX, posY } = opt;

    if (squares[posX][posY].isOpen) { return false; }

    squares[posX][posY].isMarked = !squares[posX][posY].isMarked;

    this.setState({
      squares: squares
    });
  }

  downOnSquare() {
    this.setState({
      gameStatus: {
        isScarry: true
      }
    });
  }

  upOnSquare() {
    this.setState({
      gameStatus: {
        isScarry: false
      }
    });
  }

  render() {
    const { gameStatus, squares } = this.state;


    return (
      <div className="Game" onMouseUp={this.upOnSquare}>
        <a href="https://github.com/edbond88/minesweeper">https://github.com/edbond88/minesweeper</a>
        <nav className="statusBar" onClick={this.clickOnNewGame}>
          <span className="smile" onClick={this.clickOnNewGame}>
            {gameStatus.isFail
              ? <span>😧</span>
              : gameStatus.isScarry
                ? <span>😬</span>
                : <span>😊</span>
            }
          </span>
        </nav>
        <div className="field">
          {
            squares.map((row, rowIndex) => {
              return (
                <p className="row" key={rowIndex}>
                  {row.map((square, squareIndex) => {
                    const squareClasses = classNames('square', {
                      _open: square.isOpen,
                      _mine: square.isMine,
                      _blow: square.isBlow,
                      _marked: square.isMarked
                    });

                    return (
                      <span
                        onClick={this.clickOnSquare.bind(this,{posX: square.pos.i, posY: square.pos.j})}
                        onMouseDown={this.downOnSquare}
                        onContextMenu={this.rightClickOnSquare.bind(this,{posX: square.pos.i, posY: square.pos.j})}
                        className={squareClasses}
                        key={squareIndex}
                        id={rowIndex + '_' + squareIndex}
                      >
                        {square.isMarked
                          ? <span>🚩</span>
                          : square.isMine
                            ? square.isBlow ? <span>💣</span> : null
                            : square.isOpen
                              ? square.value
                              : null
                        }

                      </span>
                    );
                  })}
                </p>
              );
            })
          }
        </div>
        {gameStatus.isFail ? <span>Поражение</span> : null}
      </div>
    );
  }
}

export default Game;
