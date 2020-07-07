import * as chalk from 'chalk';
import * as boxen from 'boxen';
import * as figures from 'figures';
import {URL} from 'url';
import * as Handlebars from 'handlebars';
import * as fs from 'fs-extra';
import * as shell from 'shelljs';
import * as path from 'path';

import {firstToUpper, Label} from './utility';
import {LabDescriptor, loadLabDescriptor} from './labdescriptor';
import {IIITHExperiment, Experiment} from './experiment';


export type ContentKind = 'Introduction'
    | 'Objective'
    | 'ListOfExperiments'
    | 'NestedListOfExperiments'
    | 'TargetAudience'
    | 'CourseAlignment'
    | 'Feedback';

export function contentKind(c: string) : ContentKind {
    switch(c) {
        case 'Introduction':
            return 'Introduction'; 
        case 'Objective':
            return 'Objective';
        case 'ListOfExperiments':
            return 'ListOfExperiments'; 
        case 'NestedListOfExperiments':
            return 'NestedListOfExperiments';
        case 'TargetAudience':
            return 'TargetAudience';
        case 'CourseAlignment':
            return 'CourseAlignment';
        case 'Feedback':
            return 'Feedback';
        default:
            throw Error('INVALID_CONTENT_TYPE');
    }
}

export interface Content {
    kind: ContentKind,
    data: any
}

export function introductionContent(data: any) : Content {
    return {
        kind: 'Introduction',
        data: data
    };
}

export function listOfExperimentsContent(data: any) : Content {
    if (data.experiments) {
        data.experiments = data.experiments.map( (e: any) => {
            e.link = `${e['short-name']}.html`;       
            return e;
        });
        return {
            kind: 'ListOfExperiments',
            data: data
        };
    }
    else {
        data.experimentSections = data.experimentSections.map( (es: any) => {
            es.experiments = es.experiments.map( (e: any) => {
                e.link = `${e['short-name']}.html`;       
                return e;
            });
            return es;
        });
        return {
            kind: 'NestedListOfExperiments',
            data: data
        };
    }
}
export function objectiveContent(data: any) : Content {
    return {
        kind: 'Objective',
        data: data
    };
}
export function targetAudienceContent(data: any) : Content {
    return {
        kind: 'TargetAudience',
        data: data
    };
}
export function courseAlignmentContent(data: any) : Content {
    return {
        kind: 'CourseAlignment',
        data: data
    };
}

export function feedbackContent(data: any) : Content {
    return {
        kind: 'Feedback',
        data: data
    };
}


export interface PageConfig {
    heading: string;
    template: ContentKind;
    outfn: string;
}


export class Lab {

    static skeleton_fn: string = 'template/skeleton.handlebars';
    static pagesConfig: PageConfig[] = [
        {
            heading: 'Introduction',
            template: contentKind('Introduction'),
            outfn: 'Introduction'
        },
        {
            heading: 'Objective',
            template: contentKind('Objective'),
            outfn: 'Objective'
        },
        {
            heading: 'List of Experiments',
            template: contentKind('ListOfExperiments'),
            outfn: 'ListOfExperiments'
        },
        {
            heading: 'List of Experiments',
            template: contentKind('NestedListOfExperiments'),
            outfn: 'ListOfExperiments'
        },
        {
            heading: 'TargetAudience',
            template: contentKind('TargetAudience'),
            outfn: 'TargetAudience'
        },
        {
            heading: 'CourseAlignment',
            template: contentKind('CourseAlignment'),
            outfn: 'CourseAlignment'
        },
        {
            heading: 'Feedback',
            template: contentKind('Feedback'),
            outfn: 'Feedback'
        }
    ];

    name: Label;
    localPath: string;
    discipline: Label;
    college: string;
    phase: number;
    host: string;
    experiments: (Experiment[]|undefined);
    rawPageContents: any;
    options?: any;

