require('dotenv').load();
import assert from 'assert';
import HackForums from '../lib';

const client = new HackForums({show: true});

describe('Login tests', function() {
    it('can login', function() {
        return client.login(process.env.HF_USER, process.env.HF_PASS);
    });
});