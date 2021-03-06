import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import * as enums from '../../../utils/destinyEnums';
import { sockets } from '../../../utils/destinyItems/sockets';
import { stats } from '../../../utils/destinyItems/stats';
import { masterwork } from '../../../utils/destinyItems/masterwork';
import { getOrnamentSocket } from '../../../utils/destinyItems/utils';
import ObservedImage from '../../ObservedImage';

import Default from './Default';
import Equipment from './Equipment';
import SubClass from './SubClass';
import Emblem from './Emblem';
import Mod from './Mod';

const woolworths = {
  equipment: Equipment,
  subclass: SubClass,
  emblem: Emblem,
  mod: Mod
}

class Item extends React.Component {
  render() {
    const { t, member } = this.props;
    const itemComponents = member.data && member.data.profile.itemComponents;
    const characterUninstancedItemComponents = member.data && member.data.profile.characterUninstancedItemComponents;

    const item = {
      itemHash: this.props.hash,
      itemInstanceId: this.props.instanceid || false,
      itemComponents: false,
      quantity: parseInt(this.props.quantity, 10) || 1,
      state: (this.props.state && parseInt(this.props.state, 10)) || 0,
      rarity: false,
      type: false,
    };

    const definitionItem = manifest.DestinyInventoryItemDefinition[item.itemHash];

    if (item.itemHash !== '343' && !definitionItem) {
      return null;
    }
  
    if (item.itemHash === '343' || definitionItem.redacted) {
      return (
        <>
          <div className='acrylic' />
          <div className={cx('frame', 'common')}>
            <div className='header'>
              <div className='name'>{t('Classified')}</div>
              <div>
                <div className='kind'>{t('Insufficient clearance')}</div>
              </div>
            </div>
            <div className='black'>
              <div className='description'>
                <pre>{t('Keep it clean.')}</pre>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (definitionItem?.inventory) {
      switch (definitionItem.inventory.tierType) {
        case 6:
          item.rarity = 'exotic';
          break;
        case 5:
          item.rarity = 'legendary';
          break;
        case 4:
          item.rarity = 'rare';
          break;
        case 3:
          item.rarity = 'uncommon';
          break;
        case 2:
          item.rarity = 'common';
          break;
        default:
          item.rarity = 'common';
      }

      if (definitionItem.itemType === 2) {
        item.type = 'equipment';
      } else if (definitionItem.itemType === 3) {
        item.type = 'equipment';
      } else if (definitionItem.itemType === 21) {
        item.type = 'equipment';
      } else if (definitionItem.itemType === 22) {
        item.type = 'equipment';
      } else if (definitionItem.itemType === 24) {
        item.type = 'equipment';
      } else if (definitionItem.itemType === 28) {
        item.type = 'equipment';
      } else if (definitionItem.itemType === 16) {
        item.type = 'subclass';
      } else if (definitionItem.itemType === 14) {
        item.type = 'emblem';
      } else if (definitionItem.itemType === 19) {
        item.type = 'mod';
      }

      item.screenshot = definitionItem.screenshot;
    }

    // subclass, artifact
    const hideScreenshotBuckets = [3284755031, 1506418338];

    // collects relevant instanced data for sockets and stats utils
    if (item.itemInstanceId && member.data && itemComponents?.instances?.data[item.itemInstanceId]) {
      const instancesTypes = ['instance', 'sockets', 'plugObjectives', 'reusablePlugs', 'perks', 'stats', 'objectives', 'talentGrids'];

      item.itemComponents = instancesTypes.reduce((obj, key) => {
        if (key === 'instance') {
          obj[key] = itemComponents.instances.data[item.itemInstanceId] || false;
          return obj;
        } else if (['plugObjectives', 'reusablePlugs', 'talentGrids'].includes(key)) {
          obj[key] = itemComponents[key].data[item.itemInstanceId] || false;
          return obj;
        } else {
          obj[key] = (itemComponents[key].data[item.itemInstanceId] && itemComponents[key].data[item.itemInstanceId][key]) || false;
          return obj;
        }
      }, {})
    }

    // what's this for?
    if (member.data && characterUninstancedItemComponents[member.characterId]?.objectives?.data[item.itemHash]) {
      if (item.itemComponents) {
        item.itemComponents.objectives = characterUninstancedItemComponents[member.characterId].objectives.data[item.itemHash].objectives;
      } else {
        item.itemComponents = {
          objectives: characterUninstancedItemComponents[member.characterId].objectives.data[item.itemHash].objectives
        };
      }
    }

    // what's this for?
    if (item.itemInstanceId && member.data && member.data.profile?.characterInventories?.data[member.characterId]?.items?.find(i => i.itemInstanceId === item.itemInstanceId)) {
      if (item.itemComponents) {
        item.itemComponents.item = member.data.profile.characterInventories.data[member.characterId].items.find(i => i.itemInstanceId === item.itemInstanceId);
      } else {
        item.itemComponents = {
          item: member.data.profile.characterInventories.data[member.characterId].items.find(i => i.itemInstanceId === item.itemInstanceId)
        };
      }
    }

    item.sockets = sockets(item);
    item.stats = stats(item);
    item.masterwork = masterwork(item);

    item.primaryStat = (definitionItem.itemType === 2 || definitionItem.itemType === 3) && definitionItem.stats && !definitionItem.stats.disablePrimaryStatDisplay && definitionItem.stats.primaryBaseStatHash && {
      hash: definitionItem.stats.primaryBaseStatHash,
      displayProperties: manifest.DestinyStatDefinition[definitionItem.stats.primaryBaseStatHash].displayProperties,
      value: 750
    };

    if (item.primaryStat && item.itemComponents && item.itemComponents.instance?.primaryStat) {
      item.primaryStat.value = item.itemComponents.instance.primaryStat.value;
    } else if (item.primaryStat && member && member.data) {
      let character = member.data.profile.characters.data.find(c => c.characterId === member.characterId);

      item.primaryStat.value = Math.floor((733 / 750) * character.light);
    }

    let importantText = false;
    if (!item.itemComponents && this.props.uninstanced) {
      importantText = t('Collections roll');
    }

    const Meat = item.type && woolworths[item.type];
    
    if (item.sockets) {
      const ornament = getOrnamentSocket(item.sockets);

      if (ornament && ornament.plug?.plugItem?.screenshot && ornament.plug?.plugItem?.screenshot !== '') {
        item.screenshot = ornament.plug.plugItem.screenshot;
      }
    }

    const masterworked = enums.enumerateItemState(item.state).masterworked || (definitionItem.itemType === enums.DestinyItemType.Armor ? item.masterwork?.stats?.filter(s => s.value > 9).length : item.masterwork?.stats?.filter(s => s.value >= 9).length);

    console.log(item)

    return (
      <>
        <div className='acrylic' />
        <div className={cx('frame', item.type, item.rarity, { 'masterworked': masterworked })}>
          <div className='header'>
            {masterworked ? <ObservedImage className={cx('image', 'bg')} src={item.rarity === 'exotic' ? `/static/images/extracts/flair/01A3-00001DDC.PNG` : `/static/images/extracts/flair/01A3-00001DDE.PNG`} /> : null}
            <div className='name'>{definitionItem.displayProperties && definitionItem.displayProperties.name}</div>
            <div>
              {definitionItem.itemTypeDisplayName && definitionItem.itemTypeDisplayName !== '' ? <div className='kind'>{definitionItem.itemTypeDisplayName}</div> : null}
              {item.rarity ? <div className='rarity'>{definitionItem.inventory.tierTypeName}</div> : null}
            </div>
          </div>
          {importantText ? <div className='important'>{importantText}</div> : null}
          <div className='black'>
            {this.props.viewport.width <= 600 && item.screenshot && !(definitionItem && definitionItem.inventory && hideScreenshotBuckets.includes(definitionItem.inventory.bucketTypeHash)) ? (
              <div className='screenshot'>
                <ObservedImage className='image' src={`https://www.bungie.net${item.screenshot}`} />
              </div>
            ) : null}
            {woolworths[item.type] ? <Meat {...member} {...item} /> : <Default {...member} {...item} />}
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    viewport: state.viewport,
    tooltips: state.tooltips
  };
}

export default compose(
  connect(mapStateToProps),
  withTranslation()
)(Item);
