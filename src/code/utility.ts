import * as chalk from 'chalk';
import * as boxen from 'boxen';
import * as figures from 'figures';

export class Label {

    text: string;

    constructor(text: string) {
        //Label.validateLabel(text);
        this.text = text;
    }

    static validateLabel(text: string) : void {
    
        // casing validation
        if (text.search(/^[a-z]/g) === 0 || text.search(/ [a-z]/g) > 0) {
    	console.log(chalk`\n {red {bold ERROR ( LGE001 ) :}} {bold ${text}} is not a valid label`);
    	console.log(chalk` {green {bold Fix :}} ${text} ${figures.arrowRight} ${text.split(' ').map(firstToUpper).join(' ')}\n`);
    	throw Error('INVALID_LAB_DESCRIPTOR');
        }
    }
    toString () : string {
        return this.text;
    }
    toPathName() : string {
        return this.text.toLowerCase().trim().replace(/–/g, '').replace(/ +/g, '-');
    }
    
}

export function firstToUpper(w: string) : string {
    // converts first character of given word to uppercase.
    // computer => Computer
    return w[0].toUpperCase()+w.slice(1);
}
