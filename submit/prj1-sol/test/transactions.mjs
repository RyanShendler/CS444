
import accountsWrapper from './accounts-wrapper.mjs';

import chai from 'chai';
const { expect } = chai;

describe('transaction creation', () => {

  const TEST_HOLDER = 'Test Holder';
  const AMOUNT = 1.11;

  let accounts, act0, id;
  beforeEach(() => {
    accounts = accountsWrapper();
    id = accounts.newAccount({ holderId: TEST_HOLDER });
    act0 = { amount: String(AMOUNT), date: '2021-01-15', memo: 'test' };
  });
  
  it('should create a transaction without any errors', () => {
    const act = { id, ...act0 };
    expect(accounts.newAct(act)).to.be.a('string');
  });
  
  it('should retrieve balance after one successful transaction', () => {
    const act = { id, ...act0 };
    accounts.newAct(act);
    expect(accounts.info({id}).balance).to.equal(AMOUNT);
  });
  
  it('should return a BAD_REQ if creating a transaction without an account ID',
     () => {
       const act = { ...act0 };
       const err = accounts.newAct(act);
       expect(err).to.have.property('errors');
       expect(err.errors?.[0]?.options?.code).to.equal('BAD_REQ');
    });

  it('should return a BAD_REQ if creating a transaction without a date',
     () => {
       const act = { id, ...act0 };
       delete act.date;
       const err = accounts.newAct(act);
       expect(err).to.have.property('errors');
       expect(err.errors?.[0]?.options?.code).to.equal('BAD_REQ');
    });

  it('should return a BAD_REQ if creating a transaction without a amount',
     () => {
       const act = { id, ...act0 };
       delete act.amount;
       const err = accounts.newAct(act);
       expect(err).to.have.property('errors');
       expect(err.errors?.[0]?.options?.code).to.equal('BAD_REQ');
    });

  it('should return a BAD_REQ if creating a transaction with a bad amount',
     () => {
       const act = { id, ...act0 };
       act.amount = '1.1';
       const err = accounts.newAct(act);
       expect(err).to.have.property('errors');
       expect(err.errors?.[0]?.options?.code).to.equal('BAD_REQ');
    });

  it('should return a BAD_REQ if creating a transaction without a memo',
     () => {
       const act = { id, ...act0 };
       delete act.memo;
       const err = accounts.newAct(act);
       expect(err).to.have.property('errors');
       expect(err.errors?.[0]?.options?.code).to.equal('BAD_REQ');
    });

  it('should return a BAD_REQ if creating a transaction with a bad date',
     () => {
       const act = { id, ...act0 };
       act.date = '2021-02-29';
       const err = accounts.newAct(act);
       expect(err).to.have.property('errors');
       expect(err.errors?.[0]?.options?.code).to.equal('BAD_REQ');
    });

  
  
});
