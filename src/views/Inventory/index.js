import React from 'react';
import { connect } from 'react-redux';

import manifest from '../../utils/manifest';
import store from '../../store';
import * as bungie from '../../utils/bungie';
import * as enums from '../../utils/destinyEnums';
import Items from '../../components/Items';

import './styles.css';

const equipItem = (member) => (item) => async (e) => {
  console.log(item, member);
  try {
    await bungie.EquipItem({
      itemId: item.itemInstanceId,
      characterId: member.characterId,
      membershipType: member.membershipType,
    });

    store.dispatch({ type: 'MEMBER_IS_STALE', payload: member });
  } catch (e) {
    store.dispatch({
      type: 'PUSH_NOTIFICATION',
      payload: {
        error: true,
        date: new Date().toISOString(),
        expiry: 86400000,
        displayProperties: {
          name: e.errorStatus,
          description: e.message,
          timeout: 10,
        },
        javascript: e,
      },
    });
  }
};

function itemsInBucket(inventory, bucketHash, equipped) {
  return inventory.filter((item) => item.bucketHash === bucketHash && (equipped ? enums.enumerateTransferStatus(item.transferStatus).itemIsEquipped : !enums.enumerateTransferStatus(item.transferStatus).itemIsEquipped));
}

const bucketsWeapons = [enums.DestinyInventoryBucket.KineticWeapons, enums.DestinyInventoryBucket.EnergyWeapons, enums.DestinyInventoryBucket.PowerWeapons];
const bucketsArmor = [enums.DestinyInventoryBucket.Helmet, enums.DestinyInventoryBucket.Gauntlets, enums.DestinyInventoryBucket.ChestArmor, enums.DestinyInventoryBucket.LegArmor, enums.DestinyInventoryBucket.ClassArmor];
const bucketsAuxiliary = [enums.DestinyInventoryBucket.Ghost, enums.DestinyInventoryBucket.Vehicle, enums.DestinyInventoryBucket.Ships, enums.DestinyInventoryBucket.Emblems];

const slotsValue = 9;

function Inventory(props) {
  const member = { membershipType: props.member.membershipType, membershipId: props.member.membershipId, characterId: props.member.characterId };

  const inventory = [
    ...props.member.data.profile.profileInventory.data.items, // non-instanced quest items, materials, etc.
    ...props.member.data.profile.characterInventories.data[member.characterId].items, // non-equipped weapons etc
    ...props.member.data.profile.characterEquipment.data[member.characterId].items, // equipped weapons etc
  ];

  return (
    <div className='view' id='inventory'>
      <div className='equipment'>
        <div className='buckets weapons'>
          {bucketsWeapons.map((bucketHash, b) => (
            <div key={b} className='bucket'>
              <ul className='list inventory-items equipped'>
                <Items items={itemsInBucket(inventory, bucketHash, true)} />
              </ul>
              <ul className='list inventory-items'>
                <Items items={itemsInBucket(inventory, bucketHash)} placeholders={slotsValue} handler={equipItem(member)} />
              </ul>
            </div>
          ))}
        </div>
        <div className='buckets armor'>
          {bucketsArmor.map((bucketHash, b) => (
            <div key={b} className='bucket'>
              <ul className='list inventory-items equipped'>
                <Items items={itemsInBucket(inventory, bucketHash, true)} />
              </ul>
              <ul className='list inventory-items'>
                <Items items={itemsInBucket(inventory, bucketHash)} placeholders={slotsValue} handler={equipItem(member)} />
              </ul>
            </div>
          ))}
        </div>
        <div className='buckets auxiliary'>
          {bucketsAuxiliary.map((bucketHash, b) => (
            <div key={b} className='bucket'>
              <ul className='list inventory-items equipped'>
                <Items items={itemsInBucket(inventory, bucketHash, true)} />
              </ul>
              <ul className='list inventory-items'>
                <Items items={itemsInBucket(inventory, bucketHash)} placeholders={slotsValue} handler={equipItem(member)} />
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    member: state.member,
  };
}

export default connect(mapStateToProps)(Inventory);
