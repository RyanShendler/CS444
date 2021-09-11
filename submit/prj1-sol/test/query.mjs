import { JAN, FEB, MAR } from './test-data.mjs';

const ALL = [ ...JAN, ...FEB, ...MAR ];

import accountsWrapper from './accounts-wrapper.mjs';

import chai from 'chai';
const { expect } = chai;

describe('query', () => {

  const TEST_HOLDER = 'Test Holder';

  let accounts, id, actIds;
  beforeEach(() => {
    accounts = accountsWrapper();
    id = accounts.newAccount({holderId: TEST_HOLDER});
    actIds = ALL.map(a => accounts.newAct({id, ...a}));
  });

  it('should return all transactions for query without filter', () => {
    expect(accounts.query({id, count: '999'}).length).to.equal(ALL.length);
  });

  it('should generate query results in order by date', () => {
    const id = accounts.newAccount({ holderId: TEST_HOLDER });
    [...ALL].reverse().forEach(a => accounts.newAct({id, ...a}));
    const results =  accounts.statement({id});
    expect(results.every((a, i, r) => i === 0 || a.date >= r[i - 1].date))
      .to.equal(true);
  });

  it('should return max DEFAULT_COUNT transactions for query without filter',
     () => {
    expect(accounts.query({id}).length).to.equal(accountsWrapper.DEFAULT_COUNT);
  });

  it('should return one transaction for a specified actId', () => {
    const actId = actIds[Math.floor(actIds.length/2)];
    expect(accounts.query({id, actId}).length).to.equal(1);
  });
  
  it('should return no transactions for a bad actId', () => {
    const actId = actIds[actIds.length/2] + 'xx';
    expect(accounts.query({id, actId}).length).to.equal(0);
  });
  
  it('should return no transactions for actId and non-matching date', () => {
    const actId = actIds[actIds.length/2] + 'xx';
    expect(accounts.query({id, actId, date: '2021-01-01'}).length).to.equal(0);
  });
  
  it('should return 2 transactions with memo containing "winter"', () => {
    const actId = actIds[actIds.length/2] + 'xx';
    expect(accounts.query({id, memoText: 'winter'}).length).to.equal(2);
  });
  
  it('should return 2 transactions with case-insensitive "wIntER" in memo',
     () => {
    const actId = actIds[actIds.length/2] + 'xx';
    expect(accounts.query({id, memoText: 'wIntER'}).length).to.equal(2);
  });
  
  it('should return 0 transactions for non-matching memoText',  () => {
    const actId = actIds[actIds.length/2] + 'xx';
    expect(accounts.query({id, memoText: 'xxx'}).length).to.equal(0);
  });

  it('should respect index and count', () => {
    const [index, count] = [2, 3];
    const actIds1 =
      accounts.query({id, index: String(index), count: String(count),});
    expect(actIds1.length).to.equal(count);
    expect(actIds1.map(a => a.id))
      .to.deep.equal(actIds.slice(index, index+count));
  });

  it('should detect BAD_REQ error for a bad date in query', () => {
    const err = accounts.query({id, date: '2021-02-29'});
    expect(err).to.have.property('errors');
    expect(err.errors?.[0]?.options?.code).to.equal('BAD_REQ');
  });

  it('should get all transactions for a particular date', () => {
    expect(accounts.query({id, date: '2021-01-10'}).length).to.equal(3);
  });

  it('should get no transactions for a inactive date', () => {
    expect(accounts.query({id, date: '2021-01-11'}).length).to.equal(0);
  });

});
