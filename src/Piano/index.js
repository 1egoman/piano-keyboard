import React, { Fragment, Component } from 'react';
import motive from 'motive';

import './index.css';

function getPitchesInRange(starting, ending) {
  let pitches = [];
  for (let midi = starting.midi; midi <= ending.midi; midi++) {
    pitches.push(motive.note(midi))
  }
  return pitches;
}


const MIDI_KEY_PRESS = 144,
      MIDI_KEY_RELEASE = 128;

export default class Piano extends Component {
  state = {
    pressed: [],
    pitchTriggerSource: {},
    pressedForce: {},
  }

  async componentDidMount() {
    try {
      if (!navigator.requestMIDIAccess) {
        throw new Error('Midi interface unavailable in this browser.');
      }
      const midiAccess = await navigator.requestMIDIAccess();

      for (let input of midiAccess.inputs.values()) {
        input.onmidimessage = (event) => {
          const payload = event.data;
          switch (payload[0]) {

          case MIDI_KEY_PRESS:
            this.onPressKey(payload[1], 'midi', payload[2]);
            return;

          case MIDI_KEY_RELEASE:
            this.onReleaseKey(payload[1], 'midi');
            return;

          default:
            return;
          }
        }
      }
    } catch (err) {
      console.warn(err);
    }
  }

  static getDerivedStateFromProps(nextProps, oldState) {
    if (!nextProps.pressed) {
      return null;
    }

    const pressed = nextProps.pressed.map(i => i instanceof motive.constructors.Note ? i.midi : i);

    return {
      pressed: [
        ...oldState.pressed.filter(i => oldState.pitchTriggerSource[i] !== 'props'),
        ...pressed,
      ],
      pitchTriggerSource: {
        ...oldState.pitchTriggerSource,
        ...pressed.reduce((acc, i) => ({...acc, [i]: 'props'}), {}),
      },
    };
  }

  onPressKey = (midi, source='mouse', force=255) => {
    if (this.state.pressed.indexOf(midi) === -1) {
      this.props.onChange && this.props.onChange(motive.note(midi), 'press');
      this.setState({
        pressed: [...this.state.pressed, midi],
        pitchTriggerSource: {...this.state.pitchTriggerSource, [midi]: source},
        pressedForce: {...this.state.pressedForce, [midi]: force},
      });
    }
  }

  onReleaseKey = (midi, source='mouse') => {
    setTimeout(() => {
      this.props.onChange && this.props.onChange(motive.note(midi), 'release');
      this.setState(oldState => {
        return {
          pressed: oldState.pressed.filter(i => i !== midi),//&& oldState.pitchTriggerSource[i] !== 'mouse'),
        };
      });
    }, 0);
  }

  render() {
    const {
      startingPitch,
      endingPitch,
      renderNoteNames,
      onChange,
    } = this.props;
    const {
      pressed,
      // pressedForce,
    } = this.state;

    const whiteKeyWidth = this.props.whiteKeyWidth || 20;
    const blackKeyWidth = this.props.blackKeyWidth || (whiteKeyWidth / 2);
    const keyHeight = this.props.keyHeight || (whiteKeyWidth * 5);
    const blackKeyHeight = this.props.blackKeyHeight || (keyHeight * 0.66);

    const range = getPitchesInRange(startingPitch, endingPitch);

    let x = 0, y = 0;

    const keys = range.reduce((acc, pitch) => {
      if (pitch.parts.accidental === '') {
        // White key
        const value = (
          <Fragment key={pitch.midi}>
            <rect
              x={x}
              y={y}
              width={whiteKeyWidth}
              height={keyHeight}
              fill={pressed.indexOf(pitch.midi) !== -1 ? `#eee` : '#fefefe'}
              style={{cursor: 'pointer', transition: 'all 100ms ease-in-out'}}
              transform={pressed.indexOf(pitch.midi) !== -1 ? `translate(0, -5)` : ''}

              onMouseDown={() => this.onPressKey(pitch.midi, 'mouse')}
              onMouseEnter={e => e.buttons && this.onPressKey(pitch.midi, 'mouse')}
              onMouseLeave={() => this.onReleaseKey(pitch.midi, 'mouse')}
              onMouseUp={() => this.onReleaseKey(pitch.midi, 'mouse')}
            />
            <line
              x1={x}
              y1={y}
              x2={x}
              y2={y+keyHeight}
              stroke="#333"
              strokeWidth={1}
            />
            {renderNoteNames ? <text
              transform={`translate(${x + (whiteKeyWidth/2)}, ${keyHeight * 0.9})`}
              textAnchor="middle"
              style={{pointerEvents: 'none', userSelect: 'none'}}
              fontSize={whiteKeyWidth * 0.6}
              fill="#ccc"
            >{pitch.name}</text> : null}
          </Fragment>
        );
        x += whiteKeyWidth;
        return [value, ...acc];
      } else {
        // Black key
        return [...acc, (
          <rect
            key={pitch.midi}
            x={x - (blackKeyWidth / 2)}
            y={y}
            width={blackKeyWidth}
            height={blackKeyHeight}

            fill={pressed.indexOf(pitch.midi) !== -1 ? `#333` : '#black'}
            style={{cursor: 'pointer', transition: 'all 100ms ease-in-out'}}
            transform={pressed.indexOf(pitch.midi) !== -1 ? `translate(0, -5)` : ''}

            onMouseDown={() => this.onPressKey(pitch.midi, 'mouse')}
            onMouseEnter={e => e.buttons && this.onPressKey(pitch.midi, 'mouse')}
            onMouseLeave={() => this.onReleaseKey(pitch.midi, 'mouse')}
            onMouseUp={() => this.onReleaseKey(pitch.midi, 'mouse')}
          />
        )];
      }
    }, []);

    return (
      <svg width={x} height={keyHeight} viewBox={`0 0 ${x} ${keyHeight}`}>
        {keys}
        <line
          x1={x}
          y1={y}
          x2={x}
          y2={y+keyHeight}
          stroke="#333"
        />
      </svg>
    );
  }
}