    constructor(name: Label, localPath: string, discipline: Label, college: string, 
                phase: number, host: string, experiments: (Experiment[]|undefined), 
                rawPageContents: any, options: any) {
        this.name = name;
        this.localPath = localPath;
        this.discipline = discipline;
        this.college = college;
        this.phase = phase;
        this.host = host;
        this.experiments = experiments;
        this.rawPageContents = rawPageContents;
        this.options = options;
    }
    
    version(level: string) : string {
        shell.cd(path.resolve(this.localPath));
        let tag = shell.exec(`git tag -l`);
        let [major, minor, patch] = 'v1.0.0'.slice(1).split('.').map(parseFloat);
    
        if (level === 'major'){
            return `v${major+1}.${minor}.${patch}`;
        }            
        if (level === 'minor'){
            return `v${major}.${minor+1}.${patch}`;
        }            
        if (level === 'patch'){
            return `v${major}.${minor}.${patch+1}`;
        }
        else {
            shell.cd(process.cwd());
            throw Error('invalid level');   
        }
        
    }
    describe() : void {
        const head = chalk`{italic {yellow LAB INFO} }`;
        const ln = chalk`{bold Lab Name}   :  ${this.name.toString()}`;
        const d = chalk`{bold Discipline} :  ${this.discipline.toString()}`;
        const p = chalk`{bold Phase}      :  ${this.phase}`;
        const u = chalk`{bold URL}        :  ${this.url()}`;
    
        console.log(boxen(`${head}\n\n${ln}\n${d}\n${p}\n${u}`, {padding: 1, margin: 1, borderColor: 'cyan'}));
    }
    url() : URL {
        return (new URL(this.name.toPathName(), this.host));
    }
    
    getContent(kind: ContentKind, src: object) : Content {
        switch(kind) {
            case contentKind('Introduction'):
                return introductionContent(src);
            case contentKind('ListOfExperiments'):
                return listOfExperimentsContent(src);
            case contentKind('NestedListOfExperiments'):
                return listOfExperimentsContent(src);
            case contentKind('Objective'):
                return objectiveContent(src);
            case contentKind('CourseAlignment'):
                return courseAlignmentContent(src);
            case contentKind('TargetAudience'):
                return targetAudienceContent(src);
            case contentKind('Feedback'):
                return feedbackContent(src);
            default:
                throw Error('INVLID_CONTENT_KIND');
        }
    }
    
    
    
    page(cfg: PageConfig) : void {
        const data = this.getContent(cfg.template, this.rawPageContents).data;
    
        const content = Handlebars.compile(
            fs.readFileSync(`template/${cfg.template}.handlebars`, 'utf-8')
        )(data);
    
        const html = Handlebars.compile(fs.readFileSync(Lab.skeleton_fn, 'utf-8'))
        ({name: this.name,
          discipline: this.discipline,
          college: this.college,
          phase: this.phase,
          pageHeading: cfg.heading,
          content: content,
          hasObjective: this.rawPageContents.hasObjective,
          enable_analytics: false});
        fs.ensureFileSync(path.resolve(this.localPath, `src/lab/${cfg.outfn}.html`));
        fs.writeFileSync(path.resolve(this.localPath, `src/lab/${cfg.outfn}.html`), html, 'utf-8');
    }
    generatePages() : Lab {
    
        //const dest = this.name.toPathName();
    
        const dest = this.localPath;
    
        fs.copySync('build/lab-structure', `${dest}`);   
        Lab.pagesConfig.filter((cfg: PageConfig) => {
            if ((cfg.template === contentKind('Objective')) && !(this.options.hasObjective)) {
                return false;
            }
            if ((cfg.template === contentKind('NestedListOfExperiments')) && !(this.options.isListNested)) {
                return false;
            }
            if ((cfg.template === contentKind('ListOfExperiments')) && (this.options.isListNested)) {
                return false;
            }
            return true;
        }).forEach((pc: PageConfig) => {
            this.page(pc);
        });
        return this;
    }
    
