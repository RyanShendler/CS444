import { getDate } from './util.mjs';
import { DEFAULT_COUNT } from './defs.mjs';

import { makeValidator } from 'cs544-js-utils';

export function makeAccountsServices(dao) {
  const checker = makeValidator(CMDS);
  const fn = cmd => params => {
    const valid = checker.validate(cmd, params);
    return valid.errors ? valid : dao[cmd].call(dao, valid);
  };
  const services =
    Object.fromEntries(Object.keys(CMDS).map(c => [c, fn(c)]));
  services.help = help;
  return services;
}

const LINE_LENGTH = 72;
export function help(cmd=null, lineLength=LINE_LENGTH) {
  if (!cmd) {
    return ['help'].concat(Object.keys(CMDS)).sort()
      .map(c => help(c)).join('\n');
  }
  if (cmd === 'help') return `${cmd} [CMD]`;
  const fields = CMDS[cmd]?.fields;
  if (!fields) return `invalid command ${cmd}`;
  const params = Object.keys(fields).sort((f1, f2) => {
    const r1 = fields[f1].required ? 1 : 0;
    const r2 = fields[f2].required ? 1 : 0;
    return r1 !== r2 ? r2 - r1 : f1.localeCompare(f2);
  });
  const upcase = s => s.replace(/([a-z\d])([A-Z])/, '$1_$2').toUpperCase();
  const fieldHelp = f => {
    const msg = `${f}=${upcase(f)}`;
    return (fields[f].required) ? msg : `[${msg}]`;
  };
  let doc = CMDS[cmd].doc ?? '';
  const sp = ' '.repeat(2);
  doc = doc.replace(/\s*\n/, '').replace(/\s*$/, '').replace(/^\s*/mg, sp);
  if (doc) doc = '\n' + doc;
  const dashCmd = cmd.replace(/([a-z])([A-Z])/g,
			      (_, l, u) => `${l}-${u.toLowerCase()}`);
  let cmdStr = `${dashCmd} ` + params.map(fieldHelp).join(' ');
  if (cmdStr.length > LINE_LENGTH) {
    const split = cmdStr.lastIndexOf(' ', LINE_LENGTH);
    if (split >= 0) {
      const sp = ' '.repeat(cmd.length + 1);
      cmdStr = cmdStr.slice(0, split) + `\n${sp}` + cmdStr.slice(split + 1);
    }
  }
  return cmdStr + doc;
}

function chkDate(yyyymmdd) {
  const chk = getDate(yyyymmdd);
  return chk.errors ? chk.errors[0].message : '';
}

const CMDS = {
  newAccount: {
    fields: {
      holderId: {
        name: 'account holder ID',
        required: true,
      },
    },
    doc: `
      create a new account and return its ID.
    `,
  },

  info: {
    fields: {
      id: {
        name: 'account ID',
        required: true,
      },
    },
    doc: `
      return { id, holderId, balance } for account identified by id.
    `,
  },

  newAct: {
    fields: {
      id: {
        name: 'account ID',
        required: true,
      },
      amount: {
        name: 'transaction amount',
        chk: /[-+]?\d+\.\d\d/,
        valFn: valStr => Number(valStr.replace(/\./, '')),
        required: true,
      },
      date: {
        name: 'transaction date',
        chk: chkDate,
        required: true,
      },
      memo: {
        name: 'transaction memo',
        required: true,
      },
    },
    doc: `
      add transaction { amount, date, memo } to account id and
      return ID of newly created transaction.
    `,
  },

  query: {
    fields: {
      id: {
        name: 'account ID',
        required: true,
      },
      actId: {
        name: 'transaction ID',
      },
      date: {
        name: 'transaction date',
        chk: chkDate,
      },
      memoText: {
        name: 'memo substring',
      },
      index: {
        name: 'start index',
        chk: /\d+/,
        default: '0',
        valFn: valStr => Number(valStr),
      },
      count: {
        name: 'retrieved count',
        chk: /\d+/,
        default: String(DEFAULT_COUNT),
        valFn: valStr => Number(valStr),
      },
    },
    doc: `
      return list of { actId, amount, date, memo } of transactions
      for account id.
    `,
  },
    
  statement: {
    fields: {
      id: {
        name: 'account ID',
        required: true,
      },
      fromDate: {
        name: 'from date',
        chk: chkDate,
      },
      toDate: {
        name: 'to date',
        chk: chkDate,
      },
    },
    doc: `
      return list of { actId, amount, date, memo, balance } extended
      transactions for account id between fromDate and toDate.
    `,
  },
    
};
