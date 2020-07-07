class Lab {
    name;
    discipline;
    college;
    phase;
    host;
    pages;

    constructor(name, discipline, college, phase, host, pages) {
        this.name = name;
        this.discipline = discipline;
        this.college = college;
        this.phase = phase;
        this.host = host;
        this.pages = pages;
    }
}

module.exports.Lab = Lab;
