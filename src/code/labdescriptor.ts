import * as fs from 'fs-extra';

export interface LabDescriptor {
    broadArea : {name : string, link : string},
    lab: string,
    phase: number,
    collegeName: string,
    baseUrl: string,
    introduction: string,
    experiments?: object[],
    experimentSections?: object[],
    targetAudience: { UG : string[], PG: string[] },
    objective?: string,
    courseAlignment: {description: string, universities: string[]}
}

export function loadLabDescriptor(fn: string) : LabDescriptor {
    const ld = JSON.parse(fs.readFileSync(`${fn}`, 'utf-8'));
    if (ld["experiment-sections"]) {
        if (ld.experiments) {
            throw Error('INVALID_LAB_DESCRIPTOR');
        }
        ld.experimentSections = ld["experiment-sections"];
    } 
    return ld;
}
