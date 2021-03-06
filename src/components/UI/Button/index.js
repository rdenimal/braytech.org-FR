import React from 'react';
// import { compose } from 'redux';
// import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import cx from 'classnames';

import './styles.css';

class DestinyKey extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  buttons = {
    1: {
      settings: [
        {
          char: ''
        }
      ],
      dismiss: [
        {
          color: '#f44336',
          char: ''
        },
        {
          char: ''
        }
      ],
      more: [
        {
          color: '#ffc107',
          char: ''
        },
        {
          char: ''
        }
      ],
      accept: [
        {
          color: '#598652',
          char: ''
        },
        {
          char: ''
        }
      ],
      modify: [
        {
          color: '#4769c7',
          char: ''
        },
        {
          char: ''
        }
      ]
    }
  };

  render() {
    const { type, platform = 1 } = this.props;

    return (
      <div className='destiny-key'>
        {this.buttons[platform][type].map((l, i) => {
          return (
            <span key={i} style={{ color: l.color }}>
              {l.char}
            </span>
          );
        })}
      </div>
    );
  }
}

class Button extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { className, text, children, action, invisible, disabled, lined, anchor } = this.props;

    if (anchor) {
      const onClick = action
        ? e => {
            if (action) {
              action(e);
            }
          }
        : this.props.onClick;

      return (
        <Link className={cx('button', className, { lined: lined, disabled: disabled, invisible: invisible })} onClick={onClick} to={this.props.to}>
          {text ? <div className='text'>{text}</div> : children}
        </Link>
      );
    } else {
      const onClick = action
        ? e => {
            if (action) {
              action(e);
            }
          }
        : this.props.onClick;

      return (
        <button className={cx('button', className, { lined: lined, disabled: disabled, invisible: invisible })} onClick={onClick}>
          {text ? <div className='text'>{text}</div> : children}
        </button>
      );
    }
  }
}

export { DestinyKey, Button };

export default Button;
