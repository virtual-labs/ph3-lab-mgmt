import * as path from 'path';
import * as fs from 'fs-extra';

class Page {

    static saveDir = 'pages';
    fn: string;

    constructor(fn: string) {
        this.fn = fn;
    }

    filePath() : string {
        return path.resolve(Page.saveDir, this.fn);
    }

    render() : string {
        return `<div> Trial </div>`;
    }
}

const p = new Page('..');
p.render();
class IntroductionPage extends Page {

    static filename : string = 'Introduction.html';
    content : string;

    constructor(content: string) {
        super(IntroductionPage.filename);
        this.content = content;
    }

    render() : string {
      return this.content;
    }

    save() : void {
        console.log(`writing to ${this.filePath()}`);
        fs.ensureFileSync(this.filePath());
        fs.writeFileSync(this.filePath(), this.content, 'utf-8');
    }
}


const ip = new IntroductionPage("hello kitty");
console.log(ip.render());
