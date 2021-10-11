import mongo from 'mongodb';
//import { AppErrors } from 'cs544-js-utils';

//use in mongo.connect() to avoid warning
const MONGO_CONNECT_OPTIONS = { useUnifiedTopology: true };

export default function makeAccountsDao(url, options){ return AccountsDao.makeAccountsDao(url, options);}

/** Return DAO for DB URL url and options. Only option is
 *  options.doClear; if specified, then all data should be cleared.
 * 
 *  Returned DAO should support a close() method.  
 *
 *  Returned DAO should also support a newAccount(), info(), newAct(),
 *  query() and statement() methods with each method taking a single
 *  params object as argument.  The params argument and return values
 *  for these methods are as documented for project 1.
 *
 *  It is assumed that params is fully validated except that id may
 *  not refer to an existing account.  Can also assume that values
 *  in params have been converted as necessary:
 * 
 *    params.amount:  Number in cents.
 *    params.index:   Number with default filled in.
 *    params.count:   Number with default filled in.
 *
 *  (see table in accounts-services.mjs for validations and conversions).
 *
 *  [Note that unlike project 1, there is no intermediate account()
 *  method or corresponding object, all methods operate directly on
 *  the returned DAO.]
 *
 */
class AccountsDao{
	constructor(props){
		Object.assign(this, props);
	}	
	
	//have two collections, accounts and transactions
	//each account document stores account id, holder id, and account balance
	//transaction document stores transaction id, account id, amount, date, and memo
	//also have collection counter, which stores the counter for generating ids
	static async makeAccountsDao(url, options) {
		try{
  			const client = await mongo.connect(url, MONGO_CONNECT_OPTIONS);
  			const db = client.db();
  			const accounts = db.collection('accounts');
  			const transactions = db.collection('transactions');
  			const counter = db.collection('counter');
  			//console.log(options);
  			if(options?.doClear) await accounts.deleteMany({}); await transactions.deleteMany({});
  			return new AccountsDao({client, accounts, transactions, counter});
  		} catch(err){
  			return errors('DB', err.toString());
  		}
	}
	//closes the database connection
	async close(){
		try{
			await this.client.close();
		}catch(err){
			return errors('DB', err.toString());
		}
	}
	//creates a new account
	async newAccount(params={}){
		try{
			const id = await this.genId();
			//console.log(id);
			await this.accounts.insertOne({_id: id, holderId: params.holderId, balance: 0});
			return id;
		}catch(err){
			return errors('DB', err.toString());
		}
	}
	//returns info about an account
	async info(params={}){
		try{
			const val = await this.findId(params.id);
			if(!val) return errors('NOT_FOUND', "account not found");
			const ret = await this.accounts.findOne({_id: params.id});
			return {id: ret._id, holderId: ret.holderId, balance: Number(ret.balance/100)};
		}catch(err){
			return errors('DB', err.toString());
		}
	}
	//creates a new transaction
	//needs to update account balance
	async newAct(params={}){
		try{
			const val = await this.findId(params.id);
			if(!val) return errors('NOT_FOUND', 'account not found');
			const id = await this.genId();
			await this.transactions.insertOne({_id: id, accId: params.id, amount: params.amount, date: params.date, memo: params.memo});
			//convert cents to regular money
			await this.accounts.updateOne({_id: params.id}, {$inc: {balance: params.amount}});
			return id;
		}catch(err){
			return errors('DB', err.toString());
		}
	}
	async query(params={}){
		try{
			//check that account id exists
			const val=await this.findId(params.id);
			if(!val) return errors('NOT_FOUND', 'account not found');
			//create filter object
			let filter = {accId: params.id};
			if(params.actId) filter._id = params.actId;
			if(params.date) filter.date = params.date;
			if(params.memoText) filter.memo = {$regex: params.memoText, $options: 'i'}; //replace this with a regex
			//find transactions that match the filter
			const cursor = await this.transactions.find(filter);
			let arr = await cursor.toArray();
			//if(params.memoText) console.log(arr);
			arr.sort(compareDates);
			let ret = [];
			let index=0;
			let count=5;
			if(params.index) index = params.index;
			if(params.count) count = params.count;
			for(let i=index; i<arr.length; i++){
				const t = arr[i];
				if(count === 0) break;
				const x ={actId: t._id, amount: t.amount, date: t.date, memo: t.memo};
				ret.push(x);
				count--;
			}
			return ret;
		}catch(err){
			return errors('DB', err.toString());
		}
	}
	async statement(params={}){
		try{
			const val = await this.findId(params.id);
			if(!val) return errors('NOT_FOUND', 'account not found');
			const cursor = await this.transactions.find({accId: params.id});
			let arr = await cursor.toArray();
			arr.sort(compareDates);
			let ret=[];
			let bal = 0;
			let from = '0000-00-00';
			let to = '9999-99-99';
			if(params.fromDate) from = params.fromDate;
			if(params.toDate) to = params.toDate;
			for(const t of arr){
				bal += t.amount;
				if((compareDate2(t.date, from)>=0) && (compareDate2(t.date, to)<=0)){
					const x = {actId: t._id, amount: t.amount, date: t.date, memo: t.memo, balance: Number(bal/100)};
					ret.push(x);
				}
			}
			return ret;
		}catch(err){
			return errors('DB', err.toString());
		}
	}
	//returns true if account with id exists, returns false otherwise
	//maybe add try catch here
	async findId(id){
		const ret = await this.accounts.findOne({_id: id});
		//console.log(id);
		//console.log(ret);
		if(ret === null) return false;
		else return true;
	}
	//returns an id
	async genId(){
		const query = {_id: 'a'};
		const update = {$inc: {val: 1}};
		const options = {upsert: true, returnDocument: 'after'};
		const ret = await this.counter.findOneAndUpdate(query, update, options);
		const seq = ret.value.val;
		const id = String(seq) + Math.random().toFixed(2).replace(/^0\./, '_');
		return id;
	}
}

function compareDates(trans1, trans2){
	const yearDif = Number(trans1.date.substring(0,4))-Number(trans2.date.substring(0,4));
	if(yearDif !=0) return yearDif;
	const monthDif = Number(trans1.date.substring(5,7))-Number(trans2.date.substring(5,7));
	if(monthDif !=0) return monthDif;
	return Number(trans1.date.substring(8))-Number(trans2.date.substring(8));
}

function compareDate2(date1, date2){
	const yearDif = Number(date1.substring(0,4))-Number(date2.substring(0,4));
	if(yearDif !=0) return yearDif;
	const monthDif = Number(date1.substring(5,7))-Number(date2.substring(5,7));
	if(monthDif !=0) return monthDif;
	return Number(date1.substring(8))-Number(date2.substring(8));
}

function genId(){
	return Math.random().toFixed(2);
}

function errors(c, msg){
	return {errors: [{message: msg, options: {code: c}}]};
}
