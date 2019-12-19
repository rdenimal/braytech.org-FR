import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import { ProfileLink } from '../../../components/ProfileLink';
import { Button, DestinyKey } from '../../../components/UI/Button';

import Flashpoint from '../../../components/UserModules/Flashpoint';
import HeroicStoryMissions from '../../../components/UserModules/HeroicStoryMissions';
import VanguardStrikes from '../../../components/UserModules/VanguardStrikes';
import BlackArmoryForges from '../../../components/UserModules/BlackArmoryForges';
import DailyVanguardModifiers from '../../../components/UserModules/DailyVanguardModifiers';
import Ranks from '../../../components/UserModules/Ranks';
import SeasonPass from '../../../components/UserModules/SeasonPass';
import SeasonalArtifact from '../../../components/UserModules/SeasonalArtifact';
import Vendor from '../../../components/UserModules/Vendor';
import AuthUpsell from '../../../components/UserModules/AuthUpsell';
import Transitory from '../../../components/UserModules/Transitory';
import CharacterEquipment from '../../../components/UserModules/CharacterEquipment';
import SeasonCountdown from '../../../components/UserModules/SeasonCountdown';

import { moduleRules } from '../Customise';

import './styles.css';

class Now extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);

    this.props.rebindTooltips();
  }

  components = {
    AuthUpsell: {
      reference: AuthUpsell
    },
    Flashpoint: {
      reference: Flashpoint
    },
    DailyVanguardModifiers: {
      reference: DailyVanguardModifiers
    },
    HeroicStoryMissions: {
      reference: HeroicStoryMissions
    },
    SeasonalArtifact: {
      reference: SeasonalArtifact
    },
    Ranks: {
      reference: Ranks
    },
    SeasonPass: {
      reference: SeasonPass
    },
    BlackArmoryForges: {
      reference: BlackArmoryForges
    },
    Vendor: {
      reference: Vendor
    },
    CharacterEquipment: {
      reference: CharacterEquipment
    },
    SeasonCountdown: {
      reference: SeasonCountdown
    }
  };

  render() {
    const { t, auth, layout } = this.props;

    const userHead = {
      ...layout.groups.find(g => g.id === 'head'),
      type: 'user',
      className: ['head']
    };

    const userBody = layout.groups
      .filter(g => g.type === 'body')
      .map(group => {
        const className = [];

        if (group.cols.filter(c => c.mods.filter(m => moduleRules.full.filter(f => f === m.component).length).length).length) className.push('full');
        if (group.cols.filter(c => c.mods.filter(m => 'SeasonPass' === m.component).length).length) className.push('season-pass');

        const cols = group.cols.map(c => {
          const className = [];

          if (c.mods.filter(m => moduleRules.double.filter(f => f === m.component).length).length) className.push('double');

          return {
            ...c,
            className
          };
        });

        return {
          ...group,
          className,
          type: 'user',
          cols
        };
      });

    const modules = [
      userHead,
      {
        className: ['auth-upsell'],
        condition: !auth,
        components: ['AuthUpsell']
      },
      ...userBody
    ];

    return (
      <>
        <div className='groups'>
          {modules.map((group, g) => {
            if (group.components) {
              if (group.condition === undefined || group.condition) {
                return (
                  <div key={g} className={cx('group', ...(group.className || []))}>
                    {group.components.map((c, i) => {
                      const Component = this.components[c].reference;

                      return <Component key={i} />;
                    })}
                  </div>
                );
              } else {
                return null;
              }
            } else {
              const modFullSpan = group.cols.findIndex(c => c.mods.find(m => moduleRules.full.includes(m.component)));
              const modDoubleSpan = group.cols.findIndex(c => c.mods.find(m => moduleRules.double.includes(m.component)));

              const cols = modFullSpan > -1 ? group.cols.slice(0, 1) : modDoubleSpan > -1 ? group.cols.slice(0, 3) : group.cols;

              return (
                <div key={g} className={cx('group', ...(group.className || []))}>
                  {cols
                    .map((col, c) => {
                      if ((col.condition === undefined || col.condition) && col.mods.length) {
                        return (
                          <div key={c} className={cx('column', ...(col.className || []))}>
                            {col.mods.map((mod, m) => {
                              const Component = this.components[mod.component].reference;
                              const settings = (mod.settings || []).reduce(function(map, obj) {
                                map[obj.id] = obj.value;
                                return map;
                              }, {});

                              return (
                                <div key={m} className={cx('module', ...(mod.className || []))}>
                                  <Component {...settings} />
                                </div>
                              );
                            })}
                          </div>
                        );
                      } else {
                        return false;
                      }
                    })
                    .map(c => c)}
                </div>
              );
            }
          })}
        </div>
        <div className='sticky-nav'>
          <div className='wrapper'>
            <div />
            <ul>
              <li>
                <ProfileLink className='button' to='/now/customise'>
                  <DestinyKey type='modify' />
                  {t('Customise')}
                </ProfileLink>
              </li>
            </ul>
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    auth: state.auth,
    layout: state.layouts.now
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rebindTooltips: value => {
      dispatch({ type: 'REBIND_TOOLTIPS', payload: new Date().getTime() });
    }
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation())(Now);
