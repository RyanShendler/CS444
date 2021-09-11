import { JAN, FEB, MAR } from './test-data.mjs';

const ALL = [ ...JAN, ...FEB, ...MAR ];

import accountsWrapper from './accounts-wrapper.mjs';

import chai from 'chai';
const { expect } = chai;

describe('statement', () => {

  const TEST_HOLDER = 'Test Holder';

  let accounts, id;
  beforeEach(() => {
    accounts = accountsWrapper();
    id = accounts.newAccount({holderId: TEST_HOLDER});
  });
  
  it('should return correct balance after all transactions', () => {
    ALL.forEach(a => accounts.newAct({id, ...a}));
    const balance = ALL.reduce((acc, a) => acc + Number(a.amount), 0);
    const rounded = Number(balance.toFixed(2));
    expect(accounts.info({id}).balance).to.equal(rounded);
  });

  it('should have correct statement balance at end-of-month', () => {
    ALL.forEach(a => accounts.newAct({id, ...a}));
    const month = '2021-01';  //must be first month in data ALL
    const monthActs = ALL.filter(a => a.date.startsWith(month))
    const balance = monthActs.reduce((acc, a) => acc + Number(a.amount), 0);
    const rounded = Number(balance.toFixed(2));
    const statement = 
      accounts.statement({id, fromDate: `${month}-01`, toDate: `${month}-31`});
    expect(statement.length).to.equal(monthActs.length);
    expect(statement.slice(-1)[0].balance).to.equal(rounded);
  });

  it('should respect statement fromDate and toDate', () => {
    ALL.forEach(a => accounts.newAct({id, ...a}));
    const [fromDate, toDate] = [ FEB[0].date, FEB.slice(-1)[0].date ];
    const balance =
      [...JAN, ...FEB].reduce((acc, a) => acc + Number(a.amount), 0);
    const rounded = Number(balance.toFixed(2));
    const statement =  accounts.statement({id, fromDate, toDate});
    expect(statement.length).to.equal(FEB.length);
    expect(statement.map(a => a.memo)).to.deep.equal(FEB.map(a => a.memo));
    expect(statement.slice(-1)[0].balance).to.equal(rounded);
  });

  it('should generate statement in order by date', () => {
    ALL.reverse().forEach(a => accounts.newAct({id, ...a}));
    const statement =  accounts.statement({id});
    expect(statement.every((a, i, s) => i === 0 || a.date >= s[i - 1].date))
      .to.equal(true);
  });

});
