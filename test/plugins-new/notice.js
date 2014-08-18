var coffea = require('../..');
var Stream = require('stream').PassThrough;

describe('notice.js', function() {
	describe('on NOTICE', function() {
		it('should emit "notice" [single-network]', function (done) {
            var client = coffea();
            var st1 = new Stream();
            var st1_id = client.add(st1);
            client.nick('troll', st1_id);

			client.once("notice", function (event) {
				event.from.getNick().should.equal('troll');
                event.to.should.equal('#test');
                event.message.should.equal('This pings a lot of clients. You mad? \\:D/');
				done();
			});

			st1.write(':troll!pro@troll.co NOTICE #test :This pings a lot of clients. You mad? \\:D/\r\n');
		});

		it('should emit "notice" [multi-network]', function (done) {
            var client = coffea();
            var st1 = new Stream();
            var st2 = new Stream();
            var st1_id = client.add(st1);
            var st2_id = client.add(st2);
            client.nick('N', st1_id);
            client.nick('troll', st2_id);

			client.once("notice", function (event) {
				if (event.network === st1_id) {
					event.from.getNick().should.equal('NickServ');
                	event.to.should.equal('foo');
                	event.message.should.equal('This nickname is registered. Please choose a different nickname, or identify via /msg NickServ identify <password>.');
				} else {
					event.from.getNick().should.equal('troll');
                	event.to.should.equal('#test');
                	event.message.should.equal('This pings a lot of clients. You mad? \\:D/');
				}
			});

			st1.write(':NickServ!NickServ@services. NOTICE foo :This nickname is registered. Please choose a different nickname, or identify via /msg NickServ identify <password>.\r\n');
			st2.write(':troll!pro@troll.co NOTICE #test :This pings a lot of clients. You mad? \\:D/\r\n');
		
			done();
		});

		it('should emit "{network}:notice" [multi-network]', function (done) {
            var client = coffea();
            var st1 = new Stream();
            var st2 = new Stream();
            var st1_id = client.add(st1);
            var st2_id = client.add(st2);
            client.nick('NickServ', st1_id);
            client.nick('troll', st2_id);

			client.once(st1_id + ":notice", function (event) {
				event.from.getNick().should.equal('NickServ');
                event.to.should.equal('foo');
                event.message.should.equal('This nickname is registered. Please choose a different nickname, or identify via /msg NickServ identify <password>.');
			});

			client.once(st2_id + ":notice", function (event) {
				event.from.getNick().should.equal('troll');
                event.to.should.equal('#test');
                event.message.should.equal('This pings a lot of clients. You mad? \\:D/');
			});

			st1.write(':NickServ!NickServ@services. NOTICE foo :This nickname is registered. Please choose a different nickname, or identify via /msg NickServ identify <password>.\r\n');
			st2.write(':troll!pro@troll.co NOTICE #test :This pings a lot of clients. You mad? \\:D/\r\n');
		
			done();
		});
	});
});
