const { printTable } = require('console-table-printer');
const secureRandom = require('secure-random');
const KEY = secureRandom.randomArray(32).join('');
const HMAC= require('crypto');

class GameArgs {
    constructor(rules) {
        this.rules = rules;
        this.computerMove;
    }
    GetRandomNum (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    get GetMove(){
        return this.computerMove = this.rules[this.GetRandomNum(0, this.rules.length - 1)]
    }

     CheckArgs(){
        for(let i = 0; i < this.rules.length; i++){
            for(let j = i + 1; j < this.rules.length; j++){
                if(this.rules[i].toLowerCase() === this.rules[j].toLowerCase()) return 'Similar Rules';
            }
        }
        if(this.rules.length <= 1){
            return '1 or no args';
        } else if(this.rules.length % 2 === 0){
           return 'Even args number';
        } else {
            return true;
        }
    }
}

class Key{
    constructor(key, hmac) {
        this.hmac = hmac;
        this.key  = key;
    }

    GetHmac(computerMove){
        this.msg = computerMove;
        this.hash = 'SHA-256';
        return this.hmac.createHmac('sha256', this.key).update(this.msg).digest('hex')
    }
}
class Rules extends GameArgs{
    constructor(rules, playerVar, computerVar, flag) {
        super(rules, playerVar, computerVar);
        this.rules = rules;
        this.flag = flag;
        this.computerVar = computerVar;
        this.playerVar = playerVar;
        this.playerIndex = this.rules.indexOf(this.playerVar) + 1;
        this.computerIndex = this.rules.indexOf(this.computerVar)
    }

    GetWinner () {
        if(!this.flag){
            console.log(`Computer Move: ${this.computerVar}`)
            console.log(`HMAC Key: ${KEY}`)
        }
        for(let i = 0; i < (this.rules.length - 1) / 2; i++){
            if(this.playerVar === this.computerVar){
                return 'Draw';
            }
            if(this.playerIndex === this.rules.length ){
                this.playerIndex = 0;
            }
            if(this.playerIndex === this.computerIndex){
                return 'Lose';
            }
            this.playerIndex++;
        }
        return 'Win ';
    }
}

class TableRules extends Rules{
    constructor(rules) {
        super(rules)
        this.rules = rules;
        this.playerVar;
        this.table = [];
    }
    PrintTable(){
        for (let i = 0; i < this.rules.length; i++) {
            this.computerVar = 0;
            this.playerVar = this.rules[i];
            this.obj = new Object();
            this.obj['User/PC'] = this.playerVar;
            for (let j = 0; j < this.rules.length; j++) {
                this.obj[this.rules[j]] = new Rules(process.argv.slice(2), this.playerVar, this.rules[j], true).GetWinner();
            }
            this.table.push(this.obj);
        }
        printTable(this.table);
        return '';
    }
}
class GameMenu extends GameArgs{
    constructor(rules) {
        super(rules)
        this.rules = rules;
        this.prompt= require('prompt-sync')()
        this.rulesVar;
    }

      ShowAvaiable(computerMove) {
        this.i = 1;
        this.key = new Key(KEY, HMAC)
          console.log('HMAC: ' + this.key.GetHmac(computerMove))
          console.log('Available moves:');
        for (let rule of this.rules) {
            console.log(`${this.i} - ${rule}`);
            this.i++;
        }
        console.log(`0 - exit`);
        console.log(`? - help`);
		this.playerVar = this.prompt();
		this.rulesVar = this.rules[this.playerVar - 1];
		console.log( `Your Move: ${this.rulesVar}`)
        return this.playerVar;
    }

    CheckPrompt (computerMove) {
        this.playerIndex = this.rules.indexOf(this.rulesVar)
        if (this.playerVar === '0') {
            return 'exit';
        } else if(this.playerVar === '?') {
            return new TableRules(process.argv.slice(2)).PrintTable();
        }
            while(this.playerIndex === -1){
                if (this.playerVar === '0') {
                    return 'exit';
                } else if(this.playerVar === '?') {
                    return new TableRules(process.argv.slice(2)).PrintTable();
                }
                console.log('Non-correct input');
                this.ShowAvaiable(computerMove);
                this.playerIndex = this.rules.indexOf(this.rulesVar)
            }
            return new Rules(this.rules, this.rulesVar, computerMove).GetWinner();
    }
}

function gameStart(){
    const gameArgs = new GameArgs(process.argv.slice(2))
    const computerMove = new GameArgs(process.argv.slice(2)).GetMove
    const gameMenu = new GameMenu(process.argv.slice(2))

    if(gameArgs.CheckArgs() === true){
        gameMenu.ShowAvaiable(computerMove)
    } else {
        return gameArgs.CheckArgs();
    }
    return gameMenu.CheckPrompt(computerMove);
}

console.log(gameStart())