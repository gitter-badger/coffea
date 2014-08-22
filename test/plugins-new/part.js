var coffea = require('../..');
var Stream = require('stream').PassThrough;

describe('part.js', function() {
    describe('client.part()', function () {
        it('should part a channel without a message', function (done) {
            var client = coffea(false);
            var st1 = new Stream();
            var st1_id = client.add(st1);
            client.nick('test');

            client.once('data', function (data) {
                client.once('data', function (data) {
                    data.string.should.equal('PART #test');
                    done();
                });
            });

            client.part(['#test']);
        });

        it('should part a channel with a message', function (done) {
            var client = coffea(false);
            var st1 = new Stream();
            var st1_id = client.add(st1);
            client.nick('test');

            client.once('data', function (data) {
                client.once('data', function (data) {
                    data.string.should.equal('PART #test :This channel is boring!');
                    done();
                });
            });

            client.part(['#test'], 'This channel is boring!');
        });
    });

    describe('on PART', function() {
        it('should emit "part" [single-network]', function (done) {
            var client = coffea();
            var st1 = new Stream();
            var st1_id = client.add(st1);
            client.nick('foo', st1_id);

            client.once("part", function (event) {
                event.user.getNick().should.equal('foo');
                event.channels[0].getName().should.equal('#baz');
                event.channels[1].getName().should.equal('#bar');
                event.message.should.equal('Part');
                done();
            });

            st1.write(':foo!bar@baz.com PART #baz,#bar :Part\r\n');
        });

        it('should emit "part" [multi-network]', function (done) {
            var client = coffea();
            var st1 = new Stream();
            var st2 = new Stream();
            var st1_id = client.add(st1);
            var st2_id = client.add(st2);
            client.nick('ChanServ', st1_id);
            client.nick('foo', st2_id);

            client.once("part", function (event) {
                if (event.network === st1_id) {
                    event.user.getNick().should.equal('ChanServ');
                    event.channels[0].getName().should.equal('#services');
                    event.message.should.equal('');
                } else {
                    event.user.getNick().should.equal('foo');
                    event.channels[0].getName().should.equal('#baz');
                    event.channels[1].getName().should.equal('#bar');
                    event.message.should.equal('Part');
                }
                done();
            });

            st1.write(':ChanServ!ChanServ@services.in PART #services\r\n');
            st2.write(':foo!bar@baz.com PART #baz,#bar :Part\r\n');
        });

        it('should emit "{network}:part" [multi-network]', function (done) {
            var client = coffea();
            var st1 = new Stream();
            var st2 = new Stream();
            var st1_id = client.add(st1);
            var st2_id = client.add(st2);
            client.nick('ChanServ', st1_id);
            client.nick('foo', st2_id);

            var tests = 0;
            client.once(st1_id + ":part", function (event) {
                event.user.getNick().should.equal('ChanServ');
                event.channels[0].getName().should.equal('#services');
                event.message.should.equal('');
                tests++;
                if (tests >= 2) {
                    done();
                }
            });

            client.once(st2_id + ":part", function (event) {
                event.user.getNick().should.equal('foo');
                event.channels[0].getName().should.equal('#baz');
                event.channels[1].getName().should.equal('#bar');
                event.message.should.equal('Part');
                tests++;
                if (tests >= 2) {
                    done();
                }
            });

            st1.write(':ChanServ!ChanServ@services.in PART #services\r\n');
            st2.write(':foo!bar@baz.com PART #baz,#bar :Part\r\n');
        });
    });
});
