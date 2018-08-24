import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Piano from './Piano/index';
import Staff from './Staff/index';

import motive from 'motive';

const NOTE_NAMES = [
  'C4',
  'C#4',
  'Db4',
  'D4',
  'D#4',
  'Db4',
  'E4',
  'E#4',
  'Eb4',
  'F4',
  'G4',
  'G#4',
  'Ab4',
  'A4',
  'Bb4',
  'B4',
  // 'C5',
  // 'C#5',
  // 'Db5',
  // 'D5',
  // 'D#5',
  // 'Db5',
  // 'E5',
  // 'E#5',
  // 'Eb5',
  // 'F5',
  // 'G5',
  // 'G#5',
  // 'Ab5',
  // 'A5',
];
function randomNote() {
  const note = NOTE_NAMES[Math.round(Math.random() * (NOTE_NAMES.length-1))];
  return motive.note(note);
}

class App extends Component {
  state = {
    note: randomNote(),
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>

        <Staff note={this.state.note} />

        <Piano
          startingPitch={motive.note('F3')}
          endingPitch={motive.note('C6')}
          whiteKeyWidth={30}
          onChange={(pitch, type) => {
            if (type === 'press') {
              const noteNameMatches = (this.state.note.midi % 12) === (pitch.midi % 12);
              if (noteNameMatches) {
                let note = this.state.note;
                while (note.midi === this.state.note.midi) {
                  note = randomNote();
                }
                this.setState({note});
              } else {
                // this.onFailedToPickNote();
                console.log(pitch)
              }
            }
          }}
        />
      </div>
    );
  }
}

export default App;