    summarize() : Lab {
        const head = chalk`{italic {yellow LAB INFO} }`;
        const ln = chalk`{bold Lab Name}   :  ${this.name.toString()}`;
        const d = chalk`{bold Discipline} :  ${this.discipline.toString()}`;
        const p = chalk`{bold Phase}      :  ${this.phase}`;
        const u = chalk`{bold URL}        :  ${this.url()}`;    
        console.log(boxen(`${head}\n\n${ln}\n${d}\n${p}\n${u}`, {padding: 1, margin: 1, borderColor: 'cyan'}));
        return this;
    }
    
    buildLab() : Lab {
        console.log(chalk`{cyan ${figures.circleDouble}}  Building Lab Sources`);
        const lp = this.localPath;
        shell.cd(lp);
        shell.exec('make all');
        shell.exec(`cd ${process.cwd()}`);
        console.log(chalk`    {green ${figures.tick}}  Lab Sources built successfully`);
        return this;
    }
    buildExperiments() : Lab {
        console.log(chalk`\n{cyan ${figures.circleDouble}}  Building Experiments :: {yellow This may take a while}\n`);
        if (this.experiments){
            this.experiments.forEach((e) => e.build().deploy());            
        }
        return this;
    }
    deploy() : Lab {
        console.log('Deploying Lab');
    
        const lp = this.localPath;
        const labDest = path.resolve('/var/www/html/', this.name.toPathName());
    
        shell.mkdir('-p', labDest);
        shell.cp('-r', path.resolve(this.localPath, path.resolve(lp, `build/*`)), labDest);
    
        console.log(chalk`  {green Copied Lab to  to ${labDest}}`);
        return this;
    }
    updateSources(level: string) : Lab {
        shell.exec(`cd ${path.resolve(this.localPath)}`);
        console.log('Updating Sources');
        console.log();
        // insert tag in descriptor
        shell.exec(`git add src/`);
        shell.exec(`git add lab-descriptor.json`);
        shell.exec(`git commit -m '${this.version(level)}'`);
        shell.exec(`git tag -a '${this.version(level)}' -m '${this.version(level)}'`);
        shell.exec(`git push origin '${this.version(level)}'`);
        //shell.exec(`cd ${process.cwd()}`);
        return this;
    }
}


export function fromDescriptor(fn: string) : Lab {
    const ld: LabDescriptor = loadLabDescriptor(fn);
    const name: Label = new Label(ld.lab);
    const localPath: string = path.dirname(fn);
    const discipline: Label = new Label(ld.broadArea.name);
    const college: string = ld.collegeName;
    const phase: number = ld.phase;
    const host: string = ld.baseUrl;
    const rawContents: any = { introduction: ld.introduction,
                               objective: ld.objective,
                               hasObjective: (ld.objective ? true : false),
                               experiments: ld.experiments,
                               experimentSections: ld.experimentSections,
                               targetAudience: ld.targetAudience,
                               courseAlignment: ld.courseAlignment,
                               feedback: {}
                             };
    const experiments: (Experiment[]|undefined) = loadExperiments(ld);
    const options: any = { enable_analytics: false,
                           hasObjective: (ld.objective ? true : false),
                           isListNested: (ld.experimentSections ? true : false),
                         };
    return (new Lab(name, localPath, discipline, college, phase, host,
                    experiments, rawContents, options));
}

function loadExperiments(ld: LabDescriptor) : (Experiment[]|undefined) {
    if (ld.experimentSections) {
        return ld.experimentSections
            .map((es: any) => es.experiments)
            .flat()
            .map((e: any) => {
                return (new IIITHExperiment(e.name, e['short-name'],
                                            new URL(e.repo), e.tag, new Label(ld.lab)));
            });
    }
    else {
        if (ld.experiments){
            return ld.experiments
            .map((e: any) => {
                return (new IIITHExperiment(e.name, e['short-name'], 
                                            new URL(e.repo), e.tag, new Label(ld.lab)));
            });
        }        
    }
}
