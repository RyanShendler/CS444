import React from 'react';

import Statement from './statement.jsx';
import ActAdd from './act-add.jsx';
import ActsSearch from './acts-search.jsx';

const SELECTS = {
  statement: 'Statement',
  actsSearch: 'Search Transactions',
  actAdd: 'Add Transaction',
};

export default function(props) {
  const [ selected, setSelected ] = React.useState('statement');
  const select = s => () => { if (s !== selected) setSelected(s); };
  const selClass = s => (s === selected) ? 'selected' : '';
  const alts = Object.entries(SELECTS).map(([k, v]) => {
    return <a onClick={select(k)} key={k} className={selClass(k)}>{v}</a>;
  });
  const selection = <div className="account-act" key="selection">{alts}</div>;
  const component = getComponent(selected, props);
  return [ selection, component ];
};

function getComponent(selected, props) {
  switch (selected) {
    case 'statement':
      return <Statement key='comp' {...props}/>;
    case 'actAdd':
      return <ActAdd key='comp' {...props}/>;
    case 'actsSearch':
      return <ActsSearch key='comp' {...props}/>;
    default:
      return null;
  }
}
