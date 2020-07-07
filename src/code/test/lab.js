import * as assert from = require('assert');
const chai = require('chai');
const should = chai.should();

const lab = require('../lab.js');

describe('Lab', function() {
    describe('Create', function() {
	it('should create a new Lab instance', function(){
	    const l = new lab.Lab();
	    l.should.be.an('Object');	    
	});
    });
});


